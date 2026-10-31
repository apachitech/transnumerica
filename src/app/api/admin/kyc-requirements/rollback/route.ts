import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyApiAdminAuth, getClientIpAndUa } from '@/lib/server/auth-helpers';
import { rollbackKycRequirementsVersion } from '@/lib/server/kyc-requirements-store';

const rollbackSchema = z.object({
  targetVersionNumber: z.number().int().positive(),
  reason: z.string().min(5, 'Motif impératif pour le rollback'),
});

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'kyc_requirements.rollback' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error || 'Accès refusé' }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const parsed = rollbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Paramètres invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { ip } = getClientIpAndUa(req);
    const rolledBack = rollbackKycRequirementsVersion(
      parsed.data.targetVersionNumber,
      { id: auth.session.adminId, name: auth.session.name, role: auth.session.role },
      parsed.data.reason,
      ip
    );

    return NextResponse.json({
      success: true,
      message: `Rollback vers la version v${parsed.data.targetVersionNumber} exécuté avec succès.`,
      version: rolledBack,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur lors du rollback' }, { status: 400 });
  }
}

