'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/lib/store';
import {
  ShieldCheck,
  CheckCircle2,
  X,
  Award,
  FileCheck,
  Car,
  Bus,
  Sparkles,
} from 'lucide-react';

export function VerifiedBadgeModal() {
  const { showVerifiedModal, setShowVerifiedModal, verifiedModalData } = useApp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showVerifiedModal) {
        setShowVerifiedModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showVerifiedModal, setShowVerifiedModal]);

  if (!showVerifiedModal || !verifiedModalData) return null;

  const isOperator = verifiedModalData.type === 'OPERATOR';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="verified-modal-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-primary-900 text-white p-6 relative">
          <button
            type="button"
            onClick={() => setShowVerifiedModal(false)}
            aria-label="Fermer"
            className="absolute top-4 right-4 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-accent-300 shrink-0 shadow-inner">
              <ShieldCheck className="w-7 h-7 text-accent-300" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent-400 text-slate-950 font-black text-[10px] uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3" />
                <span>Certification Officielle Transnumerica</span>
              </div>
              <h2 id="verified-modal-title" className="text-lg font-black text-white leading-tight">
                {verifiedModalData.title}
              </h2>
              <p className="text-xs text-white/80 font-medium">
                {verifiedModalData.entityName}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {isOperator ? (
            /* Operator Criteria (Bus) */
            <div className="space-y-4">
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium">
                La compagnie <strong>{verifiedModalData.entityName}</strong> a validé l&apos;ensemble des audits réglementaires et de sécurité exigés par Transnumerica et les autorités de régulation des transports en République Démocratique du Congo.
              </p>

              <div className="space-y-3">
                <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-200/80 dark:border-blue-800 flex items-start gap-3">
                  <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-xs">
                    <span className="font-extrabold text-neutral-900 dark:text-white block">
                      Permis d&apos;exploitation officiel (Ministère des Transports RDC)
                    </span>
                    <p className="text-neutral-600 dark:text-neutral-300 text-[11px] leading-relaxed">
                      Licence de transport de passagers interurbain en règle et validée pour les axes desservis.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/80 dark:border-emerald-800 flex items-start gap-3">
                  <Bus className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-xs">
                    <span className="font-extrabold text-neutral-900 dark:text-white block">
                      Contrôle technique et maintenance régulière
                    </span>
                    <p className="text-neutral-600 dark:text-neutral-300 text-[11px] leading-relaxed">
                      Inspection périodique obligatoire des autocars (freinage, pneus, climatisation, issues de secours).
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl border border-amber-200/80 dark:border-amber-800 flex items-start gap-3">
                  <Award className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-xs">
                    <span className="font-extrabold text-neutral-900 dark:text-white block">
                      Assurance Responsabilité Civile Voyageurs active
                    </span>
                    <p className="text-neutral-600 dark:text-neutral-300 text-[11px] leading-relaxed">
                      Couverture agréée (SONAS / Rawsur) pour chaque siège réservé sur la plateforme.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-purple-50/60 dark:bg-purple-950/30 rounded-2xl border border-purple-200/80 dark:border-purple-800 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-xs">
                    <span className="font-extrabold text-neutral-900 dark:text-white block">
                      Garantie Ponctualité &amp; Remboursement Transnumerica
                    </span>
                    <p className="text-neutral-600 dark:text-neutral-300 text-[11px] leading-relaxed">
                      En cas d&apos;annulation du transporteur, votre billet vous est remboursé intégralement sous 2 à 4 heures via Mobile Money.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Driver Criteria (Taxi & Wewa) */
            <div className="space-y-4">
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium">
                Le chauffeur <strong>{verifiedModalData.entityName}</strong> est un professionnel agréé par la communauté Transnumerica, ayant satisfait à nos critères rigoureux de sécurité routière en RDC.
              </p>

              <div className="space-y-3">
                <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-200/80 dark:border-blue-800 flex items-start gap-3">
                  <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-xs">
                    <span className="font-extrabold text-neutral-900 dark:text-white block">
                      Permis de conduire national &amp; Pièce d&apos;identité
                    </span>
                    <p className="text-neutral-600 dark:text-neutral-300 text-[11px] leading-relaxed">
                      Permis officiel en cours de validité avec vérification biométrique d&apos;identité.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/80 dark:border-emerald-800 flex items-start gap-3">
                  <Car className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-xs">
                    <span className="font-extrabold text-neutral-900 dark:text-white block">
                      Véhicule immatriculé &amp; contrôlé
                    </span>
                    <p className="text-neutral-600 dark:text-neutral-300 text-[11px] leading-relaxed">
                      Plaque minéralogique vérifiée, deux casques obligatoires pour les motos, carnet de bord à jour.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl border border-amber-200/80 dark:border-amber-800 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-xs">
                    <span className="font-extrabold text-neutral-900 dark:text-white block">
                      Contrôle des antécédents &amp; Charte de confiance
                    </span>
                    <p className="text-neutral-600 dark:text-neutral-300 text-[11px] leading-relaxed">
                      Extrait de casier judiciaire vérifié et engagement formel sur la sécurité des passagers.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-purple-50/60 dark:bg-purple-950/30 rounded-2xl border border-purple-200/80 dark:border-purple-800 flex items-start gap-3">
                  <Award className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-xs">
                    <span className="font-extrabold text-neutral-900 dark:text-white block">
                      Évaluation continue par les passagers
                    </span>
                    <p className="text-neutral-600 dark:text-neutral-300 text-[11px] leading-relaxed">
                      Maintien d&apos;une note minimale de 4.5/5 exigée pour rester actif sur la plateforme.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Calm trust reassurance footer */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowVerifiedModal(false)}
              className="w-full py-3.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-black text-xs rounded-2xl shadow-md hover:opacity-95 active:scale-[0.99] transition-all"
            >
              Compris, fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

