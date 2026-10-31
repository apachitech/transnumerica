import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  MapPinOff,
  Home,
  Bus,
  Car,
  Search,
  ArrowRight,
  MessageCircle,
  HelpCircle,
} from 'lucide-react';
import { POPULAR_BUS_ROUTES } from '@/lib/routes-data';

export const metadata: Metadata = {
  title: 'Arrêt introuvable (404) | Transnumerica RD Congo',
  description:
    'La page ou l\'itinéraire demandé n\'existe pas ou a été déplacé. Retrouvez vos billets de bus, taxis et mototaxis Wewa sur Transnumerica.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-neutral-50 dark:bg-neutral-900 transition-colors">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Visual 404 Icon & Status Badge */}
        <div className="space-y-4">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-3xl bg-accent-500/20 dark:bg-accent-500/10 animate-ping [animation-duration:3s]" />
            <div className="relative w-20 h-20 rounded-3xl bg-white dark:bg-neutral-800 border-2 border-accent-400 dark:border-accent-500 flex items-center justify-center text-accent-700 dark:text-accent-400 shadow-elevation-2">
              <MapPinOff className="w-10 h-10" aria-hidden="true" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-100 dark:bg-accent-950/70 border border-accent-300 dark:border-accent-800 text-accent-900 dark:text-accent-300 text-xs font-black uppercase tracking-wider">
            <span>Erreur 404 • Arrêt non desservi</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 dark:text-white tracking-tight">
            Cet arrêt ou cet itinéraire n’existe pas
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto leading-relaxed">
            La page que vous recherchez a peut-être changé de nom, le terminus a été déplacé, ou l’adresse saisie comporte une erreur.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3.5 bg-primary-900 hover:bg-primary-950 dark:bg-accent-500 dark:hover:bg-accent-600 dark:text-neutral-950 text-white font-black text-xs sm:text-sm rounded-2xl shadow-elevation-2 flex items-center justify-center gap-2 active:scale-95 transition-all min-h-[48px]"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>Retour à l’accueil</span>
          </Link>

          <Link
            href="/bus"
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 font-bold text-xs sm:text-sm rounded-2xl shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all min-h-[48px]"
          >
            <Bus className="w-4 h-4 text-primary-600 dark:text-amber-400" aria-hidden="true" />
            <span>Rechercher un bus interurbain</span>
          </Link>

          <Link
            href="/rides"
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 font-bold text-xs sm:text-sm rounded-2xl shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all min-h-[48px]"
          >
            <Car className="w-4 h-4 text-amber-500" aria-hidden="true" />
            <span>Commander un Wewa ou Taxi</span>
          </Link>
        </div>

        {/* Suggested Popular Routes in DR Congo */}
        <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
            Ou explorez l’un de nos corridors populaires :
          </span>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {POPULAR_BUS_ROUTES.map((r) => (
              <Link
                key={r.slug}
                href={`/bus/${r.slug}`}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-750 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:border-accent-500 dark:hover:border-accent-400 flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <span>{r.from} → {r.to}</span>
                <span className="text-2xs text-amber-800 dark:text-amber-300 font-mono">({r.priceFromCDF})</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Help Center Contact Note */}
        <div className="pt-4 text-xs text-neutral-500 dark:text-neutral-400 flex items-center justify-center gap-2">
          <HelpCircle className="w-4 h-4 text-neutral-400" aria-hidden="true" />
          <span>Besoin d’aide pour retrouver un billet ?</span>
          <a
            href="https://wa.me/243810000000?text=Bonjour%20Transnumerica,%20j%27ai%20besoin%20d%27aide%20pour%20retrouver%20mon%20trajet"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 dark:text-emerald-400 font-bold underline inline-flex items-center gap-1"
          >
            <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Assistance WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}

