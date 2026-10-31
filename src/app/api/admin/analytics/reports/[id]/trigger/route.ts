import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { triggerScheduledReport } from '@/lib/server/analytics-store';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'analytics.reports.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;
  try {
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || 'Déclenchement immédiat de test du rapport analytique';

    const result = triggerScheduledReport(
      id,
      auth.session.email || auth.session.name,
      reason
    );

    return NextResponse.json({
      success: true,
      message: `Rapport envoyé immédiatement avec succès aux destinataires (${result.sentTo.join(', ')})`,
      ...result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

