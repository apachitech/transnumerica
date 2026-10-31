import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyApiAdminAuth, getClientIpAndUa } from '@/lib/server/auth-helpers';
import {
  getKycRequirementsMatrix,
  saveKycRequirementItem,
} from '@/lib/server/kyc-requirements-store';

const createItemSchema = z.object({
  code: z.string().min(3),
  category: z.enum(['IDENTITY', 'DRIVING', 'VEHICLE', 'COMPANY', 'FINANCIAL', 'SAFETY', 'CUSTOM']),
  labels: z.object({
    fr: z.string().min(2),
    en: z.string().default(''),
    ln: z.string().default(''),
    sw: z.string().default(''),
  }),
  helpTexts: z.object({
    fr: z.string().default(''),
    en: z.string().default(''),
    ln: z.string().default(''),
    sw: z.string().default(''),
  }).optional(),
  photoInstructionsFr: z.string().default(''),
  applicability: z.object({
    MOTO: z.enum(['MANDATORY', 'OPTIONAL', 'CONDITIONAL', 'NOT_APPLICABLE']),
    CAR: z.enum(['MANDATORY', 'OPTIONAL', 'CONDITIONAL', 'NOT_APPLICABLE']),
    SHUTTLE_OPERATOR: z.enum(['MANDATORY', 'OPTIONAL', 'CONDITIONAL', 'NOT_APPLICABLE']),
    SHUTTLE_DRIVER: z.enum(['MANDATORY', 'OPTIONAL', 'CONDITIONAL', 'NOT_APPLICABLE']),
  }),
  allowedFileTypes: z.array(z.string()).default(['image/jpeg', 'image/png']),
  maxSizeBytes: z.number().default(10485760),
  maxImagesCount: z.number().default(1),
  stepGroup: z.enum(['IDENTITY', 'DOCUMENTS', 'VEHICLE', 'FINANCIAL', 'LEGAL']).default('DOCUMENTS'),
  reason: z.string().min(3, 'Motif obligatoire'),
});

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'kyc_requirements.read' });
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || 'Accès refusé' }, { status: auth.status });
  }

  const { searchParams } = req.nextUrl;
  const city = searchParams.get('city') || undefined;
  const category = searchParams.get('category') || undefined;

  const matrix = getKycRequirementsMatrix({ city, category });
  return NextResponse.json({ success: true, ...matrix });
}

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'kyc_requirements.create' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error || 'Accès refusé' }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const parsed = createItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { reason, ...itemData } = parsed.data;
    const { ip } = getClientIpAndUa(req);

    const saved = saveKycRequirementItem(
      itemData,
      { id: auth.session.adminId, name: auth.session.name, role: auth.session.role },
      reason,
      ip
    );

    return NextResponse.json({ success: true, item: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur lors de la création' }, { status: 400 });
  }
}

