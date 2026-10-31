import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { checkDuplicateRoute } from '@/lib/server/catalog-store';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'catalog.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);
  const originStationId = searchParams.get('originStationId');
  const destinationStationId = searchParams.get('destinationStationId');
  const excludeRouteId = searchParams.get('excludeRouteId') || undefined;

  if (!originStationId || !destinationStationId) {
    return NextResponse.json({ isDuplicate: false });
  }

  const result = checkDuplicateRoute(originStationId, destinationStationId, excludeRouteId);
  return NextResponse.json(result);
}

