import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { deliveriesStore } from '@/lib/server/deliveries-store';
import { ProhibitedItemToggleSchema } from '@/lib/validations/deliveries';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'deliveries.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const items = deliveriesStore.getProhibitedItems();
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'deliveries.configure' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = ProhibitedItemToggleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = deliveriesStore.toggleProhibitedItem(
      parsed.data.id,
      parsed.data.isEnforced,
      parsed.data.reason,
      auth.session.email || auth.session.name
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      item: result.item,
      message: `Règle d’article prohibé mise à jour avec succès.`,
    });
  } catch {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

