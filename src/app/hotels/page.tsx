import React from 'react';
import type { Metadata } from 'next';
import { HotelsPageClient } from './HotelsPageClient';

export const metadata: Metadata = {
  title: 'Hôtels & Hébergements Partenaires en RDC | Transnumerica',
  description:
    'Sélection d’hôtels vérifiés à proximité des gares routières et centres urbains à Kinshasa, Matadi et Lubumbashi. Confirmation instantanée et paiement Mobile Money.',
  alternates: {
    canonical: 'https://transnumerica.cd/hotels',
  },
  openGraph: {
    title: 'Hôtels & Hébergements Partenaires en RDC | Transnumerica',
    description:
      'Hôtels sélectionnés près des gares routières à Kinshasa, Matadi et Lubumbashi.',
    url: 'https://transnumerica.cd/hotels',
    siteName: 'Transnumerica',
    locale: 'fr_CD',
    type: 'website',
  },
};

export default function HotelsPage() {
  return <HotelsPageClient />;
}
