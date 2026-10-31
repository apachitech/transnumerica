import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { bookingsStore } from '@/lib/server/bookings-store';
import { BookingRefundSchema } from '@/lib/validations/bookings';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'payments.refund' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = BookingRefundSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Paramètres de remboursement invalides', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = bookingsStore.triggerRefund(
      id,
      parsed.data.amountMinor,
      parsed.data.reason,
      auth.session.name,
      parsed.data.version
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status || 400 });
    }

    return NextResponse.json({
      success: true,
      booking: result.booking,
      message: `Remboursement de ${parsed.data.amountMinor / 100} ${result.booking?.currency} initié avec succès.`,
    });
  } catch {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

