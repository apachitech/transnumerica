'use client';

import React, { useState } from 'react';
import { CmsMediaItem } from '@/types';
import {
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  Copy,
  Check,
  Search,
  Filter,
  AlertTriangle,
  FileCheck,
  Tag,
  Plus,
  X,
} from 'lucide-react';

interface CmsMediaLibraryModalProps {
  media: CmsMediaItem[];
  onRefresh: () => void;
  onShowFeedback: (msg: string, type?: 'success' | 'error') => void;
}

export function CmsMediaLibraryModal({
  media,
  onRefresh,
  onShowFeedback,
}: CmsMediaLibraryModalProps) {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Upload form state
  const [filename, setFilename] = useState('');
  const [altText, setAltText] = useState('');
  const [tags, setTags] = useState('');
  const [originalSizeKb, setOriginalSizeKb] = useState(380);
  const [uploading, setUploading] = useState(false);

  const filteredMedia = media.filter((m) => {
    return (
      !search ||
      m.filename.toLowerCase().includes(search.toLowerCase()) ||
      m.altText.toLowerCase().includes(search.toLowerCase()) ||
      m.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const handleCopyUrl = (item: CmsMediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    onShowFeedback(`URL copiée dans le presse-papiers : ${item.url}`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = async (item: CmsMediaItem) => {
    if (!window.confirm(`Confirmer la suppression du fichier "${item.filename}" ?`)) return;

    try {
      const res = await fetch(`/api/admin/cms/media/${item.id}?reason=Suppression+depuis+la+médiathèque`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      onShowFeedback('Fichier média supprimé avec succès');
      onRefresh();
    } catch (err) {
      onShowFeedback(err instanceof Error ? err.message : 'Erreur', 'error');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filename.trim()) {
      onShowFeedback('Veuillez renseigner un nom de fichier.', 'error');
      return;
    }

    setUploading(true);
    // Simulate instant WebP compression with ~72% reduction
    const origBytes = originalSizeKb * 1024;
    const compBytes = Math.round(origBytes * 0.28);

    const safeName = filename.trim().toLowerCase().replace(/\s+/g, '-');
    const webpName = safeName.endsWith('.webp') ? safeName : `${safeName.replace(/\.[^/.]+$/, '')}.webp`;

    try {
      const res = await fetch('/api/admin/cms/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: webpName,
          url: `/images/cms/${webpName}`,
          mimeType: 'image/webp',
          originalSize: origBytes,
          compressedSize: compBytes,
          altText: altText.trim() || webpName,
          width: 1200,
          height: 800,
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors du téléversement');
      }

      setIsUploadOpen(false);
      setFilename('');
      setAltText('');
      setTags('');
      onShowFeedback(`Média téléversé et compressé en WebP avec succès (-72% de bande passante)`);
      onRefresh();
    } catch (err) {
      onShowFeedback(err instanceof Error ? err.message : 'Erreur', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Rechercher par nom de fichier, texte alternatif ou étiquette..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition shadow-lg shadow-blue-600/20 whitespace-nowrap"
        >
          <UploadCloud className="w-4 h-4" /> Téléverser & Compresser en WebP
        </button>
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="p-12 text-center bg-zinc-900/30 rounded-2xl border border-zinc-800">
          <ImageIcon className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-zinc-300">Aucun fichier média trouvé</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Téléversez des images au format WebP pour optimiser le temps de chargement 3G en RDC.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-zinc-900/80 border border-zinc-800 overflow-hidden hover:border-zinc-700 transition flex flex-col group text-xs"
            >
              {/* Fake visual preview card */}
              <div className="h-36 bg-zinc-950 flex flex-col items-center justify-center p-4 relative border-b border-zinc-800/60">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <span className="text-[11px] text-zinc-300 font-bold mt-2 truncate max-w-full px-2">
                  {item.filename}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {item.width} × {item.height} px
                </span>

                {/* Compression Badge */}
                <div className="absolute top-2.5 right-2.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    -{item.compressionRatio}% WebP
                  </span>
                </div>
              </div>

              {/* Media Details */}
              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
                <div>
                  <p className="text-xs text-zinc-200 line-clamp-2" title={item.altText}>
                    Alt : <span className="text-zinc-400 italic font-normal">"{item.altText}"</span>
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Taille : {(item.compressedSize / 1024).toFixed(0)} Ko{' '}
                    <span className="text-zinc-600 line-through">
                      ({(item.originalSize / 1024).toFixed(0)} Ko)
                    </span>
                  </p>
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {item.tags.map((t, idx) => (
                        <span key={idx} className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                  <button
                    onClick={() => handleCopyUrl(item)}
                    className="text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Copié !
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-blue-400" /> Copier URL
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(item)}
                    title="Supprimer le fichier"
                    className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-blue-400" />
                <span>Téléversement & Compression WebP Automatique</span>
              </h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-4 sm:p-5 space-y-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-blue-400" />
                  <span>Compression Next-Gen WebP activée</span>
                </p>
                <p className="text-blue-200/80 text-[11px]">
                  Toutes les images téléversées sont compressées pour réduire le poids jusqu'à 75% tout en préservant une netteté optimale pour les écrans mobiles 3G en RDC.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">
                  Nom du fichier image <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="ex: matadi-express-bus-vip.jpg"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">
                  Texte alternatif (Accessibilité & SEO) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="ex: Autocar climatisé Transco au départ de la Gare de Kinshasa"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">
                  Étiquettes / Tags (séparés par une virgule)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="hero, bus, kinshasa, partenaire"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                  <span>Poids original du fichier source : {originalSizeKb} Ko</span>
                  <span className="text-emerald-400 font-bold">
                    Poids WebP estimé : {Math.round(originalSizeKb * 0.28)} Ko (-72%)
                  </span>
                </label>
                <input
                  type="range"
                  min={50}
                  max={2000}
                  step={50}
                  value={originalSizeKb}
                  onChange={(e) => setOriginalSizeKb(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition disabled:opacity-50"
                >
                  {uploading ? 'Compression...' : 'Téléverser et Convertir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

