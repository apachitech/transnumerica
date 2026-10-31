import React from 'react';
import { Metadata } from 'next';
import { AdminSettingsDashboard } from '@/components/admin/settings/AdminSettingsDashboard';

export const metadata: Metadata = {
  title: 'Paramètres Généraux & Intégrations — Administration Transnumerica RDC',
  description:
    'Contrôle de l’identité de marque, règles métier de transport RDC, gestion sécurisée des passerelles et intégrations avec masquage cryptographique, mode maintenance et snapshots de rollback.',
};

export default function AdminSettingsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <AdminSettingsDashboard />
    </div>
  );
}
