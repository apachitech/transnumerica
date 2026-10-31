import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { updateBusLayout } from '@/lib/server/catalog-store';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'catalog.layouts' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const result = updateBusLayout(id, body, auth.session.name);

    if (result.conflict) {
      return NextResponse.json(
        {
          error: 'Conflit de version : ce plan de sièges a été modifié.',
          conflict: true,
          currentVersion: result.currentVersion,
        },
        { status: 409 }
      );
    }

    if (!result.success) {
      return NextResponse.json({ error: 'Plan de cabine introuvable' }, { status: 404 });
    }

    return NextResponse.json({ success: true, layout: result.layout });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erreur interne' }, { status: 500 });
  }
}

