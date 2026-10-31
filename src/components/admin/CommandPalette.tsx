'use client';

import React, { useState, useEffect, useRef, useId } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Command,
  ArrowRight,
  Ticket,
  Users,
  ShieldCheck,
  Building2,
  AlertCircle,
  Coins,
  History,
  Settings,
  Route,
  Plus,
  Trash2,
  Loader2,
  X,
} from 'lucide-react';
import { AdminSearchResult } from '@/app/api/admin/search/route';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AdminSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const searchInputId = useId();

  // Navigation shortcuts
  const navigationItems = [
    { label: 'Vue d’ensemble', href: '/admin', group: 'Navigation', icon: Command },
    { label: 'Catalogue & Réseau (Gares, Lignes, Sièges)', href: '/admin/catalog', group: 'Transport', icon: Route },
    { label: 'Lignes & Corridors Interurbains', href: '/admin/corridors', group: 'Transport', icon: Route },
    { label: 'Réservations & Courses', href: '/admin/bookings', group: 'Opérations', icon: Ticket },
    { label: 'Vérification Chauffeurs KYC', href: '/admin/drivers', group: 'Personnes', icon: ShieldCheck },
    { label: 'Opérateurs de Transport', href: '/admin/operators', group: 'Transport', icon: Building2 },
    { label: 'Gestion des Litiges', href: '/admin/disputes', group: 'Opérations', icon: AlertCircle },
    { label: 'Paiements & Remboursements', href: '/admin/payments', group: 'Finances', icon: Coins },
    { label: 'Commissions & Versements', href: '/admin/payouts', group: 'Finances', icon: Coins },
    { label: 'Utilisateurs & Rôles', href: '/admin/users', group: 'Personnes', icon: Users },
    { label: 'Journal d’Audit Immuable', href: '/admin/audit', group: 'Analyses', icon: History },
    { label: 'Paramètres & Sessions', href: '/admin/settings', group: 'Paramètres', icon: Settings },
  ];

  // Quick action shortcuts
  const actionShortcuts = [
    {
      label: 'Créer un nouveau corridor interurbain',
      action: () => router.push('/admin/corridors?action=create'),
      icon: Plus,
    },
    {
      label: 'Consulter la corbeille des lignes archivées',
      action: () => router.push('/admin/corridors?trash=true'),
      icon: Trash2,
    },
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Handle global search debounce
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Global keydown listener for Escape
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

  const filteredNav = query
    ? navigationItems.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()))
    : navigationItems;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div
        role="presentation"
        className="fixed inset-0"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Palette de commande globale"
        className="relative w-full max-w-xl bg-[#0A1A2E] border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
      >
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-white/10 flex items-center gap-3 bg-[#081524]">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <label htmlFor={searchInputId} className="sr-only">
            Rechercher un dossier, utilisateur, course ou action rapide
          </label>
          <input
            id={searchInputId}
            ref={inputRef}
            type="text"
            placeholder="Rechercher par ID, nom, tél, itinéraire (ex. Kinshasa, BKG-9921)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-neutral-500 outline-none"
          />
          {isLoading && <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />}
          <kbd className="hidden sm:inline px-2 py-0.5 rounded bg-white/10 text-2xs font-mono text-neutral-400 border border-white/10">
            ESC
          </kbd>
        </div>

        {/* Results & Suggestions List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4 text-xs">
          {/* Live Search Results */}
          {results.length > 0 && (
            <div className="space-y-1">
              <div className="text-2xs font-black uppercase tracking-wider text-amber-400 px-3 py-1">
                Résultats trouvés ({results.length})
              </div>
              {results.map((r) => (
                <button
                  key={`${r.type}-${r.id}`}
                  type="button"
                  onClick={() => {
                    router.push(r.href);
                    onClose();
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-white/10 text-left flex items-center justify-between gap-2 transition-colors group"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="font-bold text-white group-hover:text-amber-300 truncate">
                      {r.title}
                    </div>
                    <div className="text-2xs text-neutral-400 truncate">{r.subtitle}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {r.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-2xs font-bold ${r.badgeColor || 'bg-white/10 text-white'}`}>
                        {r.badge}
                      </span>
                    )}
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-amber-400" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          {!query && (
            <div className="space-y-1">
              <div className="text-2xs font-black uppercase tracking-wider text-neutral-400 px-3 py-1">
                Actions rapides
              </div>
              {actionShortcuts.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      action.action();
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-white/10 text-left flex items-center gap-2.5 text-neutral-200 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold">{action.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Navigation Shortcuts */}
          <div className="space-y-1">
            <div className="text-2xs font-black uppercase tracking-wider text-neutral-400 px-3 py-1">
              Modules d’administration
            </div>
            {filteredNav.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => {
                    router.push(item.href);
                    onClose();
                  }}
                  className="w-full p-2 rounded-xl hover:bg-white/10 text-left flex items-center justify-between text-neutral-300 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{item.label}</span>
                  </span>
                  <span className="text-2xs text-neutral-500 font-mono">{item.group}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer shortcuts info */}
        <div className="p-2.5 border-t border-white/10 bg-[#081524] flex items-center justify-between text-2xs text-neutral-400">
          <span>Recherche multi-entités : Chauffeurs, Billets, Passagers, Lignes</span>
          <div className="flex items-center gap-1">
            <span>Raccourci : </span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono">Ctrl+K</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}

