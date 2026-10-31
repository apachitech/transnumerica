import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { findDrivers, exportDriversCsv } from '@/lib/server/drivers-store';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'drivers.export' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const result = findDrivers({ limit: 1000 });
  const csv = exportDriversCsv(result.data);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="transnumerica-chauffeurs-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

