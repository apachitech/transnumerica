import React from 'react';
import type { Metadata } from 'next';
import { AdminPageClient } from '@/app/admin/AdminPageClient';

export const metadata: Metadata = {
  title: 'Portail Opérateur & Régulation — Supervision des Transports RDC',
  description:
    'Tableau de bord de gestion des flottes d’autocars, validation KYC des conducteurs, audit des lignes interurbaines et reporting des flux de mobilité en République Démocratique du Congo.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminOverviewPage() {
  return <AdminPageClient />;
}

