'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/store';
import {
  HelpCircle,
  X,
  PhoneCall,
  MessageSquare,
  ShieldCheck,
  RotateCcw,
  QrCode,
  Clock,
  ChevronDown,
  ChevronUp,
  Mail,
  Search,
} from 'lucide-react';

interface FaqItem {
  id: string;
  category: 'BILLET' | 'REMBOURSEMENT' | 'COURSES' | 'PAIEMENT';
  question: string;
  answer: string;
  highlight?: string;
}

const FAQS: FaqItem[] = [
  {
    id: 'offline-ticket',
    category: 'BILLET',
    question: 'Mon billet fonctionne-t-il sans connexion internet ?',
    answer:
      'Oui, absolument. Votre e-billet et son QR code officiel sont stockés localement sur votre téléphone dès confirmation de la réservation. Les contrôleurs en gare scannent le code cryptographique hors-ligne sans nécessiter d’accès réseau. Vous pouvez également l’ajouter à votre écran d’accueil ou l’enregistrer au format PDF.',
    highlight: '100% autonome hors-ligne',
  },
  {
    id: 'refund-policy',
    category: 'REMBOURSEMENT',
    question: 'Quelle est la politique d’annulation et de remboursement ?',
    answer:
      'Vous bénéficiez d’une annulation 100% gratuite avec remboursement intégral jusqu’à 24 heures avant le départ. Entre 24h et 2h avant le départ, vous recevez 80% de remboursement ou un changement de date gratuit. Le remboursement est recrédité directement sur votre compte Mobile Money (M-Pesa, Airtel, Orange, Africell) sous 2 à 4 heures.',
    highlight: 'Remboursement Mobile Money en 2-4h',
  },
  {
    id: 'delays-issues',
    category: 'COURSES',
    question: 'Que faire en cas de retard de mon bus ou de mon chauffeur ?',
    answer:
      'Pour les bus, les horaires sont suivis en direct avec les chefs de gare et une alerte SMS vous est envoyée. Pour les courses Wewa/Taxi, vous pouvez suivre le chauffeur sur la carte en temps réel, l’appeler directement ou échanger par WhatsApp. En cas d’imprévu majeur, notre équipe d’assistance intervient sans délai.',
    highlight: 'Suivi direct & support 7j/7',
  },
  {
    id: 'payment-safety',
    category: 'PAIEMENT',
    question: 'Mes paiements Mobile Money et bancaires sont-ils sécurisés ?',
    answer:
      'Tous les flux sont conformes à la réglementation de la Banque Centrale du Congo (BCC). Vos transactions Mobile Money sont validées uniquement par l’invite USSD officielle sur votre téléphone portable : Transnumerica ne demande et ne stocke jamais votre code secret PIN. Les paiements par carte bancaire sont protégés par 3D Secure.',
    highlight: 'Agrément BCC & chiffrement bancaire',
  },
  {
    id: 'sos-safety',
    category: 'COURSES',
    question: 'Comment fonctionne le bouton SOS pendant une course ?',
    answer:
      'Pendant un trajet en moto ou en taxi, un bouton rouge « SOS » est accessible en permanence. Un simple tapotement compose immédiatement la ligne de sécurité d’urgence (112 / Police Nationale Congolaise) et permet de partager votre localisation GPS exacte ainsi que la plaque d’immatriculation du véhicule à vos proches sur WhatsApp.',
    highlight: 'Localisation GPS & contact d’urgence',
  },
];

export function HelpCenterModal() {
  const { showHelpCenterModal, setShowHelpCenterModal } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('refund-policy');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showHelpCenterModal) {
        setShowHelpCenterModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showHelpCenterModal, setShowHelpCenterModal]);

  if (!showHelpCenterModal) return null;

  const filteredFaqs = FAQS.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-center-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-primary-900 text-white p-5 sm:p-6 relative shrink-0">
          <button
            type="button"
            onClick={() => setShowHelpCenterModal(false)}
            aria-label="Fermer le centre d'aide"
            className="absolute top-4 right-4 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-accent-300 shrink-0">
              <HelpCircle className="w-6 h-6 text-accent-300" />
            </div>
            <div>
              <h2 id="help-center-title" className="text-lg font-black text-white leading-tight">
                Centre d&apos;Aide &amp; Sécurité
              </h2>
              <p className="text-xs text-white/80 font-medium">
                Assistance locale Transnumerica en RDC
              </p>
            </div>
          </div>

          {/* Quick search */}
          <div className="mt-4 relative">
            <Search className="w-4 h-4 text-white/60 absolute left-3.5 top-3" aria-hidden="true" />
            <label htmlFor="help-center-search" className="sr-only">
              Rechercher dans le centre d&apos;aide
            </label>
            <input
              id="help-center-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une réponse (remboursement, billet, SOS...)"
              aria-label="Rechercher une réponse dans le centre d'aide"
              className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/60 rounded-xl pl-9 pr-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent-400"
            />
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Direct Support Channels */}
          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">
              Contact direct 7j/7 (06h - 22h) :
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href="https://wa.me/243810000000?text=Bonjour%20Transnumerica%2C%20j%27ai%20besoin%20d%27assistance"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center gap-3 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/70 transition-all text-xs"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <span className="font-extrabold text-neutral-900 dark:text-white block">
                    WhatsApp Support
                  </span>
                  <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-bold block">
                    +243 810 000 000
                  </span>
                </div>
              </a>

              <a
                href="tel:+243810000000"
                className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800 rounded-2xl flex items-center gap-3 hover:bg-blue-100/60 dark:hover:bg-blue-950/70 transition-all text-xs"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-extrabold text-neutral-900 dark:text-white block">
                    Appel Gratuit
                  </span>
                  <span className="text-[11px] text-blue-700 dark:text-blue-400 font-bold block">
                    Assistance usagers
                  </span>
                </div>
              </a>
            </div>
          </div>

          {/* Frequently Asked Questions */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">
              Questions fréquentes :
            </span>

            {filteredFaqs.length === 0 ? (
              <div className="text-center py-6 text-neutral-500 text-xs">
                Aucun résultat pour cette recherche. Contactez notre support WhatsApp directement.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFaqs.map((faq) => {
                  const isExpanded = expandedId === faq.id;

                  return (
                    <div
                      key={faq.id}
                      className="border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden bg-neutral-50/50 dark:bg-neutral-800/40 transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                        className="w-full text-left p-3.5 flex items-center justify-between gap-3 font-extrabold text-xs text-neutral-900 dark:text-white"
                      >
                        <span>{faq.question}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-neutral-500 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-neutral-500 shrink-0" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="px-3.5 pb-3.5 pt-1 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed border-t border-neutral-200/60 dark:border-neutral-700/60 space-y-2 animate-in fade-in duration-150">
                          <p>{faq.answer}</p>
                          {faq.highlight && (
                            <span className="inline-block px-2 py-0.5 rounded-lg bg-accent-100 dark:bg-accent-950/70 border border-accent-300 dark:border-accent-800 text-[10px] font-black text-neutral-900 dark:text-accent-300">
                              ✓ {faq.highlight}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850 shrink-0">
          <button
            type="button"
            onClick={() => setShowHelpCenterModal(false)}
            className="w-full py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-extrabold text-xs rounded-xl shadow-sm"
          >
            Fermer le centre d&apos;aide
          </button>
        </div>
      </div>
    </div>
  );
}

