import React from 'react';
import { Metadata } from 'next';
import { AdminNotificationsDashboard } from '@/components/admin/notifications/AdminNotificationsDashboard';

export const metadata: Metadata = {
  title: 'Notifications & Diffusions — Administration Transnumerica RDC',
  description:
    'Gestion des modèles de notifications multicanaux (SMS, WhatsApp, Push), campagnes de diffusion ciblées avec garde-fous stricts et journal d’acheminement.',
};

export default function AdminNotificationsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <AdminNotificationsDashboard />
    </div>
  );
}

