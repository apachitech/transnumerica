import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { getPaymentMethodMix } from '@/lib/server/analytics-store';
import { analyticsFilterSchema } from '@/lib/validations/analytics';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'analytics.view' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);
  const queryParams = {
    period: searchParams.get('period') || '7D',
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
    city: searchParams.get('city') || 'ALL',
    comparePrevious: searchParams.get('comparePrevious') !== 'false',
  };

  const parsed = analyticsFilterSchema.safeParse(queryParams);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Paramètres de filtre invalides', details: parsed.error.format() },
      { status: 400 }
    );
  }

  try {
    const data = getPaymentMethodMix(parsed.data);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

