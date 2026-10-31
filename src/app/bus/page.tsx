import React from 'react';
import type { Metadata } from 'next';
import { BusPageClient } from './BusPageClient';
import { buildServiceSchema } from '@/lib/seo-schema';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Billets de Bus Interurbains en RDC — Kinshasa, Matadi, Lubumbashi',
  description:
    'Comparez les horaires et tarifs des meilleures compagnies d’autocars en RD Congo. Choix du siège sur plan, billets électroniques hors-ligne et paiement Mobile Money sécurisé.',
  alternates: {
    canonical: 'https://transnumerica.cd/bus',
  },
  openGraph: {
    title: 'Billets de Bus Interurbains en RDC | Transnumerica',
    description:
      'Comparez les horaires et tarifs des meilleures compagnies d’autocars en RD Congo. Paiement Mobile Money sécurisé.',
    url: 'https://transnumerica.cd/bus',
    siteName: 'Transnumerica',
    locale: 'fr_CD',
    type: 'website',
    images: [
      {
        url: 'https://transnumerica.cd/images/og-share-transnumerica.jpg',
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: 'Billets de Bus Interurbains en RDC — Transnumerica',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Billets de Bus Interurbains en RDC | Transnumerica',
    description: 'Comparez les horaires et réservez votre siège en autocar en RD Congo.',
    images: ['https://transnumerica.cd/images/og-share-transnumerica.jpg'],
  },
};

export default function BusPage() {
  const serviceSchema = buildServiceSchema({
    name: 'Billetterie Bus Interurbains Transnumerica RDC',
    description:
      'Service officiel de réservation de billets d’autocars interurbains en RD Congo avec paiement Mobile Money.',
    serviceType: 'IntercityBusService',
    url: '/bus',
  });

  return (
    <>
      <JsonLd data={serviceSchema} />
      <BusPageClient />
    </>
  );
}
