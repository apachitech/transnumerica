import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { logAdminAction } from '@/lib/server/admin-store';
import { getBusRules, updateBusRule } from '@/lib/server/pricing-store';
import { BusRoutePriceRuleSchema } from '@/lib/validations/pricing';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'pricing.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const busRules = getBusRules();
  return NextResponse.json({ busRules });
}

export async function PUT(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, {
    permission: 'pricing.manage',
    requireRecentReauth: true,
  });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const body = await req.json().catch(() => null);
  const parseResult = BusRoutePriceRuleSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Paramètres du corridor bus invalides', details: parseResult.error.format() },
      { status: 400 }
    );
  }

  try {
    const { rule, versionSnapshot } = updateBusRule(
      parseResult.data,
      auth.session.name,
      parseResult.data.version
    );

    logAdminAction({
      adminUser: auth.session.name,
      action: 'MISE_A_JOUR_TARIFS_BUS',
      target: `Corridor ${rule.routeName}`,
      previousState: `Standard: ${rule.standardPriceCdf} FC, VIP: ${rule.vipPriceCdf} FC`,
      newState: `Version ${versionSnapshot.versionNumber} : Standard ${rule.standardPriceCdf} FC / VIP ${rule.vipPriceCdf} FC / Plafond ${rule.ceilingPriceCdf} FC`,
      reason: `Mise à jour des règles tarifaires et classes de confort du corridor ${rule.routeName}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Tarifs du corridor bus mis à jour avec succès.',
      rule,
      versionSnapshot,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur de mise à jour';
    const status = message.includes('CONFLIT_MODIFICATION') ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

