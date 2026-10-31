import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { bookingsStore } from '@/lib/server/bookings-store';
import { VerifyTicketSchema } from '@/lib/validations/bookings';

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'bookings.validate' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = VerifyTicketSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Paramètre de code ou jeton requis', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = bookingsStore.verifyTicket(parsed.data.code);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

