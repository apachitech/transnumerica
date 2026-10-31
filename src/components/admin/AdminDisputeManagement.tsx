'use client';

import React, { useState } from 'react';
import { AdminDisputeItem, Currency } from '@/types';
import { formatCurrency } from '@/lib/currency';
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Phone,
  MessageCircle,
  RotateCcw,
  ShieldAlert,
  Search,
  Filter,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';

interface AdminDisputeManagementProps {
  disputes: AdminDisputeItem[];
  currency: Currency;
  onResolveDispute: (id: string, resolutionNote: string) => void;
  onRefundDispute: (id: string) => void;
}

export function AdminDisputeManagement({
  disputes,
  currency,
  onResolveDispute,
  onRefundDispute,
}: AdminDisputeManagementProps) {
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'OPEN' | 'INVESTIGATING' | 'RESOLVED'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedDispute, setSelectedDispute] = useState<AdminDisputeItem | null>(null);
  const [resolutionText, setResolutionText] = useState('Litige traité et résolu après vérification des traces USSD/GPS.');

  const filteredDisputes = disputes.filter((d) => {
    if (filterStatus !== 'ALL' && d.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        d.ticketNumber.toLowerCase().includes(q) ||
        d.passengerName.toLowerCase().includes(q) ||
        d.driverOrOperatorName.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getPriorityBadge = (p: AdminDisputeItem['priority']) => {
    switch (p) {
      case 'URGENT':
        return (
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800">
            Urgent
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            Moyen
          </span>
        );
      case 'LOW':
        return (
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
            Faible
          </span>
        );
    }
  };

  const getCategoryLabel = (c: AdminDisputeItem['category']) => {
    switch (c) {
      case 'OVERCHARGE':
        return 'Surfacturation USSD';
      case 'LOST_ITEM':
        return 'Objet Oublié à Bord';
      case 'SAFETY_HELMET':
        return 'Sécurité / Défaut Casque';
      case 'DELAY_REFUND':
        return 'Remboursement Retard Autocar';
      case 'DRIVER_BEHAVIOR':
        return 'Comportement Conducteur';
    }
  };

  const handleConfirmResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute) return;
    onResolveDispute(selectedDispute.id, resolutionText);
    setSelectedDispute(null);
  };

  return (
    <div
      data-testid="admin-disputes-section"
      className="bg-white dark:bg-neutral-850 border border-neutral-200/90 dark:border-neutral-750 rounded-3xl p-4 sm:p-6 shadow-elevation-1 space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span>Gestion des Litiges &amp; Réclamations Client ({filteredDisputes.length})</span>
          </h3>
          <p className="text-2xs text-neutral-400 font-medium">
            Médiation, remboursements Mobile Money et traçabilité des incidents
          </p>
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-bold">
          {(['ALL', 'OPEN', 'INVESTIGATING', 'RESOLVED'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-center transition-all ${
                filterStatus === s
                  ? 'bg-white dark:bg-neutral-700 text-neutral-950 dark:text-white shadow-2xs font-extrabold'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              {s === 'ALL' ? 'Tous' : s === 'OPEN' ? 'Ouverts' : s === 'INVESTIGATING' ? 'En cours' : 'Résolus'}
            </button>
          ))}
        </div>
      </div>

      {/* Search box */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par n° de ticket, passager, chauffeur ou motif..."
          className="w-full min-h-[42px] pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
      </div>

      {/* Disputes Grid */}
      {filteredDisputes.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 text-neutral-400 text-xs">
          Aucun litige ne correspond aux critères sélectionnés.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDisputes.map((dispute) => {
            const isResolved = dispute.status === 'RESOLVED';
            const cleanPhone = dispute.passengerPhone.replace(/[^0-9]/g, '');
            const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
              `Bonjour ${dispute.passengerName}, nous traitons votre réclamation Transnumerica n° ${dispute.ticketNumber}.`
            )}`;

            return (
              <div
                key={dispute.id}
                data-testid={`dispute-card-${dispute.id}`}
                className={`bg-neutral-50 dark:bg-neutral-800/60 border rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5 transition-colors flex flex-col justify-between ${
                  isResolved
                    ? 'border-neutral-200 dark:border-neutral-700 opacity-80'
                    : 'border-red-200 dark:border-red-900/60 hover:border-red-300'
                }`}
              >
                <div className="space-y-2.5">
                  {/* Top card header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs text-neutral-900 dark:text-white">
                          {dispute.ticketNumber}
                        </span>
                        {getPriorityBadge(dispute.priority)}
                      </div>
                      <span className="text-2xs font-extrabold text-accent-700 dark:text-accent-400 uppercase tracking-wider block mt-0.5">
                        {getCategoryLabel(dispute.category)}
                      </span>
                    </div>

                    <span className="font-mono font-black text-sm text-neutral-900 dark:text-white">
                      {formatCurrency(dispute.amountInDisputeMinor, currency)}
                    </span>
                  </div>

                  {/* Title & description */}
                  <div>
                    <h4 className="font-extrabold text-sm text-neutral-900 dark:text-white leading-tight">
                      {dispute.title}
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1 leading-relaxed">
                      {dispute.description}
                    </p>
                  </div>

                  {/* Parties involved */}
                  <div className="p-3 bg-white dark:bg-neutral-850 rounded-xl text-xs space-y-1 border border-neutral-200 dark:border-neutral-750">
                    <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                      <span>Passager :</span>
                      <span className="font-bold text-neutral-900 dark:text-white">
                        {dispute.passengerName} ({dispute.passengerPhone})
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                      <span>Partenaire concerné :</span>
                      <span className="font-bold text-neutral-900 dark:text-white">
                        {dispute.driverOrOperatorName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400 text-2xs font-mono">
                      <span>Réf course :</span>
                      <span>{dispute.tripRef}</span>
                    </div>
                  </div>

                  {dispute.resolutionNote && (
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                      <strong>Résolution :</strong> {dispute.resolutionNote}
                    </div>
                  )}
                </div>

                {/* Actions bar */}
                <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* WhatsApp */}
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[38px] px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-2xs rounded-xl flex items-center gap-1 transition-all active:scale-95"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    {/* Direct call */}
                    <a
                      href={`tel:${cleanPhone}`}
                      className="min-h-[38px] px-3 py-1.5 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 text-neutral-800 dark:text-neutral-200 font-bold text-2xs rounded-xl flex items-center gap-1 transition-all active:scale-95"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Appeler</span>
                    </a>
                  </div>

                  {!isResolved ? (
                    <div className="flex items-center gap-1.5">
                      {/* Refund Button */}
                      <button
                        type="button"
                        onClick={() => onRefundDispute(dispute.id)}
                        data-testid={`refund-dispute-btn-${dispute.id}`}
                        className="min-h-[38px] px-3 py-1.5 bg-accent-500 hover:bg-accent-400 text-neutral-950 font-black text-2xs rounded-xl transition-all active:scale-95 shadow-2xs"
                      >
                        Rembourser M-Pesa
                      </button>

                      {/* Resolve Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedDispute(dispute)}
                        data-testid={`resolve-dispute-btn-${dispute.id}`}
                        className="min-h-[38px] px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-2xs rounded-xl transition-all active:scale-95"
                      >
                        Clôturer
                      </button>
                    </div>
                  ) : (
                    <span className="text-2xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Dossier résolu</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resolution Note Modal */}
      {selectedDispute && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
        >
          <form
            onSubmit={handleConfirmResolve}
            className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h4 className="font-black text-base text-neutral-900 dark:text-white">
                Clôturer le litige {selectedDispute.ticketNumber}
              </h4>
            </div>

            <div className="space-y-1">
              <label className="text-2xs font-extrabold uppercase text-neutral-400">
                Note de résolution administrative :
              </label>
              <textarea
                required
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                rows={3}
                className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setSelectedDispute(null)}
                className="px-4 py-2 text-neutral-600 dark:text-neutral-400 text-xs font-bold hover:underline"
              >
                Annuler
              </button>
              <button
                type="submit"
                data-testid="confirm-resolve-dispute-btn"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs active:scale-95 transition-all"
              >
                Confirmer la clôture
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

