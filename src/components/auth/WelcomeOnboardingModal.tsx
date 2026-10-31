'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { Bus, Bike, CreditCard, ShieldCheck, ArrowRight, X, Sparkles } from 'lucide-react';

export function WelcomeOnboardingModal() {
  const { showOnboardingModal, setShowOnboardingModal, setShowAuthModal } = useApp();

  if (!showOnboardingModal) return null;

  const handleDismiss = () => {
    try {
      localStorage.setItem('tn_onboarding_seen', 'true');
    } catch {}
    setShowOnboardingModal(false);
  };

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showOnboardingModal) {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showOnboardingModal]);

  const handleOpenLogin = () => {
    handleDismiss();
    setShowAuthModal(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl border-2 border-neutral-200 dark:border-neutral-800 animate-in slide-in-from-bottom-6 duration-300">
        {/* Top Header Row with Skip Button */}
        <div className="flex items-center justify-between pb-1 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Nouveau
            </span>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Mobilité Unifiée RDC
            </span>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="px-2.5 py-1 text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-lg transition-colors flex items-center gap-1"
            aria-label="Passer l'introduction"
          >
            <span>Passer</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hero Title */}
        <div className="space-y-1">
          <h2 id="onboarding-title" className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            Bienvenue sur <span className="text-primary-600 dark:text-accent-400">Transnumerica</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
            Votre plateforme officielle pour voyager partout en République Démocratique du Congo.
          </p>
        </div>

        {/* 3 Value Pillars */}
        <div className="space-y-2.5 text-xs">
          {/* Pillar 1: Bus Interurbains */}
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200/80 dark:border-neutral-700/80 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-300 flex items-center justify-center shrink-0 font-bold text-lg">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-neutral-900 dark:text-white text-xs">
                Autocars Interurbains & Billet Hors-Ligne
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-[11px] mt-0.5 leading-snug">
                Sélectionnez votre siège sur plan, comparez les compagnies agréées et recevez un pass QR scannable sans internet.
              </p>
            </div>
          </div>

          {/* Pillar 2: Wewa & Taxi */}
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200/80 dark:border-neutral-700/80 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 font-bold text-lg">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-neutral-900 dark:text-white text-xs">
                Wewa (Motos) & Taxis à Tarif Négocié
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-[11px] mt-0.5 leading-snug">
                Proposez votre prix, négociez avec des chauffeurs vérifiés et sécurisez votre trajet grâce au Code PIN obligatoire.
              </p>
            </div>
          </div>

          {/* Pillar 3: Paiements RDC */}
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200/80 dark:border-neutral-700/80 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 font-bold text-lg">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-neutral-900 dark:text-white text-xs">
                Paiements Sécurisés en Francs Congolais ou USD
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-[11px] mt-0.5 leading-snug">
                M-Pesa, Airtel Money, Orange Money, Africell Money, cartes bancaires ou espèces au guichet.
              </p>
            </div>
          </div>
        </div>

        {/* Free Browsing Reassurance */}
        <div className="p-2.5 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-xl flex items-center gap-2 text-[11px] text-sky-900 dark:text-sky-200 font-medium">
          <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
          <span>Navigation et recherche 100% libres sans obligation de connexion.</span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {/* Primary Action: Commencer à explorer */}
          <button
            type="button"
            onClick={handleDismiss}
            className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all min-h-[46px]"
          >
            <span>Commencer à explorer</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Secondary Action: Se connecter */}
          <button
            type="button"
            onClick={handleOpenLogin}
            className="w-full py-2.5 text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white font-bold text-xs rounded-xl transition-colors"
          >
            J&apos;ai déjà un compte • Se connecter
          </button>
        </div>
      </div>
    </div>
  );
}

