import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { logAdminAction } from '@/lib/server/admin-store';
import { togglePromotion, deletePromotion, getPromotions } from '@/lib/server/pricing-store';
import { TogglePromotionSchema } from '@/lib/validations/pricing';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = verifyApiAdminAuth(req, { permission: 'pricing.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const body = await req.json().catch(() => null);
  const parseResult = TogglePromotionSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Paramètres invalides', details: parseResult.error.format() },
      { status: 400 }
    );
  }

  try {
    const updated = togglePromotion(
      id,
      parseResult.data.isActive,
      auth.session.name,
      parseResult.data.version
    );

    logAdminAction({
      adminUser: auth.session.name,
      action: updated.isActive ? 'ACTIVATION_PROMOTION' : 'DESACTIVATION_INSTANTANEE_PROMOTION',
      target: updated.code ? `Code promo ${updated.code}` : `Remise ${updated.title}`,
      previousState: updated.isActive ? 'Inactif' : 'Actif',
      newState: updated.isActive ? 'Actif' : 'Inactif',
      reason: `Statut modifié par ${auth.session.name}`,
    });

    return NextResponse.json({
      success: true,
      message: updated.isActive ? 'Promotion activée.' : 'Promotion désactivée avec effet immédiat.',
      promotion: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur de bascule du statut';
    const status = message.includes('CONFLIT_MODIFICATION') ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = verifyApiAdminAuth(req, { permission: 'pricing.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const existing = getPromotions().find((p) => p.id === id);

  try {
    deletePromotion(id, auth.session.name);

    logAdminAction({
      adminUser: auth.session.name,
      action: 'SUPPRESSION_PROMOTION',
      target: existing?.code ? `Code promo ${existing.code}` : `Offre ${existing?.title || id}`,
      previousState: 'Actif',
      newState: 'Archivé (soft delete)',
      reason: 'Suppression logique de l’offre promotionnelle',
    });

    return NextResponse.json({
      success: true,
      message: 'Promotion archivée avec succès.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur lors de la suppression';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

