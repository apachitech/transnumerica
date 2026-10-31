import React from 'react';
import { Metadata } from 'next';
import { AdminAnalyticsDashboard } from '@/components/admin/analytics/AdminAnalyticsDashboard';

export const metadata: Metadata = {
  title: 'Analytique & Performances Mobilité RDC — Administration Transnumerica',
  description:
    'Vue d’ensemble des indicateurs clés (réservations, chiffre d’affaires, utilisateurs actifs), entonnoir de conversion, taux d’occupation par corridor, balance offre/demande par heure et répartition Mobile Money.',
};

export default function AdminAnalyticsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <AdminAnalyticsDashboard />
    </div>
  );
}
