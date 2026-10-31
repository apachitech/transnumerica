import React from 'react';
import type { Metadata } from 'next';
import { TrainPageClient } from './TrainPageClient';

export const metadata: Metadata = {
  title: 'Liaisons Ferroviaires en RD Congo — SNCC & ONATRA | Transnumerica',
  description:
    'Consultez les lignes de chemin de fer en RD Congo : Kinshasa - Matadi (ONATRA) et réseau du Grand Katanga (SNCC). Horaires des trains et correspondances intermodales.',
  alternates: {
    canonical: 'https://transnumerica.cd/train',
  },
  openGraph: {
    title: 'Liaisons Ferroviaires en RD Congo | Transnumerica',
    description:
      'Horaires des trains SNCC et ONATRA en République Démocratique du Congo.',
    url: 'https://transnumerica.cd/train',
    siteName: 'Transnumerica',
    locale: 'fr_CD',
    type: 'website',
  },
};

export default function TrainPage() {
  return <TrainPageClient />;
}
