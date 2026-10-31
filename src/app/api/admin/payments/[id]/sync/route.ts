import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { logAdminAction } from '@/lib/server/admin-store';
import { getPaymentById, syncProviderStatus } from '@/lib/server/payments-store';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = verifyApiAdminAuth(req, { permission: 'payments.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const existing = getPaymentById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 });
  }

  try {
    const updated = syncProviderStatus(id, auth.session.name);

    logAdminAction({
      adminUser: auth.session.name,
      action: 'SYNC_STATUT_PAIEMENT',
      target: `Paiement ${existing.reference} (${existing.provider})`,
      previousState: JSON.stringify({ status: existing.status, providerState: existing.rawProviderStatus.state }),
      newState: JSON.stringify({ status: updated.status, providerState: updated.rawProviderStatus.state }),
      reason: 'Synchronisation et vérification manuelle du statut auprès de la passerelle opérateur',
    });

    return NextResponse.json({
      success: true,
      message: 'Statut du paiement synchronisé avec succès auprès de l’opérateur.',
      payment: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur lors de la synchronisation';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

