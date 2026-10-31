'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store';
import { PhoneCall, ShieldCheck, MapPin, Bus, Car, Package, Ticket, ChevronRight, MessageCircle, BookOpen, Download } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();
  const { t } = useApp();

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/driver')) {
    return null;
  }

  return (
    <footer className="bg-[#0A2540] dark:bg-[#071322] text-white border-t border-[#143A62] dark:border-[#1E2D48] pt-12 pb-24 lg:pb-12 px-4 sm:px-6 transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-10">
        {/* Brand Column */}
        <div className="space-y-4 sm:col-span-2 lg:col-span-1">
          <Link
            href="/"
            className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 rounded-lg py-1"
            aria-label="Accueil Transnumerica"
          >
            <img
              src="/images/logo-horizontal-transparent.png"
              alt="Transnumerica"
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </Link>
          <p className="text-xs text-white/80 leading-relaxed max-w-sm">
            {t.tagline}. Plateforme moderne de transport unifié et billetterie électronique en République Démocratique du Congo.
          </p>
          <div className="text-2xs sm:text-xs text-accent-300 font-semibold flex items-center gap-1.5 pt-1">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-accent-400" />
            <span>Kinshasa • Lubumbashi • Matadi • Kolwezi • Goma</span>
          </div>
        </div>

        {/* Services Links */}
        <div className="space-y-3 text-xs">
          <span className="font-black text-accent-400 uppercase tracking-wider block text-2xs sm:text-xs">
            Services de Mobilité
          </span>
          <ul className="space-y-2 text-white/80">
            <li>
              <Link href="/bus" className="hover:text-white flex items-center gap-1.5 transition-colors">
                <ChevronRight className="w-3 h-3 text-accent-400" />
                <span>{t.services.bus} (Lignes Interurbaines)</span>
              </Link>
            </li>
            <li>
              <Link href="/rides?service=taxi" className="hover:text-white flex items-center gap-1.5 transition-colors">
                <ChevronRight className="w-3 h-3 text-accent-400" />
                <span>{t.services.taxi} (Courses Urbaines)</span>
              </Link>
            </li>
            <li>
              <Link href="/rides?service=moto" className="hover:text-white flex items-center gap-1.5 transition-colors">
                <ChevronRight className="w-3 h-3 text-accent-400" />
                <span>{t.services.moto} (Wewa Tarif inDrive)</span>
              </Link>
            </li>
            <li>
              <Link href="/delivery" className="hover:text-white flex items-center gap-1.5 transition-colors">
                <ChevronRight className="w-3 h-3 text-accent-400" />
                <span>{t.services.delivery} (Colis Express Moto)</span>
              </Link>
            </li>
            <li>
              <Link href="/flights" className="hover:text-white flex items-center gap-1.5 transition-colors">
                <ChevronRight className="w-3 h-3 text-accent-400" />
                <span>{t.services.flights} (Congo Airways & CAA)</span>
              </Link>
            </li>
            <li>
              <Link href="/train" className="hover:text-white flex items-center gap-1.5 transition-colors">
                <ChevronRight className="w-3 h-3 text-accent-400" />
                <span>{t.services.train} (ONATRA & SNCC)</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Portails & Sécurité */}
        <div className="space-y-3 text-xs">
          <span className="font-black text-accent-400 uppercase tracking-wider block text-2xs sm:text-xs">
            Espaces & Sécurité
          </span>
          <ul className="space-y-2 text-white/80">
            <li>
              <Link href="/trips" className="hover:text-white flex items-center gap-1.5 transition-colors">
                <Ticket className="w-3.5 h-3.5 text-accent-400" />
                <span>{t.myTrips} (Billets QR Hors-Ligne)</span>
              </Link>
            </li>
            <li>
              <a
                href="/api/guide/download"
                download="TRANSNUMERICA_GUIDE_UTILISATEUR.pdf"
                className="hover:text-amber-300 flex items-center gap-1.5 transition-colors font-semibold text-amber-400"
                title="Télécharger le Guide Officiel d'Utilisation en PDF"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Guide Utilisateur PDF (Livre Illustré)</span>
                <Download className="w-3 h-3 text-amber-300 shrink-0" />
              </a>
            </li>
            <li>
              <Link href="/design" className="hover:text-white flex items-center gap-1.5 transition-colors">
                <ChevronRight className="w-3 h-3 text-accent-400" />
                <span>Design System & Accessibilité WCAG</span>
              </Link>
            </li>
            <li className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Chauffeurs & Flotte Contrôlés</span>
              </span>
            </li>
          </ul>
        </div>

        {/* Support & Mobile Money */}
        <div className="space-y-3 text-xs">
          <span className="font-black text-accent-400 uppercase tracking-wider block text-2xs sm:text-xs">
            Paiements Mobile Money RDC
          </span>
          <p className="text-2xs text-white/70 leading-relaxed">
            Règlement direct en Francs Congolais (CDF) ou Dollars (USD) sans frais cachés :
          </p>
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 bg-red-600/25 text-red-200 rounded-lg text-2xs font-bold border border-red-500/40">
              Vodacom M-Pesa
            </span>
            <span className="px-2.5 py-1 bg-red-700/25 text-red-200 rounded-lg text-2xs font-bold border border-red-600/40">
              Airtel Money
            </span>
            <span className="px-2.5 py-1 bg-orange-600/25 text-orange-200 rounded-lg text-2xs font-bold border border-orange-500/40">
              Orange Money
            </span>
            <span className="px-2.5 py-1 bg-purple-600/25 text-purple-200 rounded-lg text-2xs font-bold border border-purple-500/40">
              Africell Money
            </span>
          </div>

          <div className="pt-2">
            <span className="text-white/60 block text-2xs mb-1">Support voyageur 24/7 sur WhatsApp :</span>
            <a
              href="https://wa.me/243810000000?text=Bonjour%20Transnumerica%2C%20j%27ai%20une%20question%20sur%20mon%20voyage"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-2xs rounded-xl shadow-sm transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>+243 81 000 0000 (Assistance directe)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Location */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-2xs sm:text-xs text-white/60 text-center sm:text-left">
        <div>
          © {new Date().getFullYear()} Transnumerica RDC. Tous droits réservés.
        </div>
        <div className="flex items-center gap-4">
          <Link href="/terms" className="hover:text-white transition-colors">Conditions Générales</Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
          <span>•</span>
          <span>Kinshasa, République Démocratique du Congo</span>
        </div>
      </div>
    </footer>
  );
}
