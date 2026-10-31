import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { deliveriesStore } from '@/lib/server/deliveries-store';
import { DeliveryCancelSchema } from '@/lib/validations/deliveries';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'deliveries.cancel' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await context.params;

  try {
    const body = await req.json();
    const parsed = DeliveryCancelSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = deliveriesStore.cancelDelivery(
      id,
      parsed.data.reason,
      auth.session.email || auth.session.name
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      delivery: result.delivery,
      message: 'Livraison annulée avec succès et coursier libéré.',
    });
  } catch {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

