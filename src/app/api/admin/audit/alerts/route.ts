import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { detectSuspiciousPatterns, acknowledgeAlert } from '@/lib/server/audit-store';
import { acknowledgeAlertSchema } from '@/lib/validations/audit';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'audit.alerts.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const alerts = detectSuspiciousPatterns();
    return NextResponse.json({ alerts, total: alerts.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'audit.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = acknowledgeAlertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données d’acquittement invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const alertId = parsed.data.alertId || body.alertId;
    if (!alertId) {
      return NextResponse.json(
        { error: 'Identifiant de l’alerte (alertId) manquant' },
        { status: 400 }
      );
    }

    const ok = acknowledgeAlert(
      alertId,
      auth.session.name || auth.session.email,
      parsed.data.reason
    );

    return NextResponse.json({
      success: ok,
      message: 'Alerte acquittée et archivée avec justification consignée au journal d’audit.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
