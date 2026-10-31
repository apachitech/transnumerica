import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { logAdminAction, reauthenticateSession, ADMIN_SESSION_COOKIE_NAME } from '@/lib/server/admin-store';
import { getVersionHistory, rollbackToVersion } from '@/lib/server/pricing-store';
import { RollbackPricingSchema } from '@/lib/validations/pricing';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'pricing.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const versions = getVersionHistory();
  return NextResponse.json({ versions });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const body = await req.json().catch(() => null);

  const parseResult = RollbackPricingSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Paramètres de restauration invalides', details: parseResult.error.format() },
      { status: 400 }
    );
  }

  if (token && parseResult.data.reauthCode) {
    reauthenticateSession(token, parseResult.data.reauthCode);
  }

  const auth = verifyApiAdminAuth(req, {
    permission: 'pricing.rollback',
    requireRecentReauth: true,
  });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const rollbackSnapshot = rollbackToVersion(
      parseResult.data.targetVersionNumber,
      auth.session.name,
      parseResult.data.reason
    );

    logAdminAction({
      adminUser: auth.session.name,
      action: 'ROLLBACK_SYSTEME_TARIFAIRE',
      target: `Barème tarifaire Transnumerica`,
      previousState: `Version active courante`,
      newState: `Restauration vers Version N° ${parseResult.data.targetVersionNumber}`,
      reason: parseResult.data.reason,
    });

    return NextResponse.json({
      success: true,
      message: `Restauration effectuée vers la version N° ${parseResult.data.targetVersionNumber}.`,
      rollbackSnapshot,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur lors de la restauration';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

