import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { getCommissionRules, saveCommissionRule } from '@/lib/server/payouts-store';
import { CommissionRuleSchema } from '@/lib/validations/payouts';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'payouts.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const rules = await getCommissionRules();
    return NextResponse.json(rules);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'commissions.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = CommissionRuleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Règle de commission invalide', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const saved = await saveCommissionRule(parsed.data, auth.session.email || auth.session.name);
    return NextResponse.json(saved, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de l\'enregistrement de la règle';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

