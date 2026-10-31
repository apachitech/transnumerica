import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { exportBatchCsv } from '@/lib/server/payouts-store';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'payouts.export' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;

  try {
    const csvContent = await exportBatchCsv(id);
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="lot-paiement-${id}.csv"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de l\'export CSV';
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

