import React from 'react';
import { Metadata } from 'next';
import { AdminPayoutsDashboard } from '@/components/admin/payouts/AdminPayoutsDashboard';

export const metadata: Metadata = {
  title: 'Commissions & Reversements Partenaires — Administration Transnumerica',
  description: 'Gestion des barèmes de commission, lots de reversement périodiques, approbations financières duales et décaissements Mobile Money / Banques RDC.',
};

export default function AdminPayoutsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <AdminPayoutsDashboard />
    </div>
  );
}
