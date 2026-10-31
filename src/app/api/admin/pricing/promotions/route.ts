import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { logAdminAction } from '@/lib/server/admin-store';
import { getPromotions, createPromotion } from '@/lib/server/pricing-store';
import { CreatePromotionSchema } from '@/lib/validations/pricing';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'pricing.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const promotions = getPromotions();
  return NextResponse.json({ promotions });
}

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'pricing.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const body = await req.json().catch(() => null);
  const parseResult = CreatePromotionSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Paramètres de la promotion invalides', details: parseResult.error.format() },
      { status: 400 }
    );
  }

  try {
    const promo = createPromotion(
      {
        ...parseResult.data,
        code: parseResult.data.code ?? null,
        maxDiscountCdf: parseResult.data.maxDiscountCdf ?? undefined,
        minRideAmountCdf: parseResult.data.minRideAmountCdf ?? undefined,
        isActive: true,
      },
      auth.session.name
    );

    logAdminAction({
      adminUser: auth.session.name,
      action: 'CREATION_PROMOTION',
      target: promo.code ? `Code promo ${promo.code}` : `Remise auto "${promo.title}"`,
      previousState: '-',
      newState: `${promo.discountValue} (${promo.discountType}) - Limite: ${promo.globalUsageLimit}`,
      reason: `Création de l'offre promotionnelle "${promo.title}"`,
    });

    return NextResponse.json({
      success: true,
      message: 'Promotion créée avec succès.',
      promotion: promo,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur lors de la création de la promotion';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

