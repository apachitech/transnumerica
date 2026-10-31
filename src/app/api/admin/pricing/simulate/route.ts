import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { simulateFare } from '@/lib/server/pricing-store';
import { SimulateFareSchema } from '@/lib/validations/pricing';

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'pricing.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const body = await req.json().catch(() => null);
  const parseResult = SimulateFareSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Paramètres de simulation invalides', details: parseResult.error.format() },
      { status: 400 }
    );
  }

  try {
    const result = simulateFare(parseResult.data);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur de simulation tarifaire';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

