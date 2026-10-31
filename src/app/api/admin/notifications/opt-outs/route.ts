import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import {
  getNotificationOptOuts,
  addNotificationOptOut,
  removeNotificationOptOut,
} from '@/lib/server/notifications-store';
import { optOutInputSchema } from '@/lib/validations/notifications';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'notifications.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const optOuts = getNotificationOptOuts();
    return NextResponse.json(optOuts);
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
    const parsed = optOutInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données de désinscription invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const created = addNotificationOptOut(parsed.data, auth.session.email || auth.session.name);
    return NextResponse.json(created);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'notifications.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Identifiant requis' }, { status: 400 });
  }

  try {
    const success = removeNotificationOptOut(id, auth.session.email || auth.session.name);
    return NextResponse.json({ success });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
