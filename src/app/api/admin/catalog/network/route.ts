import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import {
  getCities,
  getZones,
  getLandmarks,
  getComfortLevels,
  getAmenities,
  getVehicleTypes,
  resetCatalogStore,
} from '@/lib/server/catalog-store';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'catalog.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);
  const cityId = searchParams.get('cityId') || undefined;

  return NextResponse.json({
    success: true,
    cities: getCities(),
    zones: getZones(cityId),
    landmarks: getLandmarks(cityId),
    comfortLevels: getComfortLevels(),
    amenities: getAmenities(),
    vehicleTypes: getVehicleTypes(),
  });
}

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'catalog.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);
  if (searchParams.get('reset') === 'true') {
    resetCatalogStore();
    return NextResponse.json({ success: true, message: 'Catalogue réinitialisé' });
  }

  return NextResponse.json({ error: 'Action non supportée' }, { status: 400 });
}

