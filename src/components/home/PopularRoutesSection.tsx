'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { formatCurrency } from '@/lib/currency';
import { Clock, ArrowRight, Bus, Sparkles } from 'lucide-react';

export function PopularRoutesSection() {
  const { currency, t, dataSaver } = useApp();

  const routes = [
    {
      id: 'kin-mat',
      slug: 'kinshasa-matadi',
      from: 'Kinshasa',
      to: 'Matadi',
      duration: '5h 30m',
      operator: 'Matadi Express VIP',
      priceMinorCDF: 3500000,
      priceMinorUSD: 1250,
      image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80',
      badge: 'Le plus réservé',
      description: 'Liaison directe via la RN1 pavée. Bus climatisé avec Wi-Fi.',
    },
    {
      id: 'lshi-kol',
      slug: 'lubumbashi-kolwezi',
      from: 'Lubumbashi',
      to: 'Kolwezi',
      duration: '5h 30m',
      operator: 'Katanga Horizon',
      priceMinorCDF: 4500000,
      priceMinorUSD: 1600,
      image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80',
      badge: 'Confort VIP',
      description: 'Axe minier Haut-Katanga / Lualaba en autocar grand confort.',
    },
    {
      id: 'kin-kik',
      slug: 'kinshasa-kikwit',
      from: 'Kinshasa',
      to: 'Kikwit',
      duration: '8h 00m',
      operator: 'Classic Coach Congo',
      priceMinorCDF: 4000000,
      priceMinorUSD: 1450,
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      badge: 'Départ Quotidien',
      description: 'Départ chaque matin de la gare de Masina vers le Kwilu.',
    },
    {
      id: 'gom-buk',
      slug: 'goma-bukavu',
      from: 'Goma',
      to: 'Bukavu',
      duration: '3h 00m',
      operator: 'Vedette Lac Kivu',
      priceMinorCDF: 5000000,
      priceMinorUSD: 1800,
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
      badge: 'Express',
      description: 'Bateau rapide et navette terrestre sécurisée.',
    },
  ];

  return (
    <section className="py-12 sm:py-16 content-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Destinations phares</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
              {t.homeSections?.popularRoutes || 'Trajets populaires'}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {t.homeSections?.popularRoutesSubtitle || 'Réservez votre siège à l’avance au meilleur tarif garanti en RDC'}
            </p>
          </div>

          <Link
            href="/bus"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs font-bold transition-colors self-start sm:self-auto min-h-[44px]"
          >
            <span>Toutes les lignes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Photo Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {routes.map((r) => {
            const priceMinor = currency === 'USD' ? r.priceMinorUSD : r.priceMinorCDF;
            const formattedPrice = formatCurrency(priceMinor, currency);

            return (
              <Link
                key={r.id}
                href={`/bus/${r.slug}`}
                className="group relative bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow-elevation-1 hover:shadow-elevation-3 transition-all duration-200 flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              >
                {/* Photo container with gradient scrim or lightweight Data-Saver card */}
                <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-neutral-800 to-neutral-950">
                  {dataSaver ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-gradient-to-br from-[#0A2540] to-[#071322]">
                      <Bus className="w-10 h-10 text-accent-400 mb-2 opacity-80" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                        ⚡ Éco données (-85%)
                      </span>
                    </div>
                  ) : (
                    <picture>
                      <source
                        type="image/webp"
                        srcSet={`${r.image}&auto=format&fit=crop&w=480&q=70&fm=webp 1x, ${r.image}&auto=format&fit=crop&w=800&q=70&fm=webp 2x`}
                      />
                      <img
                        src={`${r.image}&auto=format&fit=crop&w=480&q=70`}
                        alt={`${r.from} vers ${r.to}`}
                        width={480}
                        height={176}
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </picture>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/30 to-transparent" />

                  {/* Top Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-accent-500 text-neutral-950 shadow-sm">
                      {r.badge}
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="absolute top-3 right-3 bg-neutral-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-2xs font-bold flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-accent-400" />
                    <span>{r.duration}</span>
                  </div>

                  {/* City Title over scrim */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="flex items-center gap-1.5 text-base sm:text-lg font-black tracking-tight leading-tight">
                      <span>{r.from}</span>
                      <ArrowRight className="w-4 h-4 text-accent-400 shrink-0" />
                      <span>{r.to}</span>
                    </div>
                  </div>
                </div>

                {/* Content details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-primary-700 dark:text-primary-300 mb-1">
                      <Bus className="w-3.5 h-3.5" />
                      <span>{r.operator}</span>
                    </div>
                    <p className="text-2xs text-neutral-500 dark:text-neutral-400 leading-normal line-clamp-2">
                      {r.description}
                    </p>
                  </div>

                  {/* Price footer: "à partir de X FC" */}
                  <div className="pt-2.5 border-t border-neutral-100 dark:border-neutral-700/60 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                        {t.homeSections?.fromPrice || 'à partir de'}
                      </span>
                      <p className="text-sm sm:text-base font-black text-neutral-900 dark:text-white leading-tight">
                        {formattedPrice}
                      </p>
                    </div>

                    <span className="text-xs font-extrabold text-amber-800 dark:text-amber-300 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      <span>Réserver</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
