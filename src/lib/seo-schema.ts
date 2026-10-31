import { PopularRouteData } from './routes-data';

export const SITE_URL = 'https://transnumerica.cd';
export const SITE_NAME = 'Transnumerica';

/**
 * Schema.org Organization Schema
 */
export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: 'Transnumerica RD Congo',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/images/logo-horizontal-transparent.png`,
      width: '512',
      height: '144',
      caption: 'Transnumerica — Mobilité et Billetterie en RD Congo',
    },
    image: `${SITE_URL}/images/og-share-transnumerica.png`,
    description:
      'Plateforme officielle de mobilité en République Démocratique du Congo : Réservation de billets d\'autocars interurbains, taxis et mototaxis (Wewa), billets QR hors-ligne et paiements Mobile Money.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Boulevard du 30 Juin, Commune de la Gombe',
      addressLocality: 'Kinshasa',
      addressRegion: 'Kinshasa',
      postalCode: 'B.P. 100',
      addressCountry: 'CD',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+243-81-000-0000',
        contactType: 'customer support',
        areaServed: 'CD',
        availableLanguage: ['French', 'Lingala', 'Swahili', 'English'],
      },
    ],
    sameAs: [
      'https://twitter.com/transnumerica_cd',
      'https://facebook.com/transnumerica.cd',
      'https://wa.me/243810000000',
    ],
  };
}

/**
 * Schema.org WebSite with SearchAction
 */
export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: 'Voyagez simplement en RDC, payez par Mobile Money.',
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/bus?from={search_term_string}&to=Matadi`,
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: ['fr-CD', 'ln-CD', 'sw-CD', 'en'],
  };
}

/**
 * Schema.org BusTrip & Offer Schema for clean route pages
 */
export function buildBusTripSchema(route: PopularRouteData) {
  const depStation = route.departureStations[0];
  const arrStation = route.arrivalStations[0];

  return {
    '@context': 'https://schema.org',
    '@type': 'BusTrip',
    name: route.title,
    description: route.headline,
    url: `${SITE_URL}/bus/${route.slug}`,
    departureBusStop: {
      '@type': 'BusStop',
      name: depStation.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: depStation.address,
        addressLocality: depStation.city,
        addressCountry: 'CD',
      },
    },
    arrivalBusStop: {
      '@type': 'BusStop',
      name: arrStation.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: arrStation.address,
        addressLocality: arrStation.city,
        addressCountry: 'CD',
      },
    },
    provider: {
      '@type': 'Organization',
      name: route.featuredOperator,
    },
    offers: [
      {
        '@type': 'Offer',
        name: `Billet Bus ${route.from} - ${route.to} (Standard / VIP)`,
        price: (route.priceMinorCDF / 100).toString(),
        priceCurrency: 'CDF',
        availability: 'https://schema.org/InStock',
        validFrom: '2026-01-01',
        url: `${SITE_URL}/bus/${route.slug}`,
      },
      {
        '@type': 'Offer',
        name: `Billet Bus ${route.from} - ${route.to} (USD)`,
        price: (route.priceMinorUSD / 100).toFixed(2),
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        validFrom: '2026-01-01',
        url: `${SITE_URL}/bus/${route.slug}`,
      },
    ],
  };
}

/**
 * Schema.org FAQPage Schema
 */
export function buildFaqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Schema.org BreadcrumbList Schema
 */
export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * Schema.org Service Schema (for Bus & Rides)
 */
export function buildServiceSchema(service: {
  name: string;
  description: string;
  serviceType: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    serviceType: service.serviceType,
    description: service.description,
    url: `${SITE_URL}${service.url}`,
    provider: {
      '@id': `${SITE_URL}/#organization`,
    },
    areaServed: [
      { '@type': 'City', name: 'Kinshasa' },
      { '@type': 'City', name: 'Matadi' },
      { '@type': 'City', name: 'Lubumbashi' },
      { '@type': 'City', name: 'Kolwezi' },
      { '@type': 'City', name: 'Goma' },
      { '@type': 'City', name: 'Bukavu' },
      { '@type': 'City', name: 'Kikwit' },
    ],
    termsOfService: `${SITE_URL}/trips`,
  };
}

