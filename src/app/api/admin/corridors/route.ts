import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth, getClientIpAndUa } from '@/lib/server/auth-helpers';
import { corridorsRepository } from '@/lib/server/corridors-store';
import { CreateCorridorSchema } from '@/lib/validations/corridors';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'corridors.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const sort = searchParams.get('sort') || 'createdAt';
  const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc';
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const includeDeleted = searchParams.get('trash') === 'true' ? 'only' : false;
  const format = searchParams.get('format');

  const filters: Record<string, string | undefined> = {};
  if (status && status !== 'ALL') {
    filters.status = status;
  }

  if (format === 'csv') {
    const exportAuth = verifyApiAdminAuth(req, { permission: 'corridors.export' });
    if (!exportAuth.authorized) {
      return NextResponse.json({ error: 'Permission corridors.export requise' }, { status: 403 });
    }

    const { data } = await corridorsRepository.findMany({
      sort,
      order,
      search,
      filters,
      includeDeleted,
      limit: 1000,
    });

    const csvData = corridorsRepository.exportCsv(
      [
        { key: 'code', label: 'Code Ligne' },
        { key: 'originCity', label: 'Origine' },
        { key: 'destinationCity', label: 'Destination' },
        { key: 'distanceKm', label: 'Distance (km)' },
        { key: 'averageDurationHours', label: 'Durée Moyenne (h)' },
        { key: 'basePriceCdf', label: 'Tarif Base (CDF)' },
        { key: 'basePriceUsd', label: 'Tarif Base (USD)' },
        { key: 'status', label: 'Statut' },
        { key: 'operatorCount', label: 'Opérateurs' },
        { key: 'notes', label: 'Remarques' },
        { key: 'createdAt', label: 'Date Création' },
      ],
      data
    );

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="corridors-${Date.now()}.csv"`,
      },
    });
  }

  const result = await corridorsRepository.findMany({
    page,
    limit,
    sort,
    order,
    search,
    filters,
    includeDeleted,
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'corridors.create' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = CreateCorridorSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation échouée',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { ip } = getClientIpAndUa(req);
    const created = await corridorsRepository.create(parsed.data, auth.session, ip);

    return NextResponse.json({ success: true, item: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
