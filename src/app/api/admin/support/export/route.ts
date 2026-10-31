import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { supportStore } from '@/lib/server/support-store';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'support.export' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const csvContent = supportStore.exportTicketsCsv();

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="transnumerica-support-tickets-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
