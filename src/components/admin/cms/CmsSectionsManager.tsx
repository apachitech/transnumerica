'use client';

import React, { useState } from 'react';
import { CmsSection, CmsSectionType } from '@/types';
import {
  Layers,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  GripVertical,
  Sliders,
  Plus,
} from 'lucide-react';
import { CmsLivePreviewDrawer } from './CmsLivePreviewDrawer';

interface CmsSectionsManagerProps {
  sections: CmsSection[];
  onRefresh: () => void;
  onShowFeedback: (msg: string, type?: 'success' | 'error') => void;
}

export function CmsSectionsManager({
  sections,
  onRefresh,
  onShowFeedback,
}: CmsSectionsManagerProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<CmsSection | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [editSchedulePublish, setEditSchedulePublish] = useState<string>('');
  const [editScheduleUnpublish, setEditScheduleUnpublish] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const sortedSections = [...sections].sort((a, b) => a.orderIndex - b.orderIndex);

  const handleMove = async (index: number, direction: 'UP' | 'DOWN') => {
    const newIdx = direction === 'UP' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= sortedSections.length) return;

    const reordered = [...sortedSections];
    const temp = reordered[index];
    reordered[index] = reordered[newIdx];
    reordered[newIdx] = temp;

    const orderedIds = reordered.map((s) => s.id);

    try {
      const res = await fetch('/api/admin/cms/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      });

      if (!res.ok) {
        throw new Error('Erreur lors du réordonnancement');
      }

      onShowFeedback('Ordre des sections mis à jour avec succès');
      onRefresh();
    } catch (err) {
      onShowFeedback(err instanceof Error ? err.message : 'Erreur', 'error');
    }
  };

  const handleToggleActive = async (sec: CmsSection) => {
    try {
      const res = await fetch('/api/admin/cms/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sec,
          isActive: !sec.isActive,
          version: sec.version,
        }),
      });

      if (!res.ok) {
        throw new Error('Erreur lors du basculement');
      }

      onShowFeedback(`Section "${sec.title}" ${!sec.isActive ? 'activée' : 'désactivée'}`);
      onRefresh();
    } catch (err) {
      onShowFeedback(err instanceof Error ? err.message : 'Erreur', 'error');
    }
  };

  const openEditModal = (sec: CmsSection) => {
    setEditingSection(sec);
    setEditTitle(sec.title);
    setEditActive(sec.isActive);
    setEditSchedulePublish(sec.scheduledPublishAt || '');
    setEditScheduleUnpublish(sec.scheduledUnpublishAt || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;

    setSaving(true);
    try {
      const res = await fetch('/api/admin/cms/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingSection.id,
          type: editingSection.type,
          title: editTitle.trim(),
          orderIndex: editingSection.orderIndex,
          isActive: editActive,
          scheduledPublishAt: editSchedulePublish ? editSchedulePublish : null,
          scheduledUnpublishAt: editScheduleUnpublish ? editScheduleUnpublish : null,
          content: editingSection.content,
          version: editingSection.version,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la modification');
      }

      setEditingSection(null);
      onShowFeedback('Section enregistrée avec succès');
      onRefresh();
    } catch (err) {
      onShowFeedback(err instanceof Error ? err.message : 'Erreur', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Sections de la Page d'Accueil & Ordonnancement</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Réorganisez l'ordre d'affichage, programmez les dates de parution et prévisualisez en direct
          </p>
        </div>

        <button
          onClick={() => setIsPreviewOpen(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition shadow-lg shadow-blue-600/20"
        >
          <Eye className="w-4 h-4" /> Aperçu en Direct
        </button>
      </div>

      {/* Sections List */}
      <div className="space-y-2.5">
        {sortedSections.map((sec, idx) => (
          <div
            key={sec.id}
            className="p-3.5 sm:p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-3">
              {/* Order number */}
              <span className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-zinc-300 text-xs shrink-0">
                #{idx + 1}
              </span>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm">{sec.title}</h3>
                  <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/60">
                    type: {sec.type}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      sec.isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {sec.isActive ? 'Active' : 'Désactivée'}
                  </span>
                </div>

                {/* Scheduling info */}
                {(sec.scheduledPublishAt || sec.scheduledUnpublishAt) && (
                  <p className="text-[11px] text-amber-400/90 flex items-center gap-1.5 pt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>
                      {sec.scheduledPublishAt &&
                        `Publié dès le ${new Date(sec.scheduledPublishAt).toLocaleDateString('fr-FR')}`}
                      {sec.scheduledUnpublishAt &&
                        ` jusqu'au ${new Date(sec.scheduledUnpublishAt).toLocaleDateString('fr-FR')}`}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Actions: Reorder arrows, edit, active toggle */}
            <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60">
              <div className="flex items-center gap-1">
                <button
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, 'UP')}
                  aria-label="Monter d'une position"
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800 text-zinc-300 transition"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  disabled={idx === sortedSections.length - 1}
                  onClick={() => handleMove(idx, 'DOWN')}
                  aria-label="Descendre d'une position"
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800 text-zinc-300 transition"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => handleToggleActive(sec)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  sec.isActive
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                    : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                }`}
              >
                {sec.isActive ? 'Désactiver' : 'Activer'}
              </button>

              <button
                onClick={() => openEditModal(sec)}
                className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1 transition"
              >
                <Edit2 className="w-3 h-3" /> Paramètres
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Section Modal */}
      {editingSection && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span>Paramètres de la Section — {editingSection.title}</span>
              </h3>
              <button
                onClick={() => setEditingSection(null)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-4 sm:p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Titre de la section</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Début de diffusion programmée</span>
                  </label>
                  <input
                    type="text"
                    value={editSchedulePublish}
                    onChange={(e) => setEditSchedulePublish(e.target.value)}
                    placeholder="2026-11-01T00:00:00Z"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Fin de diffusion programmée</span>
                  </label>
                  <input
                    type="text"
                    value={editScheduleUnpublish}
                    onChange={(e) => setEditScheduleUnpublish(e.target.value)}
                    placeholder="2026-12-31T23:59:59Z"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                  className="rounded bg-zinc-950 border-zinc-700 text-blue-500 focus:ring-0"
                />
                <label htmlFor="activeCheck" className="text-xs text-zinc-300">
                  Section active sur le site public
                </label>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition disabled:opacity-50"
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Preview Drawer */}
      <CmsLivePreviewDrawer
        sections={sections}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}

