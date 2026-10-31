import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { deliveriesStore } from '@/lib/server/deliveries-store';
import { DeliveryQuerySchema } from '@/lib/validations/deliveries';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'deliveries.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);

  // Testing reset hook
  if (searchParams.get('reset') === 'true') {
    deliveriesStore.reset();
    return NextResponse.json({ message: 'Store livraisons réinitialisé avec succès' });
  }

  const parsed = DeliveryQuerySchema.safeParse({
    city: searchParams.get('city') || undefined,
    parcelSize: searchParams.get('parcelSize') || undefined,
    status: searchParams.get('status') || undefined,
    search: searchParams.get('search') || undefined,
    page: searchParams.get('page') || 1,
    limit: searchParams.get('limit') || 20,
    includeTrash: searchParams.get('includeTrash') === 'true',
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Paramètres invalides', details: parsed.error.format() },
      { status: 400 }
    );
  }

  const result = deliveriesStore.queryDeliveries(parsed.data);
  const couriers = deliveriesStore.getCouriers(parsed.data.city);
  const pricingTiers = deliveriesStore.getPricingTiers();
  const prohibitedItems = deliveriesStore.getProhibitedItems();

  return NextResponse.json({
    deliveries: result.data,
    pagination: result.pagination,
    couriers,
    pricingTiers,
    prohibitedItems,
  });
}

