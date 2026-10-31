import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import {
  getNotificationTemplates,
  saveNotificationTemplate,
} from '@/lib/server/notifications-store';
import { notificationTemplateInputSchema } from '@/lib/validations/notifications';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'notifications.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || undefined;
  const category = searchParams.get('category') || undefined;

  try {
    const templates = getNotificationTemplates(search, category);
    return NextResponse.json(templates);
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
    const parsed = notificationTemplateInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données de modèle invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const saved = saveNotificationTemplate(body.id || null, parsed.data, auth.session.email || auth.session.name);
    return NextResponse.json(saved);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
