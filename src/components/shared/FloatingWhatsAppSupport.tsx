'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { MessageSquare } from 'lucide-react';

export function FloatingWhatsAppSupport() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  return (
    <aside
      aria-label="Support client Transnumerica"
      className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-30 print:hidden"
    >
      <a
        data-testid="floating-whatsapp-support"
        href="https://wa.me/243810000000?text=Bonjour%20Transnumerica%2C%20j%27ai%20besoin%20d%27aide%20pour%20un%20trajet"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contacter le support client Transnumerica sur WhatsApp"
        className="group flex items-center gap-2 p-3 sm:px-4 sm:py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-white/40 focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5" aria-hidden="true" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 absolute -top-1 -right-1 border border-emerald-700 animate-pulse" />
        </div>
        <span className="hidden sm:inline font-extrabold text-xs tracking-tight whitespace-nowrap">
          Assistance WhatsApp 7j/7
        </span>
      </a>
    </aside>
  );
}

