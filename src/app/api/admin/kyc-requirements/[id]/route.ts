import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyApiAdminAuth, getClientIpAndUa } from '@/lib/server/auth-helpers';
import {
  saveKycRequirementItem,
  deleteKycRequirementItem,
  getKycRequirementItemById,
} from '@/lib/server/kyc-requirements-store';

const updateItemSchema = z.object({
  labels: z.record(z.string(), z.string()).optional(),
  helpTexts: z.record(z.string(), z.string()).optional(),
  photoInstructionsFr: z.string().optional(),
  applicability: z.record(z.string(), z.string()).optional(),
  conditionRules: z.array(z.any()).optional(),
  plainFrenchConditionPreview: z.string().optional(),
  allowedFileTypes: z.array(z.string()).optional(),
  maxSizeBytes: z.number().optional(),
  maxImagesCount: z.number().optional(),
  fieldValidators: z.any().optional(),
  validityRules: z.any().optional(),
  reviewRules: z.any().optional(),
  livenessRules: z.any().optional(),
  sensitivityLevel: z.enum(['STANDARD', 'CONFIDENTIAL', 'STRICTLY_CONFIDENTIAL']).optional(),
  stepGroup: z.enum(['IDENTITY', 'DOCUMENTS', 'VEHICLE', 'FINANCIAL', 'LEGAL']).optional(),
  displayOrder: z.number().optional(),
  archived: z.boolean().optional(),
  reason: z.string().min(3, 'Motif obligatoire pour audit'),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = verifyApiAdminAuth(req, { permission: 'kyc_requirements.read' });
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || 'Accès refusé' }, { status: auth.status });
  }

  const { id } = await params;
  const item = getKycRequirementItemById(id);
  if (!item) return NextResponse.json({ error: 'Exigence introuvable' }, { status: 404 });

  return NextResponse.json({ success: true, item });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = verifyApiAdminAuth(req, { permission: 'kyc_requirements.update' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error || 'Accès refusé' }, { status: auth.status });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const parsed = updateItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { reason, ...updates } = parsed.data;
    const { ip } = getClientIpAndUa(req);

    const saved = saveKycRequirementItem(
      { ...updates, id } as any,
      { id: auth.session.adminId, name: auth.session.name, role: auth.session.role },
      reason,
      ip
    );

    return NextResponse.json({ success: true, item: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur lors de la mise à jour' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = verifyApiAdminAuth(req, { permission: 'kyc_requirements.delete' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error || 'Accès refusé' }, { status: auth.status });
  }

  const { id } = await params;
  const { searchParams } = req.nextUrl;
  const reason = searchParams.get('reason') || 'Suppression administrative';
  const { ip } = getClientIpAndUa(req);

  try {
    const res = deleteKycRequirementItem(
      id,
      { id: auth.session.adminId, name: auth.session.name },
      reason,
      ip
    );
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur lors de la suppression' }, { status: 400 });
  }
}

