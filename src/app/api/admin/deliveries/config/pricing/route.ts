import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { deliveriesStore } from '@/lib/server/deliveries-store';
import { DeliveryPricingUpdateSchema } from '@/lib/validations/deliveries';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'deliveries.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const tiers = deliveriesStore.getPricingTiers();
  return NextResponse.json({ tiers });
}

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'deliveries.configure' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = DeliveryPricingUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données tarifaires invalides', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = deliveriesStore.updatePricingTier(
      parsed.data,
      auth.session.email || auth.session.name
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      tier: result.tier,
      message: `Tarification du format ${parsed.data.parcelSize} mise à jour avec succès.`,
    });
  } catch {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

