import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { deliveriesStore } from '@/lib/server/deliveries-store';
import { DeliveryFailReturnSchema } from '@/lib/validations/deliveries';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'deliveries.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await context.params;

  try {
    const body = await req.json();
    const parsed = DeliveryFailReturnSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = deliveriesStore.handleFailedDelivery(
      id,
      parsed.data.failureReason,
      parsed.data.action,
      parsed.data.returnFeeMinor,
      parsed.data.notes,
      auth.session.email || auth.session.name
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      delivery: result.delivery,
      message:
        parsed.data.action === 'RETURN'
          ? 'Colis réorienté en retour à l’expéditeur.'
          : 'Tentative infructueuse enregistrée pour nouvel essai.',
    });
  } catch {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

