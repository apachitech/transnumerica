import React from 'react';
import type { Metadata } from 'next';
import { FlightsPageClient } from './FlightsPageClient';

export const metadata: Metadata = {
  title: 'Vols Domestiques en RDC — Kinshasa, Lubumbashi, Goma | Transnumerica',
  description:
    'Consultez les liaisons aériennes intérieures en République Démocratique du Congo (Congo Airways, CAA). Tarifs en Francs Congolais et paiements Mobile Money simplifiés.',
  alternates: {
    canonical: 'https://transnumerica.cd/flights',
  },
  openGraph: {
    title: 'Vols Domestiques en RDC | Transnumerica',
    description:
      'Liaisons aériennes régulières entre Kinshasa, Lubumbashi et Goma avec paiement Mobile Money.',
    url: 'https://transnumerica.cd/flights',
    siteName: 'Transnumerica',
    locale: 'fr_CD',
    type: 'website',
  },
};

export default function FlightsPage() {
  return <FlightsPageClient />;
}
