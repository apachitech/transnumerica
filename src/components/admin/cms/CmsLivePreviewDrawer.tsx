'use client';

import React, { useState } from 'react';
import { CmsSection } from '@/types';
import {
  X,
  Smartphone,
  Monitor,
  Eye,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Search,
} from 'lucide-react';

interface CmsLivePreviewDrawerProps {
  sections: CmsSection[];
  isOpen: boolean;
  onClose: () => void;
}

export function CmsLivePreviewDrawer({
  sections,
  isOpen,
  onClose,
}: CmsLivePreviewDrawerProps) {
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('desktop');

  if (!isOpen) return null;

  const sortedSections = [...sections]
    .filter((s) => s.isActive)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-5xl bg-zinc-950 border-l border-zinc-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Aperçu en Direct — Page d'Accueil Publique
              </h2>
              <p className="text-xs text-zinc-400">
                Rendu dynamique sans redéploiement ({sortedSections.length} sections actives)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Viewport switcher */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
              <button
                onClick={() => setDeviceMode('mobile')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition ${
                  deviceMode === 'mobile'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> Mobile 360px
              </button>
              <button
                onClick={() => setDeviceMode('desktop')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition ${
                  deviceMode === 'desktop'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" /> Bureau 1280px
              </button>
            </div>

            <button
              onClick={onClose}
              aria-label="Fermer l'aperçu"
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Frame Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-900/40 flex justify-center items-start">
          <div
            className={`transition-all duration-200 border border-zinc-800 bg-neutral-950 rounded-2xl shadow-2xl overflow-hidden ${
              deviceMode === 'mobile' ? 'w-[360px] max-w-full' : 'w-full max-w-4xl'
            }`}
          >
            {/* Fake browser bar */}
            <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/90 flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              </div>
              <div className="flex-1 text-center font-mono text-[11px] text-zinc-400 bg-zinc-950 px-3 py-0.5 rounded-md border border-zinc-800 truncate">
                https://transnumerica.cd/
              </div>
            </div>

            {/* Render Public Sections */}
            <div className="divide-y divide-zinc-800/40 space-y-6 p-4 sm:p-6 text-zinc-100">
              {sortedSections.map((sec) => {
                if (sec.type === 'hero') {
                  return (
                    <div key={sec.id} className="text-center py-6 space-y-4">
                      {sec.content.badgePill && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                          <span>{sec.content.badgePill}</span>
                        </div>
                      )}
                      <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
                        {sec.content.headline}
                      </h1>
                      <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                        {sec.content.subheadline}
                      </p>
                      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 max-w-md mx-auto flex items-center justify-between text-xs text-zinc-400">
                        <span className="flex items-center gap-2">
                          <Search className="w-4 h-4 text-emerald-400" />
                          <span>Kinshasa → Matadi, Kikwit, Lubumbashi...</span>
                        </span>
                        <span className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs">
                          {sec.content.ctaText || 'Rechercher'}
                        </span>
                      </div>
                    </div>
                  );
                }

                if (sec.type === 'popular_routes') {
                  const routes = sec.content.routes || [];
                  return (
                    <div key={sec.id} className="py-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                          {sec.title}
                        </h3>
                        <span className="text-xs text-emerald-400">Voir tout →</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {routes.map((r: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between"
                          >
                            <div>
                              <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded">
                                {r.tag}
                              </span>
                              <p className="font-bold text-xs text-white mt-1">
                                {r.origin} ↔ {r.destination}
                              </p>
                              <span className="text-[10px] text-zinc-500">{r.duration}</span>
                            </div>
                            <span className="font-bold text-xs text-emerald-400">
                              À partir de {r.priceCdf?.toLocaleString('fr-FR')} CDF
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (sec.type === 'banners') {
                  return (
                    <div
                      key={sec.id}
                      className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2 text-amber-300">
                        <span className="bg-amber-500 text-zinc-950 px-2 py-0.5 rounded font-black text-[10px]">
                          {sec.content.badge || 'INFO'}
                        </span>
                        <span>{sec.content.bannerText}</span>
                      </div>
                      {sec.content.linkText && (
                        <span className="font-bold text-amber-400 underline whitespace-nowrap">
                          {sec.content.linkText}
                        </span>
                      )}
                    </div>
                  );
                }

                if (sec.type === 'how_it_works') {
                  const steps = sec.content.steps || [];
                  return (
                    <div key={sec.id} className="py-4 space-y-3">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider text-center">
                        {sec.title}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {steps.map((st: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center space-y-1"
                          >
                            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 inline-flex items-center justify-center font-bold text-xs">
                              {st.step}
                            </span>
                            <h4 className="font-bold text-xs text-white">{st.title}</h4>
                            <p className="text-[11px] text-zinc-400">{st.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (sec.type === 'faq') {
                  const items = sec.content.items || [];
                  return (
                    <div key={sec.id} className="py-4 space-y-2">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        {sec.title}
                      </h3>
                      <div className="space-y-2">
                        {items.map((it: any, idx: number) => (
                          <div key={idx} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
                            <p className="font-bold text-zinc-200">{it.q}</p>
                            <p className="text-zinc-400 text-[11px] mt-1">{it.a}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (sec.type === 'trust_section') {
                  const pillars = sec.content.pillars || [];
                  return (
                    <div key={sec.id} className="py-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {pillars.map((p: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-2.5 text-xs"
                          >
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-bold text-white">{p.title}</h4>
                              <p className="text-[11px] text-zinc-400 mt-0.5">{p.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                // Fallback rendering for any other section
                return (
                  <div key={sec.id} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
                    <span className="font-bold text-zinc-300">{sec.title}</span>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Section de type: {sec.type}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs text-zinc-400">
          <span>Modifications appliquées en temps réel sans recompilation.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition"
          >
            Fermer l'aperçu
          </button>
        </div>
      </div>
    </div>
  );
}

