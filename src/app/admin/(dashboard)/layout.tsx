import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getServerAdminSession } from '@/lib/server/auth-helpers';
import { canAccessAdmin } from '@/lib/security/roles-permissions';
import { AdminDashboardLayoutClient } from '@/components/admin/AdminDashboardLayoutClient';

export const metadata: Metadata = {
  title: 'Console d’Administration & Régulation | Transnumerica',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAdminSession();

  // If unauthenticated or non-admin, render standard 404
  if (!session || !canAccessAdmin(session.role)) {
    notFound();
  }

  return (
    <AdminDashboardLayoutClient session={session}>
      {children}
    </AdminDashboardLayoutClient>
  );
}

