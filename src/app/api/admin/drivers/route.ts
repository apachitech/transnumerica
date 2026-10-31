import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { findDrivers } from '@/lib/server/drivers-store';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'drivers.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const search = searchParams.get('search') || '';
  const verificationStatus = searchParams.get('verificationStatus') || '';
  const status = searchParams.get('status') || '';
  const vehicleType = searchParams.get('vehicleType') || '';
  const city = searchParams.get('city') || '';
  const includeTrash = searchParams.get('trash') === 'true';

  const result = findDrivers({
    page,
    limit,
    search,
    verificationStatus,
    status,
    vehicleType,
    city,
    includeTrash,
  });

  return NextResponse.json(result);
}

