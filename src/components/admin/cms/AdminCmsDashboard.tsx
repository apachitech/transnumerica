'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CmsSection,
  CmsStaticPage,
  CmsI18nString,
  CmsMediaItem,
  CmsReviewItem,
  CmsStats,
} from '@/types';
import {
  Layers,
  FileText,
  Globe,
  Image as ImageIcon,
  MessageSquare,
  RefreshCw,
  Plus,
  Eye,
  CheckCircle2,
  AlertTriangle,
  History,
  Lock,
  RotateCcw,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { CmsSectionsManager } from './CmsSectionsManager';
import { CmsPageEditorModal } from './CmsPageEditorModal';
import { CmsVersionHistoryModal } from './CmsVersionHistoryModal';
import { CmsTranslationsManager } from './CmsTranslationsManager';
import { CmsMediaLibraryModal } from './CmsMediaLibraryModal';
import { CmsReviewsModeration } from './CmsReviewsModeration';

type CmsTab = 'sections' | 'pages' | 'translations' | 'media' | 'reviews';

export function AdminCmsDashboard() {
  const [activeTab, setActiveTab] = useState<CmsTab>('sections');

  // Collections
  const [sections, setSections] = useState<CmsSection[]>([]);
  const [pages, setPages] = useState<CmsStaticPage[]>([]);
  const [translations, setTranslations] = useState<CmsI18nString[]>([]);
  const [media, setMedia] = useState<CmsMediaItem[]>([]);
  const [reviews, setReviews] = useState<CmsReviewItem[]>([]);
  const [stats, setStats] = useState<CmsStats | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modals state for Static Pages
  const [selectedPageForEdit, setSelectedPageForEdit] = useState<CmsStaticPage | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedPageForHistory, setSelectedPageForHistory] = useState<CmsStaticPage | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Publish / Unpublish prompt state
  const [publishingPage, setPublishingPage] = useState<CmsStaticPage | null>(null);
  const [publishPassword, setPublishPassword] = useState('');
  const [publishReason, setPublishReason] = useState('');
  const [publishLoading, setPublishLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [secRes, pagesRes, transRes, medRes, revRes, statsRes] = await Promise.all([
        fetch('/api/admin/cms/sections'),
        fetch('/api/admin/cms/pages'),
        fetch('/api/admin/cms/translations'),
        fetch('/api/admin/cms/media'),
        fetch('/api/admin/cms/reviews'),
        fetch('/api/admin/cms/stats'),
      ]);

      if (!secRes.ok || !pagesRes.ok || !transRes.ok || !medRes.ok || !revRes.ok || !statsRes.ok) {
        throw new Error('Erreur lors du chargement des modules CMS');
      }

      const [secData, pagesData, transData, medData, revData, statsData] = await Promise.all([
        secRes.json(),
        pagesRes.json(),
        transRes.json(),
        medRes.json(),
        revRes.json(),
        statsRes.json(),
      ]);

      setSections(secData);
      setPages(pagesData);
      setTranslations(transData);
      setMedia(medData);
      setReviews(revData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur inattendue est survenue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleOpenPublishPrompt = (page: CmsStaticPage) => {
    setPublishingPage(page);
    setPublishPassword('');
    setPublishReason(
      page.status === 'PUBLISHED'
        ? 'Mise hors-ligne temporaire pour révision des termes'
        : 'Publication officielle validée par le service juridique & contenu'
    );
  };

  const handleConfirmPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishingPage) return;
    if (!publishPassword) {
      showFeedback('Mot de passe administrateur requis pour la re-authentification', 'error');
      return;
    }

    setPublishLoading(true);
    const targetState = publishingPage.status !== 'PUBLISHED';

    try {
      const res = await fetch(`/api/admin/cms/pages/${publishingPage.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: publishingPage.id,
          publish: targetState,
          password: publishPassword,
          reason: publishReason.trim(),
          version: publishingPage.version,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la publication');
      }

      setPublishingPage(null);
      showFeedback(
        `Page "${data.title.fr}" ${targetState ? 'publiée avec succès' : 'dépubliée (mise en brouillon)'}`
      );
      fetchData();
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Erreur', 'error');
    } finally {
      setPublishLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Gestion de Contenu & CMS Multilingue
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Sections d'accueil, pages statiques (FR, EN, Lingala, Swahili), i18n, médiathèque WebP et modération d'avis
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            aria-label="Actualiser les données"
            className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {activeTab === 'pages' && (
            <button
              onClick={() => {
                setSelectedPageForEdit(null);
                setIsEditorOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 transition shadow-lg shadow-emerald-600/25"
            >
              <Plus className="w-4 h-4" /> Nouvelle Page Statique
            </button>
          )}
        </div>
      </div>

      {/* Global Feedback notification */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-medium">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs hover:underline ml-4 text-zinc-400 hover:text-white"
          >
            Fermer
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Sections d'accueil */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Sections Actives</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-white mt-2">
            {stats ? stats.activeSectionsCount : '—'}{' '}
            <span className="text-xs font-normal text-zinc-500">/ {sections.length}</span>
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">Page d'accueil en direct</p>
        </div>

        {/* Pages Statiques */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Pages Publiées</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-emerald-400 mt-2">
            {stats ? stats.publishedPagesCount : '—'}{' '}
            <span className="text-xs font-normal text-zinc-500">en ligne</span>
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">
            {stats ? stats.totalPagesCount : '—'} page(s) au total
          </p>
        </div>

        {/* Traductions i18n */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Traductions (i18n)</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-white mt-2">
            {stats ? stats.totalTranslationsCount : '—'}
          </p>
          <p className="text-[11px] text-amber-400/90 mt-1">
            {stats ? stats.missingTranslationsCount : 0} avec repli FR
          </p>
        </div>

        {/* Médiathèque WebP */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Médiathèque WebP</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-white mt-2">
            {stats ? stats.totalMediaCount : '—'}{' '}
            <span className="text-xs font-normal text-zinc-500">fichiers</span>
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">
            {stats ? stats.totalMediaSizeKb : '—'} Ko compressés
          </p>
        </div>

        {/* Avis clients */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Avis Clients</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-white mt-2">
            {stats ? stats.approvedReviewsCount : '—'}{' '}
            <span className="text-xs font-normal text-emerald-400">en ligne</span>
          </p>
          <p className="text-[11px] text-rose-400 mt-1">
            {stats ? stats.pendingReviewsCount : 0} à modérer
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-800 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('sections')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'sections'
              ? 'bg-zinc-800 text-white border-b-2 border-blue-500'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          <Layers className="w-4 h-4 text-blue-400" /> Sections Accueil ({sections.length})
        </button>

        <button
          onClick={() => setActiveTab('pages')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'pages'
              ? 'bg-zinc-800 text-white border-b-2 border-emerald-500'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-400" /> Pages Statiques ({pages.length})
        </button>

        <button
          onClick={() => setActiveTab('translations')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'translations'
              ? 'bg-zinc-800 text-white border-b-2 border-amber-500'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          <Globe className="w-4 h-4 text-amber-400" /> Traductions i18n ({translations.length})
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'media'
              ? 'bg-zinc-800 text-white border-b-2 border-purple-500'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          <ImageIcon className="w-4 h-4 text-purple-400" /> Médiathèque WebP ({media.length})
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'reviews'
              ? 'bg-zinc-800 text-white border-b-2 border-rose-500'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-rose-400" /> Modération des Avis ({reviews.length})
        </button>
      </div>

      {/* TAB 1: SECTIONS ACCUEIL */}
      {activeTab === 'sections' && (
        <CmsSectionsManager
          sections={sections}
          onRefresh={fetchData}
          onShowFeedback={showFeedback}
        />
      )}

      {/* TAB 2: PAGES STATIQUES */}
      {activeTab === 'pages' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Pages Institutionnelles & Légales</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Éditeur riche multilingue, historique des versions, publication directe et rollback
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedPageForEdit(null);
                setIsEditorOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 transition shadow-lg shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" /> Créer une Page
            </button>
          </div>

          <div className="space-y-3">
            {pages.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm">{p.title.fr}</h3>
                    <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                      /pages/{p.slug}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        p.status === 'PUBLISHED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : p.status === 'DRAFT'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {p.status === 'PUBLISHED' ? 'En ligne' : p.status === 'DRAFT' ? 'Brouillon' : 'Archivé'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-zinc-400 pt-0.5">
                    <span>v{p.version}</span>
                    <span>•</span>
                    <span>{p.versionHistory.length} révision(s)</span>
                    <span>•</span>
                    <span className="text-zinc-500">
                      Langues : FR{p.title.en ? ', EN' : ''}{p.title.ln ? ', LN' : ''}{p.title.sw ? ', SW' : ''}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60">
                  <a
                    href={`/pages/${p.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium flex items-center gap-1 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-400" /> Voir
                  </a>

                  <button
                    onClick={() => {
                      setSelectedPageForHistory(p);
                      setIsHistoryOpen(true);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium flex items-center gap-1 transition"
                  >
                    <History className="w-3.5 h-3.5 text-amber-400" /> Historique ({p.versionHistory.length})
                  </button>

                  <button
                    onClick={() => {
                      setSelectedPageForEdit(p);
                      setIsEditorOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    Éditer
                  </button>

                  <button
                    onClick={() => handleOpenPublishPrompt(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      p.status === 'PUBLISHED'
                        ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                    }`}
                  >
                    {p.status === 'PUBLISHED' ? 'Dépublier' : 'Publier'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TRADUCTIONS I18N */}
      {activeTab === 'translations' && (
        <CmsTranslationsManager
          translations={translations}
          onRefresh={fetchData}
          onShowFeedback={showFeedback}
        />
      )}

      {/* TAB 4: MÉDIATHÈQUE WEBP */}
      {activeTab === 'media' && (
        <CmsMediaLibraryModal
          media={media}
          onRefresh={fetchData}
          onShowFeedback={showFeedback}
        />
      )}

      {/* TAB 5: AVIS CLIENTS */}
      {activeTab === 'reviews' && (
        <CmsReviewsModeration
          reviews={reviews}
          onRefresh={fetchData}
          onShowFeedback={showFeedback}
        />
      )}

      {/* Modals & Dialogs */}
      <CmsPageEditorModal
        page={selectedPageForEdit}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSuccess={(saved) => {
          setIsEditorOpen(false);
          showFeedback(`Page "${saved.title.fr}" enregistrée avec succès`);
          fetchData();
        }}
        onOpenHistory={(p) => {
          setIsEditorOpen(false);
          setSelectedPageForHistory(p);
          setIsHistoryOpen(true);
        }}
      />

      <CmsVersionHistoryModal
        page={selectedPageForHistory}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSuccess={(updated) => {
          setIsHistoryOpen(false);
          showFeedback(`Page "${updated.slug}" restaurée avec succès vers la version précédente`);
          fetchData();
        }}
      />

      {/* Publish confirmation dialog with re-auth */}
      {publishingPage && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  {publishingPage.status === 'PUBLISHED'
                    ? 'Dépublication de la Page'
                    : 'Publication Immédiate de la Page'}
                </span>
              </h3>
              <button
                onClick={() => setPublishingPage(null)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmPublish} className="p-4 sm:p-5 space-y-3.5 text-xs">
              <p className="text-zinc-300">
                Vous êtes sur le point de {publishingPage.status === 'PUBLISHED' ? 'retirer du site public' : 'mettre en ligne'} la page :{' '}
                <strong className="text-white">{publishingPage.title.fr}</strong> (/pages/{publishingPage.slug}).
              </p>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">
                  Motif obligatoire pour le journal d'audit <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={publishReason}
                  onChange={(e) => setPublishReason(e.target.value)}
                  placeholder="Ex: Validation de la version révisée..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mot de passe administrateur pour confirmation</span>
                  <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  value={publishPassword}
                  onChange={(e) => setPublishPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPublishingPage(null)}
                  className="px-3.5 py-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={publishLoading}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition disabled:opacity-50"
                >
                  {publishLoading ? 'Traitement...' : 'Confirmer l’Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

