import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { toggleHoldBatch } from '@/lib/server/payouts-store';
import { HoldPayoutBatchSchema } from '@/lib/validations/payouts';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = verifyApiAdminAuth(req, { permission: 'payouts.approve' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = HoldPayoutBatchSchema.safeParse({ ...body, batchId: id });
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données de blocage invalides', details: parsed.error.format() },
      { status: 400 }
    );
  }

  try {
    const updated = await toggleHoldBatch({
      batchId: id,
      authorEmail: auth.session.email || auth.session.name,
      hold: parsed.data.hold,
      reason: parsed.data.reason,
      version: parsed.data.version,
    });

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la modification du statut de blocage';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

