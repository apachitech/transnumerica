import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { logAdminAction } from '@/lib/server/admin-store';
import { updateSurgeMultiplier } from '@/lib/server/pricing-store';
import { SurgeUpdateSchema } from '@/lib/validations/pricing';

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'pricing.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const body = await req.json().catch(() => null);
  const parseResult = SurgeUpdateSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Paramètres de surtension invalides', details: parseResult.error.format() },
      { status: 400 }
    );
  }

  try {
    const updated = updateSurgeMultiplier(
      parseResult.data.formulaId,
      parseResult.data.surgeMultiplier,
      parseResult.data.surgeReason,
      parseResult.data.surgeActive,
      auth.session.name,
      parseResult.data.version
    );

    logAdminAction({
      adminUser: auth.session.name,
      action: 'AJUSTEMENT_SURGE_PRICING',
      target: `Formule ${updated.cityName} (${updated.serviceType})`,
      previousState: updated.surgeActive ? 'Actif' : 'Normal (1.0x)',
      newState: parseResult.data.surgeActive
        ? `Surge ${parseResult.data.surgeMultiplier}x (${parseResult.data.surgeReason})`
        : 'Normal (1.0x)',
      reason: `Déclenchement ou désactivation du coefficient de surtension météo/trafic`,
    });

    return NextResponse.json({
      success: true,
      message: `Coefficient de surtension mis à jour : ${updated.surgeMultiplier}x (${updated.surgeReason}).`,
      formula: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur surge pricing';
    const status = message.includes('CONFLIT_MODIFICATION') ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

