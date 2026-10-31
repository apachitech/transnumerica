import type { Metadata } from 'next';
import { AdminSupportDashboard } from '@/components/admin/support/AdminSupportDashboard';

export const metadata: Metadata = {
  title: 'Gestion des Litiges & Support Client | Trans-Numérica Admin',
  description: 'Arbitrage des litiges, remboursements et suivi des tickets d’assistance.',
};

export default function AdminDisputesPage() {
  return <AdminSupportDashboard />;
}
