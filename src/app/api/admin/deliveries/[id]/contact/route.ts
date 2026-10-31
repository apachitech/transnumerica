import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { deliveriesStore } from '@/lib/server/deliveries-store';
import { DeliveryContactLogSchema } from '@/lib/validations/deliveries';

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
    const parsed = DeliveryContactLogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = deliveriesStore.logContact(
      id,
      parsed.data.party,
      parsed.data.channel,
      parsed.data.note,
      auth.session.email || auth.session.name
    );

    if (!result.success) {
      return NextResponse.json({ error: 'Échec de consignation' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      delivery: result.delivery,
      message: `Contact avec ${parsed.data.party} consigné avec succès.`,
    });
  } catch {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

