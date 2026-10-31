import React from 'react';
import type { Metadata } from 'next';
import { TripsPageClient } from './TripsPageClient';

export const metadata: Metadata = {
  title: 'Mes Trajets & Réservations | Transnumerica RD Congo',
  description:
    'Consultez vos billets de bus interurbains et historiques de courses en RD Congo. Accédez à vos cartes d’embarquement avec QR code scannable hors-ligne.',
  alternates: {
    canonical: 'https://transnumerica.cd/trips',
  },
  openGraph: {
    title: 'Mes Trajets & Réservations | Transnumerica RD Congo',
    description:
      'Accédez à vos billets de bus avec QR code scannable même hors-ligne.',
    url: 'https://transnumerica.cd/trips',
    siteName: 'Transnumerica',
    locale: 'fr_CD',
    type: 'website',
    images: [
      {
        url: 'https://transnumerica.cd/images/og-share-transnumerica.jpg',
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: 'Mes Trajets — Transnumerica RD Congo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mes Trajets & Réservations | Transnumerica',
    description: 'Vos cartes d’embarquement et billets de bus hors-ligne en RD Congo.',
    images: ['https://transnumerica.cd/images/og-share-transnumerica.jpg'],
  },
};

export default function TripsPage() {
  return <TripsPageClient />;
}
