import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { deliveriesStore } from '@/lib/server/deliveries-store';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'deliveries.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await context.params;
  const delivery = deliveriesStore.getDeliveryById(id);
  if (!delivery) {
    return NextResponse.json({ error: 'Livraison introuvable' }, { status: 404 });
  }

  return NextResponse.json({ delivery });
}

