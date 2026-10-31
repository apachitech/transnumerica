import React from 'react';
import type { Metadata } from 'next';
import { DriverPageClient } from './DriverPageClient';

export const metadata: Metadata = {
  title: 'Cockpit Chauffeur Partenaire — Taxis & Motos Wewa RDC | Transnumerica',
  description:
    'Espace dédié aux conducteurs partenaires Transnumerica en RD Congo. Réception de courses en direct, commission solidaire de 10% et retraits Mobile Money instantanés.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://transnumerica.cd/driver',
  },
  openGraph: {
    title: 'Cockpit Chauffeur Partenaire | Transnumerica RDC',
    description:
      'Gérez vos courses en direct à Kinshasa et Lubumbashi avec une commission équitable de 10%.',
    url: 'https://transnumerica.cd/driver',
    siteName: 'Transnumerica',
    locale: 'fr_CD',
    type: 'website',
  },
};

export default function DriverPage() {
  return <DriverPageClient />;
}
