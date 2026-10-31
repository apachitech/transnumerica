import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { logAdminAction } from '@/lib/server/admin-store';
import { getPaymentById, confirmCashCollection } from '@/lib/server/payments-store';
import { PaymentCashConfirmSchema } from '@/lib/validations/payments';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = verifyApiAdminAuth(req, { permission: 'payments.reconcile' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const existing = getPaymentById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const parseResult = PaymentCashConfirmSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Données de confirmation d’espèces invalides', details: parseResult.error.format() },
      { status: 400 }
    );
  }

  try {
    const updated = confirmCashCollection(
      id,
      auth.session.name,
      parseResult.data.receiptNumber,
      parseResult.data.agentName,
      parseResult.data.notes,
      parseResult.data.version
    );

    logAdminAction({
      adminUser: auth.session.name,
      action: 'ENCAISSEMENT_ESPECES_CONFIRME',
      target: `Paiement espèces ${existing.reference}`,
      previousState: existing.status,
      newState: 'SETTLED',
      reason: `Espèces collectées par ${parseResult.data.agentName} (Reçu N° ${parseResult.data.receiptNumber})`,
    });

    return NextResponse.json({
      success: true,
      message: 'Encaissement des espèces validé avec succès.',
      payment: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur lors de la validation des espèces';
    const status = message.includes('CONFLIT_MODIFICATION') ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

