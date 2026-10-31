import React from 'react';
import { Metadata } from 'next';
import { KycRequirementsClient } from './KycRequirementsClient';

export const metadata: Metadata = {
  title: 'Gestionnaire d’Exigences KYC & Conformité — Administration Transnumerica RDC',
  description:
    'Définissez, publiez et supervisez sans redéploiement la matrice des exigences et documents KYC par type de transporteur (MOTO, CAR, SHUTTLE) et par ville en RD Congo.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminKycRequirementsPage() {
  return (
    <div className="p-3 sm:p-5 lg:p-7 max-w-7xl mx-auto">
      <KycRequirementsClient />
    </div>
  );
}

