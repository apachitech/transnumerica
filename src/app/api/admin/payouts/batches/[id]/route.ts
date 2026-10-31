import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { getBatchById } from '@/lib/server/payouts-store';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'payouts.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;
  const batch = await getBatchById(id);

  if (!batch) {
    return NextResponse.json({ error: `Lot de paiement ${id} introuvable` }, { status: 404 });
  }

  return NextResponse.json(batch);
}

