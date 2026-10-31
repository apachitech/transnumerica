import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { logAdminAction, reauthenticateSession, ADMIN_SESSION_COOKIE_NAME } from '@/lib/server/admin-store';
import { getExchangeRate, updateExchangeRate } from '@/lib/server/pricing-store';
import { ExchangeRateUpdateSchema } from '@/lib/validations/pricing';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'pricing.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const rateState = getExchangeRate();
  return NextResponse.json(rateState);
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const body = await req.json().catch(() => null);

  const parseResult = ExchangeRateUpdateSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Paramètres du taux de change invalides', details: parseResult.error.format() },
      { status: 400 }
    );
  }

  if (token && parseResult.data.reauthCode) {
    reauthenticateSession(token, parseResult.data.reauthCode);
  }

  const auth = verifyApiAdminAuth(req, {
    permission: 'pricing.manage',
    requireRecentReauth: true,
  });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const currentRate = getExchangeRate();

  try {
    const updated = updateExchangeRate(
      parseResult.data.rate,
      parseResult.data.reason,
      auth.session.name
    );

    logAdminAction({
      adminUser: auth.session.name,
      action: 'AJUSTEMENT_TAUX_CHANGE',
      target: 'Taux de change opérationnel USD / CDF',
      previousState: `${currentRate.currentRate} CDF = 1 USD`,
      newState: `${updated.currentRate} CDF = 1 USD`,
      reason: parseResult.data.reason,
    });

    return NextResponse.json({
      success: true,
      message: `Taux de change ajusté à ${updated.currentRate} CDF = 1 USD.`,
      exchangeRate: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur de mise à jour du taux';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

