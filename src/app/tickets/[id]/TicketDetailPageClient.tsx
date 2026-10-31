'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BusBooking } from '@/types';
import { busEngine } from '@/services/bus-engine';
import { TicketCard } from '@/components/ticket/TicketCard';
import { ArrowLeft, Loader2 } from 'lucide-react';

export function TicketDetailPageClient() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [booking, setBooking] = useState<BusBooking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check engine first, then localStorage
    const inEngine = busEngine.getBooking(id);
    if (inEngine) {
      setBooking(inEngine);
      setLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem('tn_saved_tickets');
      if (stored) {
        const list: BusBooking[] = JSON.parse(stored);
        const match = list.find((b) => b.id === id);
        if (match) {
          setBooking(match);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Storage read error', e);
    }

    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto p-6 text-center space-y-3">
        <p className="text-xs text-slate-500">Billet introuvable ou expiré.</p>
        <button
          onClick={() => router.push('/trips')}
          className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl"
        >
          Retour à mes voyages
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-3 sm:px-6 py-6 space-y-4">
      <button
        onClick={() => router.push('/trips')}
        className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Mes billets</span>
      </button>

      <TicketCard booking={booking} />
    </div>
  );
}
