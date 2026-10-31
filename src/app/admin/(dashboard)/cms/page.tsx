import React from 'react';
import { Metadata } from 'next';
import { AdminCmsDashboard } from '@/components/admin/cms/AdminCmsDashboard';

export const metadata: Metadata = {
  title: 'Gestion de Contenu & CMS Multilingue — Administration Transnumerica',
  description:
    'Contrôle des sections de la page d’accueil, pages statiques multilingues (FR, EN, Lingala, Swahili), gestionnaire de traductions i18n, médiathèque WebP et modération des avis voyageurs.',
};

export default function AdminCmsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <AdminCmsDashboard />
    </div>
  );
}

