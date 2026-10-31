import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  POPULAR_BUS_ROUTES,
  getRouteBySlug,
  PopularRouteData,
} from '@/lib/routes-data';
import {
  buildBusTripSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  SITE_URL,
} from '@/lib/seo-schema';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  Bus,
  Clock,
  MapPin,
  ShieldCheck,
  Star,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  HelpCircle,
  Luggage,
  Sparkles,
  Phone,
  CreditCard,
  Wifi,
  Smartphone,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return POPULAR_BUS_ROUTES.map((route) => ({
    slug: route.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const route = getRouteBySlug(slug);

  if (!route) {
    return {
      title: 'Itinéraire introuvable | Transnumerica',
      description: 'Ligne d\'autocar introuvable sur la plateforme Transnumerica RD Congo.',
    };
  }

  const canonicalUrl = `${SITE_URL}/bus/${route.slug}`;

  return {
    title: route.metaTitle,
    description: route.metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: route.metaTitle,
      description: route.metaDescription,
      url: canonicalUrl,
      siteName: 'Transnumerica',
      locale: 'fr_CD',
      type: 'website',
      images: [
        {
          url: `${SITE_URL}/images/og-share-transnumerica.jpg`,
          width: 1200,
          height: 630,
          type: 'image/jpeg',
          alt: `${route.title} — Transnumerica RDC`,
        },
        {
          url: `${SITE_URL}/images/og-share-transnumerica.png`,
          width: 1200,
          height: 630,
          type: 'image/png',
          alt: `${route.title} — Transnumerica RDC`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: route.metaTitle,
      description: route.metaDescription,
      images: [`${SITE_URL}/images/og-share-transnumerica.jpg`],
      site: '@transnumerica_cd',
      creator: '@transnumerica_cd',
    },
  };
}

export default async function RouteDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const route = getRouteBySlug(slug);

  if (!route) {
    notFound();
  }

  const busTripSchema = buildBusTripSchema(route);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Autocars RDC', url: '/bus' },
    { name: `${route.from} — ${route.to}`, url: `/bus/${route.slug}` },
  ]);
  const faqSchema = buildFaqSchema(route.faqs);

  const searchUrl = `/bus?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}&pax=1`;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pb-20 transition-colors">
      {/* Structured Data (JSON-LD) for Search Engines */}
      <JsonLd data={busTripSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />

      {/* Breadcrumb Navigation Bar */}
      <nav aria-label="Fil d'Ariane" className="bg-white dark:bg-neutral-850 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <ol className="flex items-center flex-wrap gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            <li>
              <Link href="/" className="hover:text-primary-600 dark:hover:text-amber-400 transition-colors">
                Accueil
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            </li>
            <li>
              <Link href="/bus" className="hover:text-primary-600 dark:hover:text-amber-400 transition-colors">
                Autocars RDC
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            </li>
            <li className="font-bold text-neutral-900 dark:text-white" aria-current="page">
              {route.from} → {route.to}
            </li>
          </ol>
        </div>
      </nav>

      {/* Hero Header Section */}
      <header className="relative bg-gradient-to-b from-primary-900 via-primary-950 to-primary-900 text-white py-10 sm:py-16 px-4 sm:px-6 overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-500/20 border border-accent-400/40 text-accent-300 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Corridor Officiel RDC • {route.roadName}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              {route.title}
            </h1>

            <p className="text-sm sm:text-base text-neutral-200 leading-relaxed">
              {route.headline}. Comparez les horaires de départ, les tarifs officiels en Francs Congolais (CDF) et réservez votre siège en toute sécurité.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href={searchUrl}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-accent-500 hover:bg-accent-600 text-neutral-950 font-black text-sm rounded-2xl shadow-elevation-2 active:scale-95 transition-all min-h-[48px]"
              >
                <Bus className="w-4 h-4" aria-hidden="true" />
                <span>Réserver un billet {route.from} - {route.to}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>

              <span className="text-xs text-neutral-300 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                Garantie départ ponctuel & billet QR hors-ligne
              </span>
            </div>
          </div>

          {/* Quick Price & Duration Stat Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 text-white space-y-4 lg:w-80 shadow-2xl shrink-0">
            <span className="text-2xs font-extrabold uppercase tracking-widest text-accent-400 block">
              Tarif le plus bas garanti
            </span>
            <div className="space-y-0.5">
              <div className="text-3xl sm:text-4xl font-black font-mono text-white">
                {route.priceFromCDF}
              </div>
              <div className="text-xs font-semibold text-neutral-300 font-mono">
                soit env. {route.priceFromUSD} USD par place
              </div>
            </div>

            <div className="pt-4 border-t border-white/15 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-300">Distance :</span>
                <span className="font-bold font-mono">{route.distanceKm} km</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-300">Durée estimée :</span>
                <span className="font-bold font-mono">{route.averageDuration}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-300">Transporteur leader :</span>
                <span className="font-bold text-amber-300">{route.featuredOperator}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 space-y-12">
        {/* Section 1: Daily Schedules Table */}
        <section aria-labelledby="schedules-title" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 id="schedules-title" className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                Horaires des Départs Quotidiens ({route.from} → {route.to})
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                Horaires réguliers assurés par les compagnies agréées Transnumerica
              </p>
            </div>
            <Link
              href={searchUrl}
              className="text-xs font-bold text-accent-600 dark:text-accent-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Vérifier les disponibilités en direct</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div
            role="region"
            aria-label={`Tableau des horaires ${route.title}`}
            tabIndex={0}
            className="overflow-x-auto bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-elevation-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          >
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 font-extrabold uppercase tracking-wider text-[11px]">
                  <th scope="col" className="py-3.5 px-4 sm:px-6">Départ</th>
                  <th scope="col" className="py-3.5 px-4">Arrivée</th>
                  <th scope="col" className="py-3.5 px-4">Compagnie</th>
                  <th scope="col" className="py-3.5 px-4">Confort</th>
                  <th scope="col" className="py-3.5 px-4 text-right">Tarif</th>
                  <th scope="col" className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {route.dailySchedules.map((sched, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-mono font-black text-neutral-900 dark:text-white text-sm">
                      {sched.departureTime}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-neutral-600 dark:text-neutral-300">
                      {sched.arrivalTime}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                      <Bus className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400 shrink-0" aria-hidden="true" />
                      <span>{sched.operator}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-bold bg-neutral-100 dark:bg-neutral-750 text-neutral-800 dark:text-neutral-200">
                        {sched.comfort}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-black text-neutral-900 dark:text-white block">
                        {sched.priceCDF}
                      </span>
                      <span className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400">
                        {sched.priceUSD}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href={searchUrl}
                        className="inline-flex items-center justify-center px-3 py-1.5 bg-primary-900 hover:bg-primary-950 dark:bg-accent-500 dark:hover:bg-accent-600 dark:text-neutral-950 text-white font-bold text-xs rounded-xl transition-all active:scale-95 min-h-[36px]"
                      >
                        Choisir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: Boarding & Arrival Terminals */}
        <section aria-labelledby="stations-title" className="space-y-4">
          <div>
            <h2 id="stations-title" className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
              Gares Routières & Points d’Embarquement
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              Terminus officiels sécurisés avec salles d’attente et guichets Mobile Money
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Departure Stations Card */}
            <div className="bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-elevation-1 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-950/80 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold">
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">
                    Départ de {route.from}
                  </h3>
                  <span className="text-2xs text-neutral-500 dark:text-neutral-400">
                    Présentez-vous 30 minutes avant le départ
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {route.departureStations.map((st, i) => (
                  <div key={i} className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl space-y-1">
                    <span className="font-bold text-xs text-neutral-900 dark:text-white block">
                      {st.name}
                    </span>
                    <p className="text-2xs text-neutral-500 dark:text-neutral-400">
                      {st.address} ({st.area})
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Arrival Stations Card */}
            <div className="bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-elevation-1 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <div className="w-8 h-8 rounded-xl bg-accent-100 dark:bg-accent-950/80 text-accent-800 dark:text-accent-300 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">
                    Arrivée à {route.to}
                  </h3>
                  <span className="text-2xs text-neutral-500 dark:text-neutral-400">
                    Connexions faciles en taxi ou Wewa à la descente
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {route.arrivalStations.map((st, i) => (
                  <div key={i} className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl space-y-1">
                    <span className="font-bold text-xs text-neutral-900 dark:text-white block">
                      {st.name}
                    </span>
                    <p className="text-2xs text-neutral-500 dark:text-neutral-400">
                      {st.address} ({st.area})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Amenities & Services Included */}
        <section aria-labelledby="amenities-title" className="bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-elevation-1 space-y-6">
          <div>
            <h2 id="amenities-title" className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
              Prestations Incluses à Bord des Autocars
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Tous les trajets réservés sur Transnumerica garantissent des standards de confort rigoureux
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {route.amenities.map((item, index) => (
              <div key={index} className="flex items-center gap-2.5 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 text-xs text-neutral-800 dark:text-neutral-200 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-600 dark:text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Luggage className="w-4 h-4 text-amber-500" aria-hidden="true" />
              Franchise bagage soute 25 kg + 1 sac cabine inclus sans surcoût
            </span>
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
              Paiement Mobile Money (M-Pesa, Airtel, Orange, Africell, Cash)
            </span>
          </div>
        </section>

        {/* Section 4: Verified Operators */}
        <section aria-labelledby="operators-title" className="space-y-4">
          <div>
            <h2 id="operators-title" className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
              Compagnies Partenaires Agréées sur la Ligne
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              Opérateurs certifiés par le Ministère des Transports et audités par Transnumerica
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {route.allOperators.map((op, i) => (
              <div key={i} className="bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 shadow-elevation-1 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-neutral-900 dark:text-white">
                    {op.name}
                  </span>
                  {op.verified && (
                    <span className="inline-flex items-center gap-1 text-2xs font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      <ShieldCheck className="w-3 h-3" aria-hidden="true" />
                      Agréé RDC
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                  <span className="flex items-center gap-1 text-amber-800 dark:text-amber-300 font-extrabold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" aria-hidden="true" />
                    {op.rating}
                  </span>
                  <span>•</span>
                  <span>{op.reviewCount} avis certifiés</span>
                </div>

                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 text-2xs text-neutral-600 dark:text-neutral-400 font-semibold flex items-center justify-between">
                  <span>Fréquence :</span>
                  <span className="text-neutral-900 dark:text-white font-bold">{op.frequency}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Frequently Asked Questions (FAQ) */}
        <section aria-labelledby="faq-title" className="space-y-4">
          <div>
            <h2 id="faq-title" className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
              Questions Fréquentes sur le Trajet {route.from} — {route.to}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              Tout ce qu’il faut savoir pour préparer votre départ en toute sérénité
            </p>
          </div>

          <div className="space-y-3">
            {route.faqs.map((faq, i) => (
              <details
                key={i}
                className="group bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-elevation-1 transition-all open:ring-1 open:ring-accent-500"
              >
                <summary className="flex items-center justify-between font-extrabold text-sm text-neutral-900 dark:text-white cursor-pointer list-none select-none">
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-accent-500 shrink-0" aria-hidden="true" />
                    {faq.question}
                  </span>
                  <span className="text-neutral-400 group-open:rotate-180 transition-transform text-lg leading-none ml-2">
                    ▾
                  </span>
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed pl-6 border-l-2 border-accent-300 dark:border-accent-700">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Section 6: Direct Booking Call To Action Banner */}
        <section className="bg-gradient-to-r from-primary-900 to-primary-950 text-white rounded-3xl p-6 sm:p-10 shadow-elevation-3 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-2xs font-black uppercase tracking-widest text-accent-400">
              Réservation 100% Mobile Money
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Prêt à embarquer de {route.from} à {route.to} ?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-xl">
              Choisissez votre siège sur le plan de l’autocar et recevez immédiatement votre billet avec QR code disponible hors-ligne.
            </p>
          </div>

          <Link
            href={searchUrl}
            className="px-8 py-4 bg-accent-500 hover:bg-accent-600 text-neutral-950 font-black text-sm rounded-2xl shadow-lg active:scale-95 transition-all text-center whitespace-nowrap min-h-[48px] flex items-center justify-center gap-2"
          >
            <span>Réserver à partir de {route.priceFromCDF}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </section>
      </main>
    </div>
  );
}

