import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { getCmsPages, saveCmsPage } from '@/lib/server/cms-store';
import { CmsStaticPageSchema } from '@/lib/validations/cms';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'cms.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);
  const includeDeleted = searchParams.get('includeDeleted') === 'true';

  try {
    const pages = await getCmsPages(includeDeleted);
    return NextResponse.json(pages);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'cms.manage' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const parsed = CmsStaticPageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données de la page invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const saved = await saveCmsPage(parsed.data, auth.session.email || auth.session.name);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la création de la page';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

