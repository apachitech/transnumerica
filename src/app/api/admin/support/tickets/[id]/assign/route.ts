import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { supportStore } from '@/lib/server/support-store';
import { SupportAssignSchema } from '@/lib/validations/support';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'support.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parseResult = SupportAssignSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Paramètres invalides', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const updated = supportStore.assignTicket(
      id,
      parseResult.data.agentId,
      parseResult.data.reason,
      auth.session.name || auth.session.email
    );

    return NextResponse.json({
      success: true,
      ticket: updated,
      message: `Ticket assigné avec succès à ${updated.assignedAgent?.name}.`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Erreur lors de l’assignation de l’agent' },
      { status: 400 }
    );
  }
}
