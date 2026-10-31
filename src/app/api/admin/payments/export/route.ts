import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { logAdminAction } from '@/lib/server/admin-store';
import { getPayments } from '@/lib/server/payments-store';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'payments.export' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);
  const provider = searchParams.get('provider') || undefined;
  const status = searchParams.get('status') || undefined;
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;

  const result = getPayments({
    provider,
    status,
    startDate,
    endDate,
    limit: 1000,
  });

  const headers = [
    'Reference_Transnumerica',
    'Operateur',
    'Reference_Operateur',
    'Client',
    'Telephone',
    'Service',
    'Montant',
    'Devise',
    'Statut',
    'Rembourse_Montant',
    'Rapproche',
    'Date_Creation',
  ];

  const rows = result.items.map((p) => [
    `"${p.reference}"`,
    `"${p.provider}"`,
    `"${p.providerReference}"`,
    `"${p.customerName.replace(/"/g, '""')}"`,
    `"${p.customerPhone}"`,
    `"${p.serviceType}"`,
    (p.amountMinor / 100).toFixed(2),
    `"${p.currency}"`,
    `"${p.status}"`,
    (p.refundedAmountMinor / 100).toFixed(2),
    p.reconciled ? '"OUI"' : '"NON"',
    `"${p.createdAt}"`,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  logAdminAction({
    adminUser: auth.session.name,
    action: 'EXPORT_PAIEMENTS_CSV',
    target: 'Journal des transactions financières',
    previousState: '-',
    newState: `${result.items.length} transactions exportées`,
    reason: `Export CSV des paiements (Filtre: ${provider || 'Tous'}, Statut: ${status || 'Tous'})`,
  });

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="transnumerica-paiements-${Date.now()}.csv"`,
    },
  });
}

