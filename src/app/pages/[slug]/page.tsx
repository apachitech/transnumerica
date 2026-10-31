import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { resolvePageContent } from '@/lib/server/cms-store';
import { SupportedLanguage } from '@/types';
import { Globe, ArrowLeft, ShieldCheck, Clock, AlertCircle } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { lang } = await searchParams;
  const page = resolvePageContent(slug, (lang as SupportedLanguage) || 'fr');

  if (!page) {
    return { title: 'Page introuvable | Transnumerica' };
  }

  return {
    title: `${page.title} — Transnumerica RD Congo`,
    description: `Consultez ${page.title} sur la plateforme officielle de mobilité Transnumerica en RDC.`,
  };
}

export default async function PublicStaticPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const currentLang = ((lang as SupportedLanguage) || 'fr') as SupportedLanguage;

  const page = resolvePageContent(slug, currentLang);
  if (!page) {
    notFound();
  }

  const languages: { code: SupportedLanguage; label: string }[] = [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' },
    { code: 'ln', label: 'Lingála' },
    { code: 'sw', label: 'Kiswahili' },
  ];

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Language Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
          </Link>

          {/* Language Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-800/80 border border-neutral-700/60 text-xs">
            <Globe className="w-3.5 h-3.5 text-neutral-400 ml-2 mr-1" />
            {languages.map((l) => (
              <Link
                key={l.code}
                href={`/pages/${slug}?lang=${l.code}`}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  currentLang === l.code
                    ? 'bg-neutral-700 text-white font-bold'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Fallback Warning Notice */}
        {page.isFallback && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-xs text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              Cette page n'est pas encore traduite dans la langue sélectionnée. Affichage automatique en version française de référence.
            </span>
          </div>
        )}

        {/* Page Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> Document Officiel Transnumerica
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {page.title}
          </h1>
          {page.publishedAt && (
            <p className="text-xs text-neutral-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Dernière publication : {new Date(page.publishedAt).toLocaleDateString('fr-FR')}</span>
            </p>
          )}
        </div>

        {/* Rich-Text Body */}
        <div
          className="prose prose-invert prose-emerald max-w-none p-6 sm:p-8 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 leading-relaxed text-sm sm:text-base"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />

        {/* Footer info */}
        <div className="text-center pt-6 text-xs text-neutral-500">
          Transnumerica RDC — Plateforme officielle de billetterie & mobilité multimodale
        </div>
      </div>
    </div>
  );
}

