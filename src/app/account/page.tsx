import React from 'react';
import type { Metadata } from 'next';
import { AccountPageClient } from './AccountPageClient';

export const metadata: Metadata = {
  title: 'Mon Espace Passager — Trajets, Billets & Reçus | Transnumerica',
  description:
    'Gérez vos réservations de bus, consultez vos reçus officiels, vos moyens de paiement Mobile Money et vos préférences de voyage.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://transnumerica.cd/account',
  },
  openGraph: {
    title: 'Mon Espace Passager — Transnumerica RDC',
    description:
      'Gérez vos réservations de bus, consultez vos reçus officiels et vos moyens de paiement Mobile Money.',
    url: 'https://transnumerica.cd/account',
    siteName: 'Transnumerica',
    locale: 'fr_CD',
    type: 'website',
  },
};

export default function AccountPage() {
  return <AccountPageClient />;
}
