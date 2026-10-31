import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { cancelBroadcast } from '@/lib/server/notifications-store';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const auth = verifyApiAdminAuth(req, { permission: 'notifications.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || 'Annulation manuelle de la campagne';
    const success = cancelBroadcast(id, auth.session.email || auth.session.name, reason);
    return NextResponse.json({ success, message: 'Campagne annulée' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
