import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { logAdminAction, reauthenticateSession, ADMIN_SESSION_COOKIE_NAME } from '@/lib/server/admin-store';
import { getPaymentById, refundPayment } from '@/lib/server/payments-store';
import { PaymentRefundSchema } from '@/lib/validations/payments';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = req.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const body = await req.json().catch(() => null);

  const parseResult = PaymentRefundSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Paramètres de remboursement invalides', details: parseResult.error.format() },
      { status: 400 }
    );
  }

  // If reauthCode is provided, attempt re-authentication
  if (token && parseResult.data.reauthCode) {
    reauthenticateSession(token, parseResult.data.reauthCode);
  }

  // Check permission and sensitive re-auth (< 5 mins)
  const auth = verifyApiAdminAuth(req, {
    permission: 'payments.refund',
    requireRecentReauth: true,
  });

  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const existing = getPaymentById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 });
  }

  try {
    const { payment, refundRecord } = refundPayment(
      id,
      auth.session.name,
      parseResult.data.amountMinor,
      parseResult.data.reason,
      parseResult.data.reauthCode,
      parseResult.data.idempotencyKey,
      parseResult.data.version
    );

    logAdminAction({
      adminUser: auth.session.name,
      action: 'REMBOURSEMENT_MOBILE_MONEY',
      target: `Paiement ${existing.reference} (${existing.provider})`,
      previousState: `Statut: ${existing.status}, Remboursé: ${existing.refundedAmountMinor / 100} ${existing.currency}`,
      newState: `Statut: ${payment.status}, Remboursé: ${payment.refundedAmountMinor / 100} ${payment.currency}`,
      reason: `Remboursement de ${(parseResult.data.amountMinor / 100).toLocaleString('fr-FR')} ${existing.currency}. Motif: ${parseResult.data.reason}`,
    });

    return NextResponse.json({
      success: true,
      message: `Remboursement de ${(parseResult.data.amountMinor / 100).toLocaleString('fr-FR')} ${existing.currency} validé avec succès.`,
      payment,
      refundRecord,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur lors du remboursement';
    const status = message.includes('CONFLIT_MODIFICATION') ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

