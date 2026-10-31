'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Ticket, User, ShieldAlert, Car } from 'lucide-react';
import { useApp } from '@/lib/store';
import { SOSModal } from './SOSModal';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { t, currentUser, switchRole } = useApp();
  const [sosOpen, setSosOpen] = useState(false);

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/driver')) {
    return null;
  }

  return (
    <>
      <nav
        aria-label="Navigation principale mobile"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#152238]/95 backdrop-blur-md border-t border-neutral-200 dark:border-[#233554] lg:hidden px-4 py-1.5 shadow-elevation-2"
      >
        <div className="flex items-center justify-around h-14 max-w-md mx-auto">
          {/* 1. Accueil */}
          <Link
            href="/"
            aria-label="Accueil Transnumerica"
            aria-current={pathname === '/' ? 'page' : undefined}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-150 min-h-[48px] ${
              pathname === '/'
                ? 'text-primary-900 dark:text-amber-400 font-black scale-105'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 font-semibold'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" aria-hidden="true" />
            <span className="text-[11px] tracking-tight">{t.home}</span>
          </Link>

          {/* 2. Trajets */}
          <Link
            href="/trips"
            aria-label="Trajets et réservations"
            aria-current={pathname.startsWith('/trips') || pathname.startsWith('/tickets') ? 'page' : undefined}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-150 min-h-[48px] ${
              pathname.startsWith('/trips') || pathname.startsWith('/tickets')
                ? 'text-primary-900 dark:text-amber-400 font-black scale-105'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 font-semibold'
            }`}
          >
            <Ticket className="w-5 h-5 mb-0.5" aria-hidden="true" />
            <span className="text-[11px] tracking-tight">Trajets</span>
          </Link>

          {/* 3. Compte */}
          <Link
            href="/account"
            aria-label="Mon compte et profil"
            aria-current={pathname.startsWith('/account') ? 'page' : undefined}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-150 min-h-[48px] ${
              pathname.startsWith('/account')
                ? 'text-primary-900 dark:text-amber-400 font-black scale-105'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 font-semibold'
            }`}
          >
            <User className="w-5 h-5 mb-0.5" aria-hidden="true" />
            <span className="text-[11px] tracking-tight">Compte</span>
          </Link>
        </div>
      </nav>

      {/* SOS Modal trigger */}
      <SOSModal isOpen={sosOpen} onClose={() => setSosOpen(false)} />
    </>
  );
}
