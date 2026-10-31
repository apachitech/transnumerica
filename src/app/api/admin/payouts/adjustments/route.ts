import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { createAdjustment } from '@/lib/server/payouts-store';
import { CreateAdjustmentSchema } from '@/lib/validations/payouts';
import { reauthenticateSession, ADMIN_SESSION_COOKIE_NAME } from '@/lib/server/admin-store';

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const body = await req.json().catch(() => null);

  const parsed = CreateAdjustmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Paramètres d\'ajustement invalides', details: parsed.error.format() },
      { status: 400 }
    );
  }

  // Attempt re-authentication
  if (token && parsed.data.password) {
    reauthenticateSession(token, parsed.data.password);
  }

  const auth = verifyApiAdminAuth(req, {
    permission: 'adjustments.manage',
    requireRecentReauth: true,
  });

  if (!auth.authorized || !auth.session) {
    return NextResponse.json(
      { error: auth.error || 'Mot de passe incorrect ou session expirée pour ajustement financier' },
      { status: auth.status || 401 }
    );
  }

  try {
    const adj = await createAdjustment(parsed.data, auth.session.email || auth.session.name);
    return NextResponse.json(adj, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la création de l\'ajustement';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

