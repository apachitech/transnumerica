import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { getCatalogTrips } from '@/lib/server/catalog-store';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'catalog.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);
  const routeId = searchParams.get('routeId') || undefined;
  const month = searchParams.get('month') || undefined;
  const status = searchParams.get('status') || undefined;
  const includeTrash = searchParams.get('trash') === 'true';

  const trips = getCatalogTrips({ routeId, month, status, includeTrash });
  return NextResponse.json({ success: true, data: trips });
}

