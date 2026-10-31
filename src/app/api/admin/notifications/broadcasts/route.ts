import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import {
  getNotificationBroadcasts,
  saveNotificationBroadcast,
} from '@/lib/server/notifications-store';
import { notificationBroadcastInputSchema } from '@/lib/validations/notifications';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'notifications.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const broadcasts = getNotificationBroadcasts();
    return NextResponse.json(broadcasts);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'notifications.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = notificationBroadcastInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données de campagne invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const saved = saveNotificationBroadcast(body.id || null, parsed.data, auth.session.email || auth.session.name);
    return NextResponse.json(saved);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
