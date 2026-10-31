'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  admin: 'Administration',
  corridors: 'Lignes & Corridors',
  bookings: 'Réservations & Courses',
  drivers: 'Vérification Chauffeurs',
  operators: 'Opérateurs de Transport',
  disputes: 'Gestion des Litiges',
  payments: 'Paiements & Remboursements',
  payouts: 'Versements & Commissions',
  toggles: 'Villes & Services',
  pricing: 'Tarification & Règles',
  users: 'Utilisateurs & Rôles',
  audit: 'Journal d’Audit',
  settings: 'Paramètres & Sessions',
  analytics: 'Analytique Mobilité',
};

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length <= 1) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-neutral-400">
        <Home className="w-3.5 h-3.5 text-amber-400" />
        <span className="font-bold text-white">Vue d’ensemble</span>
      </div>
    );
  }

  return (
    <nav aria-label="Fil d’Ariane" className="flex items-center gap-1.5 text-xs text-neutral-400">
      <Link
        href="/admin"
        className="hover:text-amber-300 transition-colors flex items-center gap-1"
      >
        <Home className="w-3.5 h-3.5 text-neutral-400" />
        <span className="hidden sm:inline">Accueil Admin</span>
      </Link>

      {segments.slice(1).map((seg, idx) => {
        const isLast = idx === segments.length - 2;
        const href = `/${segments.slice(0, idx + 2).join('/')}`;
        const label = ROUTE_LABELS[seg] || seg;

        return (
          <React.Fragment key={href}>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
            {isLast ? (
              <span className="font-bold text-white">{label}</span>
            ) : (
              <Link href={href} className="hover:text-amber-300 transition-colors">
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

