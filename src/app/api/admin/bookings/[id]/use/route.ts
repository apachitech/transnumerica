import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { bookingsStore } from '@/lib/server/bookings-store';
import { MarkTicketUsedSchema } from '@/lib/validations/bookings';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'bookings.validate' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = MarkTicketUsedSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Paramètres invalides', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = bookingsStore.markTicketUsed(
      id,
      parsed.data.ticketNumber,
      parsed.data.notes,
      auth.session.name,
      parsed.data.version
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status || 400 });
    }

    return NextResponse.json({
      success: true,
      booking: result.booking,
      message: 'Billet validé et marqué comme UTILISÉ (Embarqué).',
    });
  } catch {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

