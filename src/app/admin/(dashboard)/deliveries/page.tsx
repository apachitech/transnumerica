import type { Metadata } from 'next';
import { AdminDeliveriesDashboard } from '@/components/admin/deliveries/AdminDeliveriesDashboard';

export const metadata: Metadata = {
  title: 'Gestion des Livraisons & Colis | Trans-Numérica Admin',
  description: 'Supervision en direct des courses colis, réassignation des coursiers, litiges, retours et tarification.',
};

export default function AdminDeliveriesPage() {
  return <AdminDeliveriesDashboard />;
}

