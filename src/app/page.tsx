import React from 'react';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { HomeSearchCard } from '@/components/search/HomeSearchCard';

export const metadata: Metadata = {
  title: {
    absolute: 'Transnumerica — Billets de bus, trajets & livraisons en RDC',
  },
  description:
    'Réservez vos billets de bus interurbains et commandez des taxis ou mototaxis (Wewa) en RD Congo. Paiement Mobile Money instantané (M-Pesa, Airtel, Orange, Africell, Cash).',
  alternates: {
    canonical: 'https://transnumerica.cd',
  },
  openGraph: {
    title: 'Transnumerica — Mobilité & Billetterie en RD Congo',
    description:
      'Bus interurbains, taxis et mototaxis (Wewa). Paiement Mobile Money sécurisé et billets QR 100% hors-ligne.',
    url: 'https://transnumerica.cd',
    siteName: 'Transnumerica',
    locale: 'fr_CD',
    type: 'website',
    images: [
      {
        url: 'https://transnumerica.cd/images/og-share-transnumerica.jpg',
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: 'Transnumerica RD Congo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Transnumerica — Mobilité & Billetterie en RD Congo',
    description:
      'Bus interurbains, taxis et mototaxis Wewa. Paiement Mobile Money sécurisé.',
    images: ['https://transnumerica.cd/images/og-share-transnumerica.jpg'],
  },
};

// Defer below-the-fold content for instant LCP on 3G and low-end mobile devices
const PopularRoutesSection = dynamic(
  () => import('@/components/home/PopularRoutesSection').then((m) => m.PopularRoutesSection),
  {
    loading: () => <div className="min-h-[320px] bg-neutral-100/40 dark:bg-neutral-800/40 rounded-3xl mx-4 my-8 animate-pulse" />,
  }
);

const HowItWorksSection = dynamic(
  () => import('@/components/home/HowItWorksSection').then((m) => m.HowItWorksSection),
  {
    loading: () => <div className="min-h-[260px] bg-neutral-100/40 dark:bg-neutral-800/40 rounded-3xl mx-4 my-8 animate-pulse" />,
  }
);

const TrustAndFAQSection = dynamic(
  () => import('@/components/home/TrustAndFAQSection').then((m) => m.TrustAndFAQSection),
  {
    loading: () => <div className="min-h-[340px] bg-neutral-100/40 dark:bg-neutral-800/40 rounded-3xl mx-4 my-8 animate-pulse" />,
  }
);

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors">
      {/* ==========================================================================
          HERO & SEARCH SECTION: AIRY, MODERN MOBILITY APP LAYOUT
          (No noisy maps, no heavy banners, generous whitespace, clear CTA above the fold)
          ========================================================================== */}
      <section className="relative pt-6 sm:pt-10 pb-10 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center mb-6 sm:mb-8 space-y-2.5">
          {/* Subtle regional pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-100/80 dark:bg-accent-950/60 border border-accent-300/60 dark:border-accent-700/60 text-accent-900 dark:text-accent-300 text-xs font-black tracking-wide">
            <span>🇨🇩 Plateforme Officielle de Mobilité en RDC</span>
          </div>

          {/* Clean, high-impact headline */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tight leading-tight">
            Voyagez simplement, payez par <span className="text-primary-700 dark:text-primary-400">Mobile</span> <span className="text-amber-800 dark:text-accent-400">Money</span>
          </h1>

          {/* Concise subheadline */}
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto font-normal leading-relaxed">
            Bus interurbains, taxis et mototaxis (Wewa) à Kinshasa, Matadi, Lubumbashi et Kolwezi. Billets QR 100% hors-ligne et tarifs négociés.
          </p>
        </div>

        {/* Central Dominant Search Card with Integrated Service Switcher */}
        <div className="relative z-10">
          <HomeSearchCard />
        </div>
      </section>

      {/* ==========================================================================
          POPULAR ROUTES (PHOTO CARDS WITH CITY & "À PARTIR DE X FC")
          ========================================================================== */}
      <PopularRoutesSection />

      {/* ==========================================================================
          3-STEP "COMMENT ÇA MARCHE"
          ========================================================================== */}
      <HowItWorksSection />

      {/* ==========================================================================
          TRUST PILLARS (MOMO, VERIFIED DRIVERS, 24/7 WHATSAPP), PARTNERS & FAQ
          ========================================================================== */}
      <TrustAndFAQSection />
    </div>
  );
}
