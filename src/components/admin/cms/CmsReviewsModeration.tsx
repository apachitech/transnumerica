'use client';

import React, { useState } from 'react';
import { CmsReviewItem, CmsReviewStatus } from '@/types';
import {
  MessageSquare,
  Star,
  CheckCircle2,
  EyeOff,
  Trash2,
  RotateCcw,
  Search,
  Filter,
  AlertTriangle,
  User,
  ShieldAlert,
} from 'lucide-react';

interface CmsReviewsModerationProps {
  reviews: CmsReviewItem[];
  onRefresh: () => void;
  onShowFeedback: (msg: string, type?: 'success' | 'error') => void;
}

export function CmsReviewsModeration({
  reviews,
  onRefresh,
  onShowFeedback,
}: CmsReviewsModerationProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [moderatingReview, setModeratingReview] = useState<{
    review: CmsReviewItem;
    action: 'APPROVE' | 'HIDE' | 'DELETE' | 'RESTORE';
  } | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredReviews = reviews.filter((r) => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesSearch =
      !search ||
      r.authorName.toLowerCase().includes(search.toLowerCase()) ||
      r.targetName.toLowerCase().includes(search.toLowerCase()) ||
      r.comment.toLowerCase().includes(search.toLowerCase()) ||
      r.routeDescription.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: CmsReviewStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Approuvé (En ligne)
          </span>
        );
      case 'HIDDEN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <EyeOff className="w-3 h-3" /> Masqué / Modération
          </span>
        );
      case 'DELETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Trash2 className="w-3 h-3" /> Supprimé
          </span>
        );
    }
  };

  const handleConfirmModeration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moderatingReview) return;
    if (reason.trim().length < 4) {
      onShowFeedback('Veuillez renseigner un motif explicite d’au moins 4 caractères.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/cms/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId: moderatingReview.review.id,
          action: moderatingReview.action,
          reason: reason.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la modération');
      }

      setModeratingReview(null);
      setReason('');
      onShowFeedback(`Action de modération (${moderatingReview.action}) enregistrée avec succès`);
      onRefresh();
    } catch (err) {
      onShowFeedback(err instanceof Error ? err.message : 'Erreur', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top filters */}
      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Rechercher par passager, chauffeur, opérateur ou mot-clé..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-500 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">Tous les avis</option>
            <option value="APPROVED">Approuvés (En ligne)</option>
            <option value="HIDDEN">Masqués (En révision)</option>
            <option value="DELETED">Supprimés</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {filteredReviews.length === 0 ? (
          <div className="p-12 text-center bg-zinc-900/30 rounded-2xl border border-zinc-800">
            <MessageSquare className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-zinc-300">Aucun avis client trouvé</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Tous les avis clients passagers sont conformes ou les filtres ne correspondent à aucun résultat.
            </p>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition space-y-3 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 font-bold shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{rev.authorName}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">{rev.authorPhone}</span>
                      {getStatusBadge(rev.status)}
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Concerne : <strong className="text-zinc-200">{rev.targetName}</strong> ({rev.serviceType}) •{' '}
                      {rev.routeDescription}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= rev.rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-zinc-700'
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-xs font-bold text-white">{rev.rating}/5</span>
                </div>
              </div>

              {/* Comment bubble */}
              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-zinc-200 text-xs italic">
                « {rev.comment} »
              </div>

              {/* Moderation notes */}
              {rev.moderationReason && (
                <p className="text-[11px] text-zinc-400">
                  <span className="text-zinc-500">Motif de modération :</span> {rev.moderationReason}{' '}
                  {rev.moderatedBy && `(par ${rev.moderatedBy})`}
                </p>
              )}

              {/* Actions */}
              <div className="pt-2 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] text-zinc-500">
                  Déposé le {new Date(rev.createdAt).toLocaleString('fr-FR')}
                </span>

                <div className="flex items-center gap-2">
                  {rev.status !== 'APPROVED' && (
                    <button
                      onClick={() => setModeratingReview({ review: rev, action: 'APPROVE' })}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Approuver
                    </button>
                  )}

                  {rev.status === 'APPROVED' && (
                    <button
                      onClick={() => setModeratingReview({ review: rev, action: 'HIDE' })}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <EyeOff className="w-3 h-3" /> Masquer
                    </button>
                  )}

                  {rev.status !== 'DELETED' ? (
                    <button
                      onClick={() => setModeratingReview({ review: rev, action: 'DELETE' })}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Trash2 className="w-3 h-3" /> Supprimer
                    </button>
                  ) : (
                    <button
                      onClick={() => setModeratingReview({ review: rev, action: 'RESTORE' })}
                      className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <RotateCcw className="w-3 h-3" /> Restaurer
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Moderation confirmation modal */}
      {moderatingReview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-purple-400" />
                <span>Modération de l'avis — Action: {moderatingReview.action}</span>
              </h3>
              <button
                onClick={() => setModeratingReview(null)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmModeration} className="p-4 sm:p-5 space-y-3.5 text-xs">
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-zinc-300">
                <p className="font-bold text-white">{moderatingReview.review.authorName}</p>
                <p className="text-[11px] text-zinc-400 italic mt-1">« {moderatingReview.review.comment} »</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">
                  Motif obligatoire pour le journal d'audit <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Propos inappropriés, signalement vérifié, diffamation, conformité..."
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 resize-none"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModeratingReview(null)}
                  className="px-3.5 py-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition disabled:opacity-50"
                >
                  {loading ? 'Traitement...' : 'Confirmer la Modération'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

