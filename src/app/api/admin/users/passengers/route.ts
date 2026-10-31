import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { findPassengers, createPassenger } from '@/lib/server/passengers-store';
import { CreatePassengerSchema } from '@/lib/validations/users';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'users.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const city = searchParams.get('city') || '';
  const loyaltyTier = searchParams.get('loyaltyTier') || '';
  const includeTrash = searchParams.get('trash') === 'true';
  const sortField = (searchParams.get('sortField') as any) || 'registeredAt';
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

  const result = findPassengers({
    page,
    limit,
    search,
    status,
    city,
    loyaltyTier,
    includeTrash,
    sortField,
    sortOrder,
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'users.create' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = CreatePassengerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données de formulaire invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const newPassenger = createPassenger(
      {
        ...parsed.data,
        status: 'ACTIVE',
        totalRides: 0,
        totalBookings: 0,
        totalSpentCDF: 0,
        walletBalanceCDF: 0,
      },
      auth.session.name
    );

    return NextResponse.json({ success: true, passenger: newPassenger }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la création du passager' }, { status: 500 });
  }
}

