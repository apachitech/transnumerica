import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import {
  getNotificationTemplateById,
  saveNotificationTemplate,
  toggleNotificationTemplate,
  deleteNotificationTemplate,
} from '@/lib/server/notifications-store';
import { notificationTemplateInputSchema } from '@/lib/validations/notifications';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const auth = verifyApiAdminAuth(req, { permission: 'notifications.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;
  const template = getNotificationTemplateById(id);
  if (!template) {
    return NextResponse.json({ error: 'Modèle de notification introuvable' }, { status: 404 });
  }

  return NextResponse.json(template);
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const auth = verifyApiAdminAuth(req, { permission: 'notifications.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();

    // Check if toggle action
    if (typeof body.isEnabled === 'boolean' && Object.keys(body).length <= 2) {
      const toggled = toggleNotificationTemplate(id, body.isEnabled, auth.session.email || auth.session.name);
      return NextResponse.json(toggled);
    }

    const parsed = notificationTemplateInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données de modèle invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const updated = saveNotificationTemplate(id, parsed.data, auth.session.email || auth.session.name);
    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const auth = verifyApiAdminAuth(req, { permission: 'notifications.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const reason = searchParams.get('reason') || 'Suppression administrative';

  try {
    const success = deleteNotificationTemplate(id, auth.session.email || auth.session.name, reason);
    if (!success) {
      return NextResponse.json({ error: 'Modèle introuvable' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Modèle supprimé avec succès' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
