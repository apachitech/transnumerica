import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  verifyDriverApiAuth,
} from '@/lib/server/driver-auth';
import {
  getProviderById,
  saveOnboardingDraft,
  submitOnboarding,
  checkDuplicateProviderData,
} from '@/lib/server/provider-store';
import { resolveEffectiveRequirements } from '@/lib/server/kyc-requirements-store';
import { getClientIpAndUa } from '@/lib/server/auth-helpers';

const onboardingSaveSchema = z.object({
  providerId: z.string().optional(),
  providerType: z.enum(['MOTO', 'CAR', 'SHUTTLE']),
  role: z.enum(['DRIVER_MOTO', 'DRIVER_CAR', 'SHUTTLE_OPERATOR', 'SHUTTLE_STAFF']),
  city: z.string(),
  action: z.enum(['DRAFT', 'SUBMIT']).default('DRAFT'),
  individualProfile: z
    .object({
      fullName: z.string().optional(),
      birthDate: z.string().optional(),
      gender: z.enum(['MALE', 'FEMALE']).optional(),
      phone: z.string().optional(),
      residentialAddress: z.string().optional(),
      landmark: z.string().optional(),
      emergencyContactName: z.string().optional(),
      emergencyContactPhone: z.string().optional(),
      criminalRecordSubmitted: z.boolean().optional(),
      hasPassengerHelmet: z.boolean().optional(),
      helmetChecklistCompleted: z.boolean().optional(),
    })
    .optional(),
  companyProfile: z
    .object({
      companyName: z.string().optional(),
      legalForm: z.string().optional(),
      rccm: z.string().optional(),
      idNat: z.string().optional(),
      nif: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      transportLicenseNumber: z.string().optional(),
      legalRepName: z.string().optional(),
      legalRepPhone: z.string().optional(),
      legalRepEmail: z.string().optional(),
      legalRepRole: z.string().optional(),
    })
    .optional(),
  vehicle: z
    .object({
      type: z.enum(['MOTO', 'CAR', 'MINIBUS', 'BUS', 'COACH']).optional(),
      plate: z.string().optional(),
      make: z.string().optional(),
      model: z.string().optional(),
      color: z.string().optional(),
      year: z.number().optional(),
      capacitySeats: z.number().optional(),
      carteRoseNumber: z.string().optional(),
      photos: z.record(z.string(), z.string()).optional(),
      isOwner: z.boolean().optional(),
    })
    .optional(),
  payout: z
    .object({
      type: z.enum(['MOBILE_MONEY', 'BANK']).optional(),
      provider: z.enum(['MPESA', 'AIRTEL', 'ORANGE', 'AFRICELL', 'RAWBANK', 'EQUITY_BCDC']).optional(),
      accountNumber: z.string().optional(),
      accountName: z.string().optional(),
    })
    .optional(),
  consent: z
    .object({
      termsAccepted: z.boolean().optional(),
      safetyCodeAccepted: z.boolean().optional(),
      dataConsentAccepted: z.boolean().optional(),
    })
    .optional(),
});

export async function GET(req: NextRequest) {
  const auth = verifyDriverApiAuth(req);
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error || 'Non autorisé' }, { status: auth.status });
  }

  const provider = getProviderById(auth.session.providerId);
  if (!provider) {
    return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 });
  }

  const requirements = resolveEffectiveRequirements(
    provider.city,
    provider.providerType === 'SHUTTLE' ? 'SHUTTLE_OPERATOR' : provider.providerType,
    {
      isVehicleOwner: provider.vehicles[0]?.isOwner ?? true,
      vehicleAgeYears: provider.vehicles[0]?.year ? new Date().getFullYear() - provider.vehicles[0].year : 1,
    }
  );

  return NextResponse.json({
    provider,
    requirements,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = onboardingSaveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données de formulaire invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const { ip, ua } = getClientIpAndUa(req);

    // Check duplicate data
    const dupCheck = checkDuplicateProviderData(
      {
        phone: data.individualProfile?.phone || data.companyProfile?.legalRepPhone,
        plate: data.vehicle?.plate,
      },
      data.providerId
    );
    if (dupCheck.isDuplicate) {
      return NextResponse.json({ error: dupCheck.errorMessage }, { status: 409 });
    }

    // Save draft
    const provider = saveOnboardingDraft(data.providerId, {
      providerType: data.providerType,
      role: data.role,
      city: data.city,
      individualProfile: data.individualProfile,
      companyProfile: data.companyProfile,
      vehicle: data.vehicle,
      payout: data.payout,
      consent: data.consent ? { ...data.consent, ipAddress: ip, userAgent: ua } : undefined,
    });

    // If final submission
    if (data.action === 'SUBMIT') {
      const submitted = submitOnboarding(provider.id);
      return NextResponse.json({
        success: true,
        message: 'Dossier KYC soumis avec succès. Délai de traitement SLA : 24 heures.',
        provider: submitted,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Brouillon sauvegardé automatiquement',
      provider,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erreur lors de l’enregistrement du dossier' },
      { status: 500 }
    );
  }
}

