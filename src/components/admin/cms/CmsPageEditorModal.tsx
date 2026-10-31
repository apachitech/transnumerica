'use client';

import React, { useState, useEffect } from 'react';
import { CmsStaticPage, SupportedLanguage } from '@/types';
import {
  X,
  FileText,
  Globe,
  Bold,
  Italic,
  Heading2,
  List,
  Link as LinkIcon,
  CheckCircle2,
  AlertTriangle,
  History,
} from 'lucide-react';

interface CmsPageEditorModalProps {
  page: CmsStaticPage | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (saved: CmsStaticPage) => void;
  onOpenHistory?: (page: CmsStaticPage) => void;
}

const LANGUAGES: { code: SupportedLanguage; label: string; badge: string }[] = [
  { code: 'fr', label: 'Français (Réf)', badge: 'FR' },
  { code: 'en', label: 'English', badge: 'EN' },
  { code: 'ln', label: 'Lingála', badge: 'LN' },
  { code: 'sw', label: 'Kiswahili', badge: 'SW' },
];

export function CmsPageEditorModal({
  page,
  isOpen,
  onClose,
  onSuccess,
  onOpenHistory,
}: CmsPageEditorModalProps) {
  const [activeLang, setActiveLang] = useState<SupportedLanguage>('fr');
  const [slug, setSlug] = useState('');
  const [titles, setTitles] = useState<Record<SupportedLanguage, string>>({
    fr: '',
    en: '',
    ln: '',
    sw: '',
  });
  const [contents, setContents] = useState<Record<SupportedLanguage, string>>({
    fr: '',
    en: '',
    ln: '',
    sw: '',
  });
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('DRAFT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (page) {
      setSlug(page.slug);
      setTitles({ ...page.title });
      setContents({ ...page.content });
      setStatus(page.status);
    } else {
      setSlug('');
      setTitles({ fr: '', en: '', ln: '', sw: '' });
      setContents({ fr: '', en: '', ln: '', sw: '' });
      setStatus('DRAFT');
    }
    setActiveLang('fr');
    setError(null);
  }, [page, isOpen]);

  if (!isOpen) return null;

  const handleTitleChange = (val: string) => {
    setTitles((prev) => ({ ...prev, [activeLang]: val }));
  };

  const handleContentChange = (val: string) => {
    setContents((prev) => ({ ...prev, [activeLang]: val }));
  };

  const insertTag = (openTag: string, closeTag: string) => {
    const textarea = document.getElementById('richContentArea') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = contents[activeLang] || '';
    const selected = current.substring(start, end);
    const replacement = `${openTag}${selected || 'Texte'}${closeTag}`;

    const newContent = current.substring(0, start) + replacement + current.substring(end);
    handleContentChange(newContent);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug.trim()) {
      setError('Le slug est obligatoire.');
      return;
    }
    if (!titles.fr.trim()) {
      setError('Le titre en français (langue de référence) est obligatoire.');
      return;
    }
    if (!contents.fr.trim()) {
      setError('Le contenu en français est obligatoire.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        id: page ? page.id : undefined,
        slug: slug.trim().toLowerCase(),
        title: titles,
        content: contents,
        status,
        version: page?.version,
      };

      const res = await fetch(page ? `/api/admin/cms/pages/${page.id}` : '/api/admin/cms/pages', {
        method: page ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l’enregistrement de la page');
      }

      onSuccess(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {page ? `Édition : ${page.title.fr}` : 'Créer une Nouvelle Page Statique'}
              </h2>
              <p className="text-xs text-zinc-400">
                {page ? `Slug : /pages/${page.slug} • v${page.version}` : 'Support multilingue FR, EN, LN, SW'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {page && onOpenHistory && (
              <button
                type="button"
                onClick={() => onOpenHistory(page)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <History className="w-3.5 h-3.5 text-blue-400" /> Historique ({page.versionHistory.length})
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Fermer la modal"
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Top metadata grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Identifiant URL (Slug) <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-zinc-800 border border-r-0 border-zinc-700 text-zinc-400 rounded-l-xl font-mono text-xs">
                  /pages/
                </span>
                <input
                  type="text"
                  value={slug}
                  disabled={!!page}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="about, privacy, terms, refund-policy..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-r-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 disabled:opacity-60"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Statut de la page</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="DRAFT">Brouillon (Non accessible au public)</option>
                <option value="PUBLISHED">Publié (En ligne)</option>
                <option value="ARCHIVED">Archivé</option>
              </select>
            </div>
          </div>

          {/* Language Switcher Tabs */}
          <div className="pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Langue en cours d'édition</span>
              </span>
              <span className="text-[11px] text-zinc-500">
                Si une langue n'est pas renseignée, la version française sera utilisée en repli automatique.
              </span>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-950 border border-zinc-800">
              {LANGUAGES.map((l) => (
                <button
                  type="button"
                  key={l.code}
                  onClick={() => setActiveLang(l.code)}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-xs transition flex items-center justify-center gap-1.5 ${
                    activeLang === l.code
                      ? 'bg-zinc-800 text-white font-bold shadow'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-zinc-700 text-zinc-200">
                    {l.badge}
                  </span>
                  <span>{l.label}</span>
                  {titles[l.code] ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400/50 ml-1" title="Traduction manquante" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Title Input for Active Language */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Titre de la page ({activeLang.toUpperCase()}){' '}
              {activeLang === 'fr' && <span className="text-rose-400">*</span>}
            </label>
            <input
              type="text"
              value={titles[activeLang] || ''}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder={`Titre en ${activeLang.toUpperCase()}...`}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              required={activeLang === 'fr'}
            />
          </div>

          {/* Rich Text Toolbar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-300">
                Corps du document ({activeLang.toUpperCase()})
              </label>
              <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300">
                <button
                  type="button"
                  onClick={() => insertTag('<h2>', '</h2>')}
                  title="Titre H2"
                  className="p-1 hover:bg-zinc-800 rounded"
                >
                  <Heading2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTag('<strong>', '</strong>')}
                  title="Gras"
                  className="p-1 hover:bg-zinc-800 rounded"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTag('<em>', '</em>')}
                  title="Italique"
                  className="p-1 hover:bg-zinc-800 rounded"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTag('<ul>\n  <li>', '</li>\n</ul>')}
                  title="Liste à puces"
                  className="p-1 hover:bg-zinc-800 rounded"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTag('<a href="#">', '</a>')}
                  title="Lien hypertexte"
                  className="p-1 hover:bg-zinc-800 rounded"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <textarea
              id="richContentArea"
              value={contents[activeLang] || ''}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder={`Saisissez le contenu HTML/Rich Text en ${activeLang.toUpperCase()}...`}
              rows={12}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-emerald-500 leading-relaxed resize-y"
              required={activeLang === 'fr'}
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 shadow-lg shadow-emerald-600/20"
            >
              {loading ? (
                'Enregistrement...'
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Enregistrer la Page
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

