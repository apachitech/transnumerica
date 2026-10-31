import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { executePayoutBatch } from '@/lib/server/payouts-store';
import { ExecutePayoutBatchSchema } from '@/lib/validations/payouts';
import { reauthenticateSession, ADMIN_SESSION_COOKIE_NAME } from '@/lib/server/admin-store';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = req.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const body = await req.json().catch(() => null);

  const parsed = ExecutePayoutBatchSchema.safeParse({ ...body, batchId: id });
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données d\'exécution de paiement invalides', details: parsed.error.format() },
      { status: 400 }
    );
  }

  // Attempt re-authentication
  if (token && parsed.data.password) {
    const reauthOk = reauthenticateSession(token, parsed.data.password);
    if (!reauthOk && parsed.data.totpCode) {
      reauthenticateSession(token, parsed.data.totpCode);
    }
  }

  const auth = verifyApiAdminAuth(req, {
    permission: 'payouts.execute',
    requireRecentReauth: true,
  });

  if (!auth.authorized || !auth.session) {
    return NextResponse.json(
      { error: auth.error || 'Mot de passe incorrect ou session expirée pour exécution financière' },
      { status: auth.status || 401 }
    );
  }

  try {
    const updated = await executePayoutBatch({
      batchId: id,
      authorEmail: auth.session.email || auth.session.name,
      payoutProvider: parsed.data.payoutProvider,
      referenceNumber: parsed.data.referenceNumber,
      notes: parsed.data.notes,
      version: parsed.data.version,
    });

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de l\'exécution du décaissement';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

