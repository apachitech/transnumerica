import { NextRequest, NextResponse } from 'next/server';
import {
  getPublicHomeSections,
  resolvePageContent,
  resolveI18nString,
} from '@/lib/server/cms-store';
import { SupportedLanguage } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'home';
  const lang = (searchParams.get('lang') || 'fr') as SupportedLanguage;

  if (type === 'home') {
    const sections = getPublicHomeSections();
    return NextResponse.json({ sections });
  }

  if (type === 'page') {
    const slug = searchParams.get('slug');
    if (!slug) {
      return NextResponse.json({ error: 'Slug manquant' }, { status: 400 });
    }
    const resolved = resolvePageContent(slug, lang);
    if (!resolved) {
      return NextResponse.json({ error: 'Page introuvable ou non publiée' }, { status: 404 });
    }
    return NextResponse.json(resolved);
  }

  if (type === 'i18n') {
    const key = searchParams.get('key');
    if (!key) {
      return NextResponse.json({ error: 'Clé manquante' }, { status: 400 });
    }
    const text = resolveI18nString(key, lang);
    return NextResponse.json({ key, lang, text });
  }

  return NextResponse.json({ error: 'Type de requête non pris en charge' }, { status: 400 });
}

