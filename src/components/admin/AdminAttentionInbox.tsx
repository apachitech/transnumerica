'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  AlertTriangle,
  ShieldAlert,
  Clock,
  ExternalLink,
  X,
  CreditCard,
  RefreshCw,
  Flame,
} from 'lucide-react';
import { AttentionItem } from '@/app/api/admin/attention/route';

interface AdminAttentionInboxProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminAttentionInbox({ isOpen, onClose }: AdminAttentionInboxProps) {
  const [items, setItems] = useState<AttentionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const fetchAttentionItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/attention');
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch {
      // Keep existing items if network error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAttentionItems();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
      <div
        role="presentation"
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0A1A2E] border-l border-white/15 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-start justify-between gap-3 bg-[#081524]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-white">À Traiter en Priorité</h2>
                <p className="text-2xs text-neutral-400">
                  Inbox opérationnelle d’urgences ({items.length} dossier{items.length > 1 ? 's' : ''})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={fetchAttentionItems}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white"
                title="Actualiser les alertes"
                aria-label="Actualiser les alertes"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                type="button"
                data-testid="admin-attention-close-btn"
                onClick={onClose}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white"
                aria-label="Fermer la boîte d’urgences"
              >
                <X className="w-5 h-4" />
              </button>
            </div>
          </div>

          {/* Body items list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  ✓
                </div>
                <h4 className="text-sm font-bold text-white">Tout est en ordre</h4>
                <p className="text-xs text-neutral-400">
                  Aucune alerte urgente ou dossier bloquant en attente.
                </p>
              </div>
            ) : (
              items.map((item) => {
                const isCritical = item.severity === 'CRITICAL';
                const isHigh = item.severity === 'HIGH';

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border space-y-2 transition-all ${
                      isCritical
                        ? 'bg-red-950/40 border-red-500/60 shadow-lg shadow-red-950/30'
                        : isHigh
                        ? 'bg-amber-950/40 border-amber-500/50'
                        : 'bg-[#081524] border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between text-2xs">
                      <span
                        className={`px-2 py-0.5 rounded-full font-black uppercase tracking-wider text-2xs flex items-center gap-1 ${
                          isCritical
                            ? 'bg-red-500 text-white animate-pulse'
                            : isHigh
                            ? 'bg-amber-500 text-neutral-950'
                            : 'bg-white/15 text-neutral-300'
                        }`}
                      >
                        {isCritical && <Flame className="w-3 h-3" />}
                        <span>{item.severity}</span>
                      </span>

                      <span className="text-neutral-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-neutral-500" />
                        <span>{item.timestamp}</span>
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-white">{item.title}</h4>
                    <p className="text-2xs text-neutral-300 leading-relaxed">{item.description}</p>

                    <button
                      type="button"
                      onClick={() => {
                        router.push(item.href);
                        onClose();
                      }}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                        isCritical
                          ? 'bg-red-600 hover:bg-red-500 text-white'
                          : isHigh
                          ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                          : 'bg-white/10 hover:bg-white/15 text-white'
                      }`}
                    >
                      <span>{item.actionLabel}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
