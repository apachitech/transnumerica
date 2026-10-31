import React from 'react';
import { Metadata } from 'next';
import { AdminPricingDashboard } from '@/components/admin/pricing/AdminPricingDashboard';

export const metadata: Metadata = {
  title: 'Régulation & Pilotage Tarifaire — Administration Transnumerica',
  description: 'Contrôle des formules tarifaires urbaines, plafonds des corridors FEC, promotions, surtensions et taux USD/CDF.',
};

export default function AdminPricingPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <AdminPricingDashboard />
    </div>
  );
}
