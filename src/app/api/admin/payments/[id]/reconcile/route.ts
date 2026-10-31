import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { logAdminAction } from '@/lib/server/admin-store';
import { getPaymentById, markPaymentReconciled } from '@/lib/server/payments-store';
import { PaymentReconcileSchema } from '@/lib/validations/payments';

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
  const parseResult = PaymentReconcileSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Données de rapprochement invalides', details: parseResult.error.format() },
      { status: 400 }
    );
  }

  try {
    const updated = markPaymentReconciled(
      id,
      auth.session.name,
      parseResult.data.notes,
      parseResult.data.batchId,
      parseResult.data.version
    );

    logAdminAction({
      adminUser: auth.session.name,
      action: 'RAPPROCHEMENT_PAIEMENT',
      target: `Paiement ${existing.reference}`,
      previousState: existing.reconciled ? 'Rapproché' : 'Non rapproché',
      newState: 'Rapproché',
      reason: parseResult.data.notes || 'Marquage manuel comme rapproché avec le relevé opérateur',
    });

    return NextResponse.json({
      success: true,
      message: 'Paiement marqué comme rapproché avec succès.',
      payment: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur lors du rapprochement';
    const status = message.includes('CONFLIT_MODIFICATION') ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

