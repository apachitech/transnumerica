import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { rideOperationsStore } from '@/lib/server/rides-store';
import { RideQuerySchema } from '@/lib/validations/rides';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'rides.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);

  // Testing reset hook
  if (searchParams.get('reset') === 'true') {
    rideOperationsStore.reset();
    return NextResponse.json({ message: 'Store réinitialisé avec succès' });
  }

  const parsed = RideQuerySchema.safeParse({
    city: searchParams.get('city') || undefined,
    serviceType: searchParams.get('serviceType') || undefined,
    status: searchParams.get('status') || undefined,
    search: searchParams.get('search') || undefined,
    page: searchParams.get('page') || 1,
    limit: searchParams.get('limit') || 20,
    includeTrash: searchParams.get('includeTrash') === 'true',
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Paramètres invalides', details: parsed.error.format() },
      { status: 400 }
    );
  }

  const ridesResult = rideOperationsStore.queryRides(parsed.data);
  const onlineDrivers = rideOperationsStore.getOnlineDrivers(
    parsed.data.city,
    parsed.data.serviceType
  );
  const activeIncidents = rideOperationsStore.queryIncidents({
    status: 'ALL',
    city: parsed.data.city,
  });

  return NextResponse.json({
    rides: ridesResult.data,
    pagination: ridesResult.pagination,
    drivers: onlineDrivers,
    incidents: activeIncidents,
  });
}
