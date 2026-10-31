import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { rideOperationsStore } from '@/lib/server/rides-store';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'safety.export' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const csv = rideOperationsStore.exportSafetyReportCsv();

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="rapport-securite-transnumerica-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}

