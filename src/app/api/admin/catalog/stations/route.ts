import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { getBusStations, createBusStation } from '@/lib/server/catalog-store';
import { BusStationSchema } from '@/lib/validations/catalog';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'catalog.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || undefined;
  const cityId = searchParams.get('cityId') || undefined;
  const includeTrash = searchParams.get('trash') === 'true';

  const stations = getBusStations({ search, cityId, includeTrash });
  return NextResponse.json({ success: true, data: stations });
}

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'catalog.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = BusStationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données de la gare routière invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const station = createBusStation(
      {
        ...parsed.data,
        coordinates: {
          lat: parsed.data.latitude,
          lng: parsed.data.longitude,
        },
      },
      auth.session.name
    );

    return NextResponse.json({ success: true, station }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erreur interne' }, { status: 500 });
  }
}

