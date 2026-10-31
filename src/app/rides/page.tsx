import React from 'react';
import type { Metadata } from 'next';
import { RidesPageClient } from './RidesPageClient';
import { buildServiceSchema } from '@/lib/seo-schema';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Courses en Direct, Taxis & Mototaxis Wewa en RDC',
  description:
    'Commandez un taxi ou une moto Wewa à Kinshasa et Lubumbashi. Négociation de tarif en direct, chauffeur vérifié, code PIN de sécurité et paiement en espèces ou Mobile Money.',
  alternates: {
    canonical: 'https://transnumerica.cd/rides',
  },
  openGraph: {
    title: 'Courses en Direct, Taxis & Motos Wewa en RDC | Transnumerica',
    description:
      'Commandez un taxi ou une moto Wewa à Kinshasa et Lubumbashi. Tarif négocié en direct, chauffeur vérifié et paiement sécurisé.',
    url: 'https://transnumerica.cd/rides',
    siteName: 'Transnumerica',
    locale: 'fr_CD',
    type: 'website',
    images: [
      {
        url: 'https://transnumerica.cd/images/og-share-transnumerica.jpg',
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: 'Courses en Direct, Taxis & Mototaxis Wewa — Transnumerica RDC',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Courses en Direct, Taxis & Motos Wewa en RDC | Transnumerica',
    description:
      'Négociez votre course en direct à Kinshasa et Lubumbashi avec chauffeurs vérifiés.',
    images: ['https://transnumerica.cd/images/og-share-transnumerica.jpg'],
  },
};

export default function RidesPage() {
  const serviceSchema = buildServiceSchema({
    name: 'Service de Taxis et Mototaxis Wewa Transnumerica RDC',
    description:
      'Application de mise en relation directe avec chauffeurs de taxi et mototaxis en République Démocratique du Congo.',
    serviceType: 'RideSharingService',
    url: '/rides',
  });

  return (
    <>
      <JsonLd data={serviceSchema} />
      <RidesPageClient />
    </>
  );
}
