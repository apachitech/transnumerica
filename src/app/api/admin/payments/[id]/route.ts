import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { getPaymentById } from '@/lib/server/payments-store';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = verifyApiAdminAuth(req, { permission: 'payments.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const payment = getPaymentById(id);
  if (!payment) {
    return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 });
  }

  return NextResponse.json(payment);
}

