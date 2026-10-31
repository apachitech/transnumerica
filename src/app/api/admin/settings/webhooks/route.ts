import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { getWebhooks, saveWebhook, getWebhookLogs } from '@/lib/server/settings-store';
import { webhookInputSchema } from '@/lib/validations/settings';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'settings.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const webhooks = getWebhooks();
    const logs = getWebhookLogs();
    return NextResponse.json({ webhooks, logs });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'integrations.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = webhookInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Paramètres de webhook invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const created = saveWebhook(parsed.data, auth.session.email || auth.session.name);
    return NextResponse.json(created);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

