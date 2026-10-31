import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { getCmsPageById, saveCmsPage, deleteCmsPage } from '@/lib/server/cms-store';
import { CmsStaticPageSchema } from '@/lib/validations/cms';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'cms.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;
  const page = await getCmsPageById(id);

  if (!page) {
    return NextResponse.json({ error: `Page ${id} introuvable` }, { status: 404 });
  }

  return NextResponse.json(page);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'cms.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = CmsStaticPageSchema.safeParse({ ...body, id });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données de la page invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const saved = await saveCmsPage(parsed.data, auth.session.email || auth.session.name);
    return NextResponse.json(saved);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la mise à jour';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyApiAdminAuth(req, { permission: 'cms.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const reason = searchParams.get('reason') || 'Suppression logique de la page';

  try {
    await deleteCmsPage(id, auth.session.email || auth.session.name, reason);
    return NextResponse.json({ message: 'Page supprimée avec succès' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la suppression';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

