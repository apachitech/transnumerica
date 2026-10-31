import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { sendTestNotification } from '@/lib/server/notifications-store';
import { testSendInputSchema } from '@/lib/validations/notifications';

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'notifications.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = testSendInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Paramètres d’envoi de test invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const result = sendTestNotification(parsed.data, auth.session.email || auth.session.name);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
