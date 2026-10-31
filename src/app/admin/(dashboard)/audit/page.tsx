import React from 'react';
import { AdminAuditDashboard } from '@/components/admin/audit/AdminAuditDashboard';

export const metadata = {
  title: 'Journal d’Audit Immuable (WORM) | Administration Transnumerica',
  description: 'Registre d’audit cryptographique avec chaînage SHA-256 et détection d’anomalies',
};

export default function AdminAuditPage() {
  return <AdminAuditDashboard />;
}
