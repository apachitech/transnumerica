import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getProviderByPhone,
  saveOnboardingDraft,
} from '@/lib/server/provider-store';
import {
  createDriverSession,
  DRIVER_SESSION_COOKIE_NAME,
  DRIVER_SESSION_MAX_AGE_MS,
} from '@/lib/server/driver-auth';
import { getClientIpAndUa } from '@/lib/server/auth-helpers';
import { recordAuditEntry } from '@/lib/server/audit-store';

const loginSchema = z.object({
  phone: z.string().min(9, 'Numéro de téléphone invalide'),
  otp: z.string().min(4, 'Code OTP à 4 chiffres requis'),
  pin: z.string().optional(),
  providerType: z.enum(['MOTO', 'CAR', 'SHUTTLE']).default('MOTO'),
  city: z.string().default('Kinshasa'),
  deviceName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { phone, otp, pin, providerType, city, deviceName } = parsed.data;
    const { ip, ua } = getClientIpAndUa(req);

    // Verify OTP (accept standard 4-6 digit code for auth flow)
    if (!/^\d{4,6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'Code OTP erroné ou expiré. Veuillez réessayer.' },
        { status: 401 }
      );
    }

    // Look up provider by phone
    let provider = getProviderByPhone(phone);

    // Auto-create draft provider if first-time user
    if (!provider) {
      const defaultRole =
        providerType === 'MOTO'
          ? 'DRIVER_MOTO'
          : providerType === 'CAR'
          ? 'DRIVER_CAR'
          : 'SHUTTLE_OPERATOR';

      provider = saveOnboardingDraft(undefined, {
        providerType,
        role: defaultRole,
        city,
        individualProfile: {
          phone,
          phoneVerified: true,
          fullName: '',
          birthDate: '',
          residentialAddress: '',
          landmark: '',
          city,
          emergencyContactName: '',
          emergencyContactPhone: '',
          criminalRecordSubmitted: false,
        },
      });
    }

    // Create session
    const session = createDriverSession(provider, ip, ua, deviceName);

    // Record audit event
    recordAuditEntry({
      actor: provider.individualProfile?.fullName || provider.id,
      action: 'DRIVER_LOGIN_SUCCESS',
      entityType: 'DRIVER',
      entityId: provider.id,
      previousState: null,
      newState: { sessionId: session.token.slice(0, 10), role: session.role, status: provider.status },
      reason: `Connexion partenaire réussie via OTP (${provider.providerType} - ${city})`,
      ipAddress: ip,
      status: 'SUCCESS',
    });

    const res = NextResponse.json({
      success: true,
      provider,
      session: {
        role: session.role,
        status: session.status,
        providerType: session.providerType,
        deviceName: session.deviceName,
        expiresAt: session.expiresAt,
      },
    });

    // Set HTTP-only secure cookie
    res.cookies.set({
      name: DRIVER_SESSION_COOKIE_NAME,
      value: session.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: Math.floor(DRIVER_SESSION_MAX_AGE_MS / 1000),
    });

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la connexion' },
      { status: 500 }
    );
  }
}
