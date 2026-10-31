import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { logAdminAction } from '@/lib/server/admin-store';
import { getFareFormulas, updateFareFormula, resetPricingStore } from '@/lib/server/pricing-store';
import { UpdateFareFormulaSchema } from '@/lib/validations/pricing';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'pricing.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);
  if (searchParams.get('reset') === 'true') {
    resetPricingStore();
    return NextResponse.json({ message: 'Barème tarifaire réinitialisé' });
  }

  const formulas = getFareFormulas();
  return NextResponse.json({ formulas });
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
  const parseResult = UpdateFareFormulaSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Paramètres de formule invalides', details: parseResult.error.format() },
      { status: 400 }
    );
  }

  try {
    const { formula, versionSnapshot } = updateFareFormula(
      parseResult.data,
      auth.session.name,
      parseResult.data.version
    );

    logAdminAction({
      adminUser: auth.session.name,
      action: 'MISE_A_JOUR_FORMULE_TARIFAIRE',
      target: `Barème ${formula.cityName} (${formula.serviceType})`,
      previousState: `Base: ${formula.baseFareCdf} FC, km: ${formula.perKmCdf} FC`,
      newState: `Version ${versionSnapshot.versionNumber}: ${versionSnapshot.diff.length} modifications`,
      reason: `Mise à jour des paramètres tarifaires urbains pour ${formula.cityName}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Formule tarifaire mise à jour avec succès.',
      formula,
      versionSnapshot,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur de mise à jour';
    const status = message.includes('CONFLIT_MODIFICATION') ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

