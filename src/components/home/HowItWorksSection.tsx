'use client';

import React from 'react';
import { Search, Smartphone, QrCode, Sparkles } from 'lucide-react';
import { useApp } from '@/lib/store';

export function HowItWorksSection() {
  const { t } = useApp();

  const steps = [
    {
      num: '01',
      icon: <Search className="w-6 h-6 text-accent-500" />,
      title: t.homeSections?.step1Title || '01. Recherchez ou Proposez',
      desc: t.homeSections?.step1Desc || 'Sélectionnez votre ligne de bus avec choix du siège sur plan, ou proposez directement votre prix pour une course en taxi ou mototaxi (Wewa).',
    },
    {
      num: '02',
      icon: <Smartphone className="w-6 h-6 text-emerald-500" />,
      title: t.homeSections?.step2Title || '02. Payez par Mobile Money',
      desc: t.homeSections?.step2Desc || 'Réglez en toute sécurité via Vodacom M-Pesa, Airtel Money, Orange Money ou Africell Money en Francs Congolais ou Dollars sans frais cachés.',
    },
    {
      num: '03',
      icon: <QrCode className="w-6 h-6 text-primary-600 dark:text-accent-400" />,
      title: t.homeSections?.step3Title || '03. Voyagez en Toute Sérénité',
      desc: t.homeSections?.step3Desc || 'Votre e-ticket muni d\'un QR code inviolable s\'enregistre instantanément sur votre téléphone. Présentez-le au contrôleur sans aucune connexion.',
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-neutral-100/60 dark:bg-neutral-850/50 border-y border-neutral-200/80 dark:border-neutral-800 content-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Simplicité &amp; Rapidité</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            {t.homeSections?.howItWorksTitle || 'Comment fonctionne Transnumerica ?'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-2">
            {t.homeSections?.howItWorksSubtitle || 'Une expérience de transport pensée pour le quotidien et les réalités de la RDC'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="relative bg-white dark:bg-neutral-800 rounded-3xl p-6 sm:p-7 border border-neutral-200/80 dark:border-neutral-700 shadow-elevation-1 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-neutral-50 dark:bg-neutral-750 flex items-center justify-center shadow-inner border border-neutral-200/50 dark:border-neutral-700">
                  {s.icon}
                </div>
                <span aria-hidden="true" className="text-4xl font-black text-neutral-500 dark:text-neutral-400 select-none">
                  {s.num}
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white mb-2">
                  {s.title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
