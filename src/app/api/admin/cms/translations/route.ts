import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAdminAuth } from '@/lib/server/auth-helpers';
import { getCmsTranslations, saveCmsTranslation } from '@/lib/server/cms-store';
import { CmsI18nStringSchema } from '@/lib/validations/cms';

export async function GET(req: NextRequest) {
  const auth = verifyApiAdminAuth(req, { permission: 'cms.read' });
  if (!auth.authorized || !auth.session) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search')?.toLowerCase();
  const category = searchParams.get('category');
  const missingOnly = searchParams.get('missingOnly') === 'true';
  const needsReviewOnly = searchParams.get('needsReviewOnly') === 'true';

  try {
    let list = await getCmsTranslations();

    if (category && category !== 'ALL') {
      list = list.filter((t) => t.category === category);
    }

    if (search) {
      list = list.filter(
        (t) =>
          t.key.toLowerCase().includes(search) ||
          t.translations.fr.toLowerCase().includes(search) ||
          t.translations.en.toLowerCase().includes(search) ||
          t.translations.ln.toLowerCase().includes(search) ||
          t.translations.sw.toLowerCase().includes(search)
      );
    }

    if (missingOnly) {
      list = list.filter(
        (t) => !t.translations.en || !t.translations.ln || !t.translations.sw
      );
    }

    if (needsReviewOnly) {
      list = list.filter((t) => t.needsReview);
    }

    return NextResponse.json(list);
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
    const parsed = CmsI18nStringSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données de traduction invalides', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const saved = await saveCmsTranslation(parsed.data, auth.session.email || auth.session.name);
    return NextResponse.json(saved);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de l’enregistrement de la traduction';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

