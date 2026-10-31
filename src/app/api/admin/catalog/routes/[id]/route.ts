import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { updateCatalogRoute, deleteCatalogRoute } from '@/lib/server/catalog-store';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'catalog.routes' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const result = updateCatalogRoute(id, body, auth.session.name);

    if (result.conflict) {
      return NextResponse.json(
        {
          error: 'Conflit de version détecté : cette ligne a été modifiée par un autre administrateur.',
          conflict: true,
          currentVersion: result.currentVersion,
        },
        { status: 409 }
      );
    }

    if (result.blockedByBookings) {
      return NextResponse.json(
        {
          error: result.message,
          blockedByBookings: true,
        },
        { status: 422 }
      );
    }

    if (!result.success) {
      return NextResponse.json({ error: 'Ligne introuvable' }, { status: 404 });
    }

    return NextResponse.json({ success: true, route: result.route });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erreur interne' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'catalog.delete' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json().catch(() => ({}));
    const reason = (body.reason || '').trim();

    if (reason.length < 5) {
      return NextResponse.json(
        { error: 'Un motif d’audit circonstancié d’au moins 5 caractères est obligatoire.' },
        { status: 400 }
      );
    }

    const result = deleteCatalogRoute(id, reason, auth.session.name);
    if (result.blockedByBookings) {
      return NextResponse.json(
        {
          error: result.message,
          blockedByBookings: true,
        },
        { status: 422 }
      );
    }

    if (!result.success) {
      return NextResponse.json({ error: 'Ligne introuvable' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Ligne déplacée en corbeille' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erreur serveur' }, { status: 500 });
  }
}

