import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { logAdminAction } from '@/lib/server/admin-store';
import { getPaymentById, retryPayment } from '@/lib/server/payments-store';
import { PaymentRetrySchema } from '@/lib/validations/payments';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = verifyApiAdminAuth(req, { permission: 'payments.retry' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const existing = getPaymentById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const parseResult = PaymentRetrySchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Paramètres de réessai invalides', details: parseResult.error.format() },
      { status: 400 }
    );
  }

  try {
    const updated = retryPayment(
      id,
      auth.session.name,
      parseResult.data.idempotencyKey,
      parseResult.data.reason,
      parseResult.data.version
    );

    logAdminAction({
      adminUser: auth.session.name,
      action: 'REESSAI_PAIEMENT',
      target: `Paiement ${existing.reference} (${existing.provider})`,
      previousState: existing.status,
      newState: updated.status,
      reason: `Réessai de paiement déclenché. Motif: ${parseResult.data.reason}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Réessai du paiement exécuté avec succès.',
      payment: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur lors du réessai';
    const status = message.includes('CONFLIT_MODIFICATION') ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

