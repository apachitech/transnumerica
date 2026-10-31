import type { Metadata } from 'next';
import { AdminSupportDashboard } from '@/components/admin/support/AdminSupportDashboard';

export const metadata: Metadata = {
  title: 'Centre de Support & Litiges | Trans-Numérica Admin',
  description: 'Assistance usagers, chauffeurs et partenaires, gestion des réclamations, SLA et arbitrages de remboursement.',
};

export default function AdminSupportPage() {
  return <AdminSupportDashboard />;
}

