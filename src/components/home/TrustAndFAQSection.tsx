'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Smartphone,
  ChevronDown,
  MessageCircle,
  UserCheck,
  Headphones,
  CheckCircle2,
} from 'lucide-react';

export function TrustAndFAQSection() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const partners = [
    { name: 'Classic Coach Congo', category: 'Bus Interurbain', icon: '🚍' },
    { name: 'Matadi Express VIP', category: 'Liaison Rapide', icon: '⚡' },
    { name: 'Katanga Horizon', category: 'Autocar Grand Confort', icon: '🦁' },
    { name: 'TRANSCO Interurbain', category: 'Réseau National', icon: '🚌' },
    { name: 'COWEMOTO Kinshasa', category: 'Flotte Motos Vérifiées', icon: '🏍️' },
    { name: 'Association Taxis Jaunes', category: 'Taxis Urbains Agréés', icon: '🚕' },
  ];

  const faqs = [
    {
      q: 'Comment fonctionne le billet de bus hors-ligne (sans connexion internet) ?',
      a: 'Dès validation de votre paiement, votre billet électronique contenant un QR code chiffré est automatiquement sauvegardé dans la mémoire de votre téléphone (PWA et Service Worker). Même en zone blanche sur la Route Nationale (RN1 vers Matadi ou Kikwit, RN39 dans le Katanga), vous pouvez présenter votre QR code au contrôleur sans aucune connexion.',
    },
    {
      q: 'Comment indiquer mon adresse de départ ou de destination sans nom de rue officiel ?',
      a: 'À Kinshasa, Lubumbashi et dans les grandes agglomérations congolaises, le repérage est informel. Transnumerica intègre un index de plus de 500 repères populaires (rond-points, stations-services, arrêts connus, universités, marchés). Vous pouvez aussi utiliser le bouton "Ma position GPS" ou ajouter une note directe au chauffeur ("En face de la station Total", "Sous l\'abribus").',
    },
    {
      q: 'Quels sont les opérateurs Mobile Money supportés et les devises ?',
      a: 'Nous supportons directement Vodacom M-Pesa, Airtel Money, Orange Money et Africell Money. Vous réglez directement en Francs Congolais (CDF) ou en Dollars US (USD) au taux officiel sans aucun frais caché. Pour les courses urbaines en Taxi et Moto, le règlement en espèces (Cash) est également possible.',
    },
    {
      q: 'Comment fonctionne la négociation de tarif à la inDrive ?',
      a: 'Pour le Taxi et la Moto (Wewa), Transnumerica calcule un tarif conseillé équitable selon la distance et la circulation, mais vous restez libre de proposer votre propre prix. Les chauffeurs à proximité reçoivent votre offre et peuvent l\'accepter instantanément ou vous faire une contre-proposition. Vous choisissez librement selon le prix, la note et le modèle de véhicule.',
    },
    {
      q: 'La sécurité et le port du casque passager sont-ils obligatoires en mototaxi ?',
      a: 'La sécurité est non-négociable. Tous les motocyclistes enregistrés ont l\'obligation de fournir un casque homologué pour le passager. Vous pouvez cocher l\'option "Casque passager obligatoire" avant de lancer votre recherche. Si le conducteur se présente sans casque, vous pouvez refuser la course sans aucun frais.',
    },
  ];

  return (
    <section className="py-12 sm:py-16 content-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* ==========================================================================
            1. TRUST SECTION: 3 KEY PILLARS (Mobile Money, Verified Drivers, 24/7 WhatsApp)
            ========================================================================== */}
        <div className="mb-14 sm:mb-16">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
              Pourquoi choisir Transnumerica ?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-2">
              Une infrastructure sécurisée et un engagement sans compromis pour votre sérénité
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {/* Pillar 1: Secure Mobile Money */}
            <div className="bg-white dark:bg-neutral-800 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-700 shadow-elevation-1 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-accent-600 dark:text-accent-400 flex items-center justify-center mb-4 shadow-sm border border-amber-200/40 dark:border-amber-800/40">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-neutral-900 dark:text-white mb-2">
                  Mobile Money 100% Sécurisé
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  Paiement instantané par Vodacom M-Pesa, Airtel Money, Orange Money et Africell Money. Transactions directes en CDF ou USD, sans frais cachés et avec reçu numérique immédiat.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-700/60 flex items-center gap-1.5 text-[11px] font-bold text-accent-700 dark:text-accent-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Zéro surcoût opérateur</span>
              </div>
            </div>

            {/* Pillar 2: Verified Drivers */}
            <div className="bg-white dark:bg-neutral-800 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-700 shadow-elevation-1 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-sm border border-emerald-200/40 dark:border-emerald-800/40">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-neutral-900 dark:text-white mb-2">
                  Chauffeurs & Véhicules Vérifiés
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  Chaque chauffeur partenaire passe une vérification rigoureuse : pièce d&apos;identité, permis valide et contrôle technique du véhicule. Casque passager obligatoire sur chaque moto.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-700/60 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Code PIN de sécurité à 4 chiffres</span>
              </div>
            </div>

            {/* Pillar 3: 24/7 WhatsApp Support */}
            <div className="bg-white dark:bg-neutral-800 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-700 shadow-elevation-1 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-accent-400 flex items-center justify-center mb-4 shadow-sm border border-primary-200/40 dark:border-primary-800/40">
                  <Headphones className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-neutral-900 dark:text-white mb-2">
                  Support WhatsApp 24/7
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  Une équipe d&apos;assistance locale basée à Kinshasa et Lubumbashi répond à vos messages en moins de 3 minutes sur WhatsApp, 24h/24 et 7j/7, pour vous aider à chaque étape.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-700/60 flex items-center gap-1.5 text-[11px] font-bold text-primary-700 dark:text-primary-300">
                <MessageCircle className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>Équipe locale en français, lingala & swahili</span>
              </div>
            </div>
          </div>
        </div>

        {/* ==========================================================================
            2. PARTNER LOGOS
            ========================================================================== */}
        <div className="mb-14 sm:mb-16">
          <div className="text-center mb-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Nos Compagnies et Coopératives Partenaires en RDC
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {partners.map((p, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center shadow-elevation-1 hover:border-accent-500 transition-all duration-150"
              >
                <span className="text-2xl mb-1.5 select-none">{p.icon}</span>
                <span className="text-xs font-black text-neutral-900 dark:text-white leading-tight">
                  {p.name}
                </span>
                <span className="text-[10px] text-neutral-400 dark:text-neutral-400 mt-0.5">
                  {p.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ==========================================================================
            3. SHORT FAQ ACCORDION
            ========================================================================== */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
              Foire Aux Questions
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Tout ce que vous devez savoir pour voyager l&apos;esprit tranquille
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((f, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200/80 dark:border-neutral-700 overflow-hidden shadow-elevation-1 transition-all"
                >
                  <button
                    type="button"
                    id={`faq-btn-${idx}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${idx}`}
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-neutral-900 dark:text-white hover:text-primary-700 dark:hover:text-accent-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 min-h-[48px]"
                  >
                    <span>{f.q}</span>
                    <ChevronDown
                      aria-hidden="true"
                      className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-accent-500' : 'text-neutral-400'
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div
                      id={`faq-panel-${idx}`}
                      role="region"
                      aria-labelledby={`faq-btn-${idx}`}
                      className="px-5 pb-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed border-t border-neutral-100 dark:border-neutral-700/60 pt-3"
                    >
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* WhatsApp Support CTA Card */}
          <div className="mt-8 p-4 sm:p-5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-elevation-1">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-md">
                <MessageCircle className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <span className="font-black text-sm text-emerald-950 dark:text-emerald-100 block">
                  Besoin d&apos;assistance immédiate ?
                </span>
                <span className="text-xs text-emerald-800 dark:text-emerald-300">
                  Nos conseillers vous répondent directement sur WhatsApp 24h/24 et 7j/7.
                </span>
              </div>
            </div>
            <a
              href="https://wa.me/243810000000?text=Bonjour%20Transnumerica%2C%20j%27ai%20une%20question%20concernant%20mon%20voyage"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-black rounded-xl shrink-0 shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              <span>Contacter sur WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
