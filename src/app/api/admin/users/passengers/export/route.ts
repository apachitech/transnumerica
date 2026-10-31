import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { findPassengers, exportPassengersCsv } from '@/lib/server/passengers-store';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'users.export' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const result = findPassengers({ limit: 1000 });
  const csv = exportPassengersCsv(result.data);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="transnumerica-passagers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

