import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { updateScheduledReport, deleteScheduledReport } from '@/lib/server/analytics-store';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'analytics.reports.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const updated = updateScheduledReport(
      id,
      body,
      auth.session.email || auth.session.name
    );
    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'analytics.reports.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const reason = searchParams.get('reason') || 'Suppression du rapport automatique par l’administrateur';

  try {
    deleteScheduledReport(id, auth.session.email || auth.session.name, reason);
    return NextResponse.json({ success: true, message: 'Rapport supprimé avec succès' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

