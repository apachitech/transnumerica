import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { supportStore } from '@/lib/server/support-store';
import { SupportEscalateSchema } from '@/lib/validations/support';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'support.escalate' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parseResult = SupportEscalateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Paramètres invalides', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const updated = supportStore.escalateTicket(
      id,
      parseResult.data.reason,
      auth.session.name || auth.session.email
    );

    return NextResponse.json({
      success: true,
      ticket: updated,
      message: 'Ticket escaladé en priorité CRITIQUE auprès du Superviseur Senior N2.',
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Erreur lors de l’escalade du ticket' },
      { status: 400 }
    );
  }
}
