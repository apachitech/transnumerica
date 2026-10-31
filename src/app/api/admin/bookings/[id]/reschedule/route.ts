import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { bookingsStore } from '@/lib/server/bookings-store';
import { RescheduleBookingSchema } from '@/lib/validations/bookings';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'bookings.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = RescheduleBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Paramètres de report invalides', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = bookingsStore.rescheduleBooking(id, parsed.data, auth.session.name);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status || 400 });
    }

    return NextResponse.json({
      success: true,
      booking: result.booking,
      message: `Date de voyage reportée au ${parsed.data.newDepartureDate} à ${parsed.data.newDepartureTime}.`,
    });
  } catch {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

