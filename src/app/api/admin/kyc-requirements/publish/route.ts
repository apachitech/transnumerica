import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyApiAdminAuth, getClientIpAndUa } from '@/lib/server/auth-helpers';
import {
  publishKycRequirementsVersion,
  getKycVersionsHistory,
} from '@/lib/server/kyc-requirements-store';

const publishSchema = z.object({
  city: z.string().default('ALL'),
  publishReason: z.string().min(5, 'Justification détaillée obligatoire pour audit'),
  effectiveDate: z.string().optional(),
  impactPolicy: z.enum(['GRANDFATHER', 'GRACE_PERIOD', 'IMMEDIATE_SUSPEND']).default('GRACE_PERIOD'),
  gracePeriodDays: z.number().default(21),
});

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'kyc_requirements.read' });
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || 'Accès refusé' }, { status: auth.status });
  }

  const history = getKycVersionsHistory();
  return NextResponse.json({ success: true, versions: history });
}

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'kyc_requirements.publish' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error || 'Accès refusé : permission de publication requise' }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const parsed = publishSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données de publication invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { ip } = getClientIpAndUa(req);
    const version = publishKycRequirementsVersion(
      parsed.data,
      {
        id: auth.session.adminId,
        name: auth.session.name,
        email: auth.session.email,
        role: auth.session.role,
      },
      ip
    );

    return NextResponse.json({
      success: true,
      message: `Version v${version.versionNumber} publiée avec succès et active sans redéploiement.`,
      version,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur lors de la publication' }, { status: 400 });
  }
}

