import React from 'react';
import type { Metadata } from 'next';
import { DeliveryPageClient } from './DeliveryPageClient';

export const metadata: Metadata = {
  title: 'Livraison Express de Colis & Plis en RDC | Transnumerica',
  description:
    'Expédiez vos plis et colis à Kinshasa, Lubumbashi, Matadi et Kolwezi. Suivi en temps réel, coursiers à moto vérifiés et remise sécurisée par code PIN.',
  alternates: {
    canonical: 'https://transnumerica.cd/delivery',
  },
  openGraph: {
    title: 'Livraison Express de Colis en RDC | Transnumerica',
    description:
      'Expédition rapide et sécurisée de colis urbains et interurbains avec code PIN de remise.',
    url: 'https://transnumerica.cd/delivery',
    siteName: 'Transnumerica',
    locale: 'fr_CD',
    type: 'website',
    images: [
      {
        url: 'https://transnumerica.cd/images/og-share-transnumerica.jpg',
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: 'Livraison Express — Transnumerica RDC',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Livraison Express de Colis en RDC | Transnumerica',
    description: 'Coursiers à moto et livraison interurbaine sécurisée par code PIN en RD Congo.',
    images: ['https://transnumerica.cd/images/og-share-transnumerica.jpg'],
  },
};

export default function DeliveryPage() {
  return <DeliveryPageClient />;
}
