import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { restoreBusStation } from '@/lib/server/catalog-store';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'catalog.restore' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json().catch(() => ({}));
    const reason = (body.reason || 'Restauration de la gare routière').trim();

    const success = restoreBusStation(id, reason, auth.session.name);
    if (!success) {
      return NextResponse.json({ error: 'Gare routière introuvable en corbeille' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Gare routière restaurée avec succès' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erreur serveur' }, { status: 500 });
  }
}

