'use client';

import React, { useState } from 'react';
import { CmsI18nString, SupportedLanguage } from '@/types';
import {
  Globe,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  Edit2,
  Check,
  Plus,
} from 'lucide-react';

interface CmsTranslationsManagerProps {
  translations: CmsI18nString[];
  onRefresh: () => void;
  onShowFeedback: (msg: string, type?: 'success' | 'error') => void;
}

export function CmsTranslationsManager({
  translations,
  onRefresh,
  onShowFeedback,
}: CmsTranslationsManagerProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [missingOnly, setMissingOnly] = useState(false);
  const [needsReviewOnly, setNeedsReviewOnly] = useState(false);

  // Edit modal state
  const [editingString, setEditingString] = useState<CmsI18nString | null>(null);
  const [formKey, setFormKey] = useState('');
  const [formCategory, setFormCategory] = useState<'common' | 'home' | 'bus' | 'rides' | 'auth' | 'footer' | 'payouts'>('common');
  const [formFr, setFormFr] = useState('');
  const [formEn, setFormEn] = useState('');
  const [formLn, setFormLn] = useState('');
  const [formSw, setFormSw] = useState('');
  const [formNeedsReview, setFormNeedsReview] = useState(false);
  const [saving, setSaving] = useState(false);

  const filteredTranslations = translations.filter((t) => {
    const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory;
    const matchesSearch =
      !search ||
      t.key.toLowerCase().includes(search.toLowerCase()) ||
      t.translations.fr.toLowerCase().includes(search.toLowerCase()) ||
      t.translations.en.toLowerCase().includes(search.toLowerCase()) ||
      t.translations.ln.toLowerCase().includes(search.toLowerCase()) ||
      t.translations.sw.toLowerCase().includes(search.toLowerCase());

    const hasMissing = !t.translations.en || !t.translations.ln || !t.translations.sw;
    const matchesMissing = !missingOnly || hasMissing;
    const matchesNeedsReview = !needsReviewOnly || t.needsReview;

    return matchesCategory && matchesSearch && matchesMissing && matchesNeedsReview;
  });

  const openEditModal = (item?: CmsI18nString) => {
    if (item) {
      setEditingString(item);
      setFormKey(item.key);
      setFormCategory(item.category);
      setFormFr(item.translations.fr || '');
      setFormEn(item.translations.en || '');
      setFormLn(item.translations.ln || '');
      setFormSw(item.translations.sw || '');
      setFormNeedsReview(item.needsReview);
    } else {
      setEditingString(null);
      setFormKey('');
      setFormCategory('common');
      setFormFr('');
      setFormEn('');
      setFormLn('');
      setFormSw('');
      setFormNeedsReview(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKey.trim() || !formFr.trim()) {
      onShowFeedback('La clé et la version française sont obligatoires.', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: editingString?.id,
        key: formKey.trim(),
        category: formCategory,
        translations: {
          fr: formFr.trim(),
          en: formEn.trim(),
          ln: formLn.trim(),
          sw: formSw.trim(),
        },
        needsReview: formNeedsReview,
        version: editingString?.version,
      };

      const res = await fetch('/api/admin/cms/translations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de l’enregistrement');
      }

      setEditingString(null);
      onShowFeedback('Traduction enregistrée avec succès');
      onRefresh();
    } catch (err) {
      onShowFeedback(err instanceof Error ? err.message : 'Erreur', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top filter bar */}
      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Rechercher par clé ou texte (Français, Lingala, Swahili, Anglais)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Toutes les catégories</option>
              <option value="common">Général (common)</option>
              <option value="home">Accueil (home)</option>
              <option value="bus">Bus & Corridors (bus)</option>
              <option value="rides">Courses & Taxis (rides)</option>
              <option value="footer">Pied de page (footer)</option>
              <option value="payouts">Finances (payouts)</option>
            </select>

            <button
              onClick={() => openEditModal()}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap shadow-md shadow-amber-600/20"
            >
              <Plus className="w-3.5 h-3.5" /> Nouvelle Clé
            </button>
          </div>
        </div>

        {/* Quick toggle chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => setMissingOnly(!missingOnly)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              missingOnly
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Traductions Manquantes Uniquement (Lingala / Swahili)</span>
          </button>

          <button
            onClick={() => setNeedsReviewOnly(!needsReviewOnly)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              needsReviewOnly
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>À Réviser (Needs Review)</span>
          </button>
        </div>
      </div>

      {/* Translations List */}
      <div className="space-y-2.5">
        {filteredTranslations.length === 0 ? (
          <div className="p-10 text-center bg-zinc-900/30 rounded-2xl border border-zinc-800">
            <Globe className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-zinc-300">Aucune chaîne trouvée</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Ajustez vos filtres ou ajoutez une nouvelle clé i18n.
            </p>
          </div>
        ) : (
          filteredTranslations.map((item) => (
            <div
              key={item.id}
              className="p-3.5 sm:p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-amber-400">{item.key}</span>
                  <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                  {item.needsReview && (
                    <span className="text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full">
                      À réviser
                    </span>
                  )}
                </div>

                <button
                  onClick={() => openEditModal(item)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1 transition"
                >
                  <Edit2 className="w-3 h-3 text-amber-400" /> Modifier
                </button>
              </div>

              {/* Grid of translations in 4 languages */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
                <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Français (FR) :</span>
                  <p className="text-zinc-200 font-medium text-xs mt-0.5 truncate">
                    {item.translations.fr || <span className="text-rose-500 italic">Vide</span>}
                  </p>
                </div>

                <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">English (EN) :</span>
                  <p className="text-zinc-300 text-xs mt-0.5 truncate">
                    {item.translations.en || <span className="text-amber-500/70 italic">Manquant</span>}
                  </p>
                </div>

                <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Lingála (LN) :</span>
                  <p className="text-zinc-300 text-xs mt-0.5 truncate">
                    {item.translations.ln || <span className="text-amber-500/70 italic">Manquant</span>}
                  </p>
                </div>

                <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Kiswahili (SW) :</span>
                  <p className="text-zinc-300 text-xs mt-0.5 truncate">
                    {item.translations.sw || <span className="text-amber-500/70 italic">Manquant</span>}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit / Create Translation Modal */}
      {(editingString !== null || formKey !== '') && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400" />
                <span>{editingString ? `Modifier : ${editingString.key}` : 'Nouvelle Clé i18n'}</span>
              </h3>
              <button
                onClick={() => {
                  setEditingString(null);
                  setFormKey('');
                }}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 sm:p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Clé unique (key)</label>
                  <input
                    type="text"
                    value={formKey}
                    disabled={!!editingString}
                    onChange={(e) => setFormKey(e.target.value)}
                    placeholder="ex: home.cta_button"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500 disabled:opacity-60"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Catégorie</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="common">Général (common)</option>
                    <option value="home">Accueil (home)</option>
                    <option value="bus">Bus & Corridors (bus)</option>
                    <option value="rides">Courses (rides)</option>
                    <option value="footer">Pied de page (footer)</option>
                    <option value="payouts">Finances (payouts)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">
                  Français (FR — Langue de référence) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formFr}
                  onChange={(e) => setFormFr(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">English (EN)</label>
                <input
                  type="text"
                  value={formEn}
                  onChange={(e) => setFormEn(e.target.value)}
                  placeholder="Translation in English..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Lingála (LN)</label>
                <input
                  type="text"
                  value={formLn}
                  onChange={(e) => setFormLn(e.target.value)}
                  placeholder="Bobongoli na Lingála..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">Kiswahili (SW)</label>
                <input
                  type="text"
                  value={formSw}
                  onChange={(e) => setFormSw(e.target.value)}
                  placeholder="Tafsiri kwa Kiswahili..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60">
                <input
                  type="checkbox"
                  id="reviewCheck"
                  checked={formNeedsReview}
                  onChange={(e) => setFormNeedsReview(e.target.checked)}
                  className="rounded bg-zinc-950 border-zinc-700 text-purple-500 focus:ring-0"
                />
                <label htmlFor="reviewCheck" className="text-xs text-zinc-300">
                  Marquer comme "À réviser" (Needs Review)
                </label>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingString(null);
                    setFormKey('');
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold transition disabled:opacity-50"
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

