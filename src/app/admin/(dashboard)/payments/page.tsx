import React from 'react';
import { Metadata } from 'next';
import { AdminPaymentsDashboard } from '@/components/admin/payments/AdminPaymentsDashboard';

export const metadata: Metadata = {
  title: 'Gestion des Paiements & Rapprochements — Administration Transnumerica',
  description: 'Suivi des paiements Mobile Money (M-Pesa, Airtel, Orange, Africell), espèces, remboursements et rapprochement bancaire.',
};

export default function AdminPaymentsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <AdminPaymentsDashboard />
    </div>
  );
}
