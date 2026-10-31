import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { bookingsStore } from '@/lib/server/bookings-store';
import { ManualBookingCreateSchema } from '@/lib/validations/bookings';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'bookings.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);
  if (searchParams.get('reset') === 'true') {
    bookingsStore.reset();
    return NextResponse.json({ success: true, reset: true });
  }
  const search = searchParams.get('search') || undefined;
  const status = searchParams.get('status') || undefined;
  const paymentStatus = searchParams.get('paymentStatus') || undefined;
  const route = searchParams.get('route') || undefined;
  const operator = searchParams.get('operator') || undefined;
  const date = searchParams.get('date') || undefined;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const includeTrash = searchParams.get('trash') === 'true';

  const result = bookingsStore.queryBookings({
    search,
    status,
    paymentStatus,
    route,
    operator,
    date,
    page,
    limit,
    includeTrash,
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'bookings.create' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = ManualBookingCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données de réservation invalides', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = bookingsStore.createBooking(parsed.data, auth.session.name);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status || 400 });
    }

    return NextResponse.json(
      { success: true, booking: result.booking, message: 'Réservation créée avec succès au guichet.' },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

