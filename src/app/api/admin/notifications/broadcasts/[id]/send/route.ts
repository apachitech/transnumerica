import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { approveAndSendBroadcast } from '@/lib/server/notifications-store';
import { broadcastApprovalSchema } from '@/lib/validations/notifications';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  // Sensitive mass-broadcast action
  const auth = verifyApiAdminAuth(req, { permission: 'notifications.broadcast' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = broadcastApprovalSchema.safeParse({
      ...body,
      broadcastId: id,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Paramètres d’approbation de diffusion invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const completed = approveAndSendBroadcast(
      id,
      parsed.data.password,
      parsed.data.reason,
      auth.session.email || auth.session.name
    );

    return NextResponse.json(completed);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
