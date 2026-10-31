'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  AdminPaymentOrder,
  PaymentsQueryResult,
  PaymentsStats,
  PaymentProvider,
  PaymentStatus,
  PaymentServiceType,
} from '@/types';
import {
  Search,
  Filter,
  RefreshCw,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Eye,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Wallet,
  Building,
  Check,
} from 'lucide-react';
import { PaymentDetailDrawer } from './PaymentDetailDrawer';
import { PaymentRefundModal } from './PaymentRefundModal';
import { PaymentCashConfirmModal } from './PaymentCashConfirmModal';
import { PaymentReconciliationModal } from './PaymentReconciliationModal';

export function AdminPaymentsDashboard() {
  const [payments, setPayments] = useState<AdminPaymentOrder[]>([]);
  const [stats, setStats] = useState<PaymentsStats | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [provider, setProvider] = useState<string>('ALL');
  const [status, setStatus] = useState<string>('ALL');
  const [serviceType, setServiceType] = useState<string>('ALL');
  const [reconciled, setReconciled] = useState<string>('all');

  // Modals & Drawer State
  const [selectedPayment, setSelectedPayment] = useState<AdminPaymentOrder | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [refundPaymentTarget, setRefundPaymentTarget] = useState<AdminPaymentOrder | null>(null);
  const [cashConfirmTarget, setCashConfirmTarget] = useState<AdminPaymentOrder | null>(null);
  const [isReconciliationOpen, setIsReconciliationOpen] = useState(false);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '10');

      if (search.trim()) params.set('search', search.trim());
      if (provider !== 'ALL') params.set('provider', provider);
      if (status !== 'ALL') params.set('status', status);
      if (serviceType !== 'ALL') params.set('serviceType', serviceType);
      if (reconciled !== 'all') params.set('reconciled', reconciled);

      const res = await fetch(`/api/admin/payments?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Impossible de charger les données de paiement');
      }

      const data: PaymentsQueryResult = await res.json();
      setPayments(data.items);
      setStats(data.stats);
      setTotalCount(data.total);
      setTotalPages(data.totalPages);

      // If active drawer payment exists, update its reference
      if (selectedPayment) {
        const fresh = data.items.find((p) => p.id === selectedPayment.id);
        if (fresh) setSelectedPayment(fresh);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [page, search, provider, status, serviceType, reconciled, selectedPayment]);

  useEffect(() => {
    fetchPayments();
  }, [page, provider, status, serviceType, reconciled]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPayments();
  };

  const handleOpenDrawer = (p: AdminPaymentOrder) => {
    setSelectedPayment(p);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleSyncStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/payments/${id}/sync`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la synchronisation');
      }
      setFeedback({ message: data.message, type: 'success' });
      await fetchPayments();
    } catch (err: unknown) {
      setFeedback({
        message: err instanceof Error ? err.message : 'Erreur lors de la synchronisation',
        type: 'error',
      });
    }
  };

  const handleMarkReconciled = async (p: AdminPaymentOrder) => {
    try {
      const res = await fetch(`/api/admin/payments/${p.id}/reconcile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: p.version }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du rapprochement');
      }
      setFeedback({ message: data.message, type: 'success' });
      await fetchPayments();
    } catch (err: unknown) {
      setFeedback({
        message: err instanceof Error ? err.message : 'Erreur lors du rapprochement',
        type: 'error',
      });
    }
  };

  const handleRetryPayment = async (p: AdminPaymentOrder) => {
    try {
      const res = await fetch(`/api/admin/payments/${p.id}/retry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'Relance manuelle depuis le tableau de bord administrateur',
          idempotencyKey: `RETRY-DASH-${p.id}-${Date.now()}`,
          version: p.version,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du réessai');
      }
      setFeedback({ message: data.message, type: 'success' });
      await fetchPayments();
    } catch (err: unknown) {
      setFeedback({
        message: err instanceof Error ? err.message : 'Erreur lors du réessai',
        type: 'error',
      });
    }
  };

  const getProviderBadge = (p: PaymentProvider) => {
    switch (p) {
      case 'MPESA':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 font-bold px-2 py-0.5 rounded text-[11px]">
            M-Pesa
          </span>
        );
      case 'AIRTEL_MONEY':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 font-bold px-2 py-0.5 rounded text-[11px]">
            Airtel Money
          </span>
        );
      case 'ORANGE_MONEY':
        return (
          <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300 font-bold px-2 py-0.5 rounded text-[11px]">
            Orange Money
          </span>
        );
      case 'AFRICELL_MONEY':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 font-bold px-2 py-0.5 rounded text-[11px]">
            Africell
          </span>
        );
      case 'CASH':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold px-2 py-0.5 rounded text-[11px]">
            Espèces
          </span>
        );
      default:
        return <span className="text-xs">{p}</span>;
    }
  };

  const getStatusBadge = (s: PaymentStatus) => {
    switch (s) {
      case 'SETTLED':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-semibold px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> Encaissé
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[11px] font-semibold px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" /> En attente
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 text-[11px] font-semibold px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3" /> Échec
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[11px] font-semibold px-2 py-0.5 rounded-full">
            <RotateCcw className="w-3 h-3" /> Remboursé
          </span>
        );
      case 'PARTIALLY_REFUNDED':
        return (
          <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 text-[11px] font-semibold px-2 py-0.5 rounded-full">
            <RotateCcw className="w-3 h-3" /> Partiel
          </span>
        );
      default:
        return <span>{s}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Gestion des Paiements & Rapprochements</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Encaissements Mobile Money (M-Pesa, Airtel, Orange, Africell), espèces, remboursements et rapprochement bancaire.
          </p>
        </div>

        {/* Global Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="/api/admin/payments/export"
            download
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Exporter CSV</span>
          </a>

          <button
            onClick={() => setIsReconciliationOpen(true)}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Rapprochement Relevé</span>
          </button>

          <button
            onClick={() => fetchPayments()}
            className="p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl shadow-sm transition-all"
            title="Actualiser les paiements"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs opacity-60 hover:opacity-100">
            Fermer
          </button>
        </div>
      )}

      {/* Financial KPIs Banner */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
              <span>Total Encaissé (CDF)</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {(stats.cdfTotalMinor / 100).toLocaleString('fr-FR')} CDF
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {stats.settledCount} transactions réglées
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
              <span>Total Encaissé (USD)</span>
              <DollarSign className="w-4 h-4 text-sky-500" />
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {(stats.usdTotalMinor / 100).toLocaleString('fr-FR')} USD
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Devise billets & VIP</div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
              <span>Remboursements</span>
              <RotateCcw className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400">
              {(stats.totalRefundedMinor / 100).toLocaleString('fr-FR')} FC
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {stats.refundedCount} opérations remboursées
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
              <span>Rapprochement bancaire</span>
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-lg sm:text-xl font-black text-indigo-600 dark:text-indigo-400">
              {stats.reconciledCount} rapprochés
            </div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">
              {stats.unreconciledCount} en attente de pointage
            </div>
          </div>
        </div>
      )}

      {/* Multi-criteria Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par référence, client, téléphone (+243...), réf opérateur..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            Filtrer
          </button>
        </form>

        {/* Filter Pills / Selects */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Opérateur</label>
            <select
              value={provider}
              onChange={(e) => {
                setProvider(e.target.value);
                setPage(1);
              }}
              className="w-full py-1.5 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
            >
              <option value="ALL">Tous les opérateurs</option>
              <option value="MPESA">Vodacom M-Pesa</option>
              <option value="AIRTEL_MONEY">Airtel Money</option>
              <option value="ORANGE_MONEY">Orange Money</option>
              <option value="AFRICELL_MONEY">Africell Money</option>
              <option value="CASH">Espèces (Cash)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Statut</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full py-1.5 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="SETTLED">Encaissé (Settled)</option>
              <option value="PENDING">En attente (Pending)</option>
              <option value="FAILED">Échec (Failed)</option>
              <option value="REFUNDED">Remboursé (Refunded)</option>
              <option value="PARTIALLY_REFUNDED">Partiellement remboursé</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Prestation</label>
            <select
              value={serviceType}
              onChange={(e) => {
                setServiceType(e.target.value);
                setPage(1);
              }}
              className="w-full py-1.5 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
            >
              <option value="ALL">Tous les services</option>
              <option value="BUS">Bus Interurbain</option>
              <option value="TAXI">Taxi Express</option>
              <option value="MOTO">Moto (Wewa)</option>
              <option value="DELIVERY">Livraison Colis</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Pointage Relevé</label>
            <select
              value={reconciled}
              onChange={(e) => {
                setReconciled(e.target.value);
                setPage(1);
              }}
              className="w-full py-1.5 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
            >
              <option value="all">Tous (pointés et non)</option>
              <option value="true">Rapprochés uniquement</option>
              <option value="false">Non rapprochés</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading && payments.length === 0 && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl text-center space-y-2">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto" />
          <h3 className="text-sm font-bold text-red-900 dark:text-red-200">Erreur de chargement</h3>
          <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={() => fetchPayments()}
            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && payments.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
          <Wallet className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Aucun paiement trouvé</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Aucun enregistrement ne correspond aux filtres sélectionnés. Essayez de réinitialiser la recherche.
          </p>
        </div>
      )}

      {/* Desktop Table View (>= 768px) */}
      {!loading && !error && payments.length > 0 && (
        <div className="hidden md:block bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Référence</th>
                  <th className="py-3 px-4">Opérateur & Réf</th>
                  <th className="py-3 px-4">Client & Tél</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4 text-right">Montant</th>
                  <th className="py-3 px-4 text-center">Statut</th>
                  <th className="py-3 px-4 text-center">Rapproché</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payments.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      <div>{p.reference}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {new Date(p.createdAt).toLocaleDateString('fr-FR')} {new Date(p.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {getProviderBadge(p.provider)}
                      </div>
                      <div className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        {p.providerReference}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{p.customerName}</div>
                      <div className="font-mono text-[11px] text-slate-500">{p.customerPhone}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {p.serviceType}
                      </span>
                      {p.operatorName && (
                        <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                          {p.operatorName}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {(p.amountMinor / 100).toLocaleString('fr-FR')} {p.currency}
                      </div>
                      {p.refundedAmountMinor > 0 && (
                        <div className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                          Remboursé: {(p.refundedAmountMinor / 100).toLocaleString('fr-FR')}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(p.status)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {p.reconciled ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                          <ShieldCheck className="w-4 h-4" /> Oui
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Non</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDrawer(p)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Détail</span>
                        </button>

                        {(p.status === 'SETTLED' || p.status === 'PARTIALLY_REFUNDED') &&
                          p.amountMinor > p.refundedAmountMinor && (
                            <button
                              onClick={() => setRefundPaymentTarget(p)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                              title="Rembourser"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mobile Card List View (< 768px, optimized for 360px viewport) */}
      {!loading && !error && payments.length > 0 && (
        <div id="payment-mobile-list" className="md:hidden space-y-3">
          {payments.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2.5"
            >
              {/* Card top: Ref, Provider, Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                    {p.reference}
                  </span>
                  {p.reconciled && (
                    <span title="Rapproché">
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
                    </span>
                  )}
                </div>
                <div>{getStatusBadge(p.status)}</div>
              </div>

              {/* Amount and Provider */}
              <div className="flex items-center justify-between">
                <div className="text-base font-black text-slate-900 dark:text-white">
                  {(p.amountMinor / 100).toLocaleString('fr-FR')} {p.currency}
                  {p.refundedAmountMinor > 0 && (
                    <span className="block text-[10px] text-rose-600 dark:text-rose-400 font-semibold">
                      -{(p.refundedAmountMinor / 100).toLocaleString('fr-FR')} remboursé
                    </span>
                  )}
                </div>
                <div>{getProviderBadge(p.provider)}</div>
              </div>

              {/* Customer & Prestation */}
              <div className="text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-700/60 flex justify-between">
                <div>
                  <span className="font-medium">{p.customerName}</span>
                  <span className="block font-mono text-[11px] text-slate-400">{p.customerPhone}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">{p.serviceType}</span>
                  <span className="block text-[10px] text-slate-400">
                    {new Date(p.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>

              {/* Mobile Actions Button */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-700/60">
                <span className="font-mono text-[10px] text-slate-400 truncate max-w-[140px]">
                  {p.providerReference}
                </span>
                <div className="flex items-center gap-1.5">
                  {(p.status === 'SETTLED' || p.status === 'PARTIALLY_REFUNDED') &&
                    p.amountMinor > p.refundedAmountMinor && (
                      <button
                        onClick={() => setRefundPaymentTarget(p)}
                        className="px-2 py-1 text-xs text-rose-600 border border-rose-200 dark:border-rose-900 rounded-lg font-medium"
                      >
                        Rembourser
                      </button>
                    )}
                  <button
                    onClick={() => handleOpenDrawer(p)}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Détail</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2">
          <span>
            Affichage de {payments.length} sur {totalCount} paiements
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold">
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Drawer */}
      <PaymentDetailDrawer
        payment={selectedPayment}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onSyncStatus={handleSyncStatus}
        onOpenRefund={(p) => {
          setRefundPaymentTarget(p);
        }}
        onOpenCashConfirm={(p) => {
          setCashConfirmTarget(p);
        }}
        onMarkReconciled={handleMarkReconciled}
        onRetryPayment={handleRetryPayment}
      />

      {/* Refund Modal */}
      <PaymentRefundModal
        payment={refundPaymentTarget}
        isOpen={!!refundPaymentTarget}
        onClose={() => setRefundPaymentTarget(null)}
        onSuccess={() => {
          setFeedback({ message: 'Remboursement validé avec succès !', type: 'success' });
          fetchPayments();
        }}
      />

      {/* Cash Confirm Modal */}
      <PaymentCashConfirmModal
        payment={cashConfirmTarget}
        isOpen={!!cashConfirmTarget}
        onClose={() => setCashConfirmTarget(null)}
        onSuccess={() => {
          setFeedback({ message: 'Encaissement des espèces validé avec succès !', type: 'success' });
          fetchPayments();
        }}
      />

      {/* Statement Reconciliation Modal */}
      <PaymentReconciliationModal
        isOpen={isReconciliationOpen}
        onClose={() => setIsReconciliationOpen(false)}
        onSuccess={() => {
          setFeedback({ message: 'Rapprochement du relevé terminé avec succès !', type: 'success' });
          fetchPayments();
        }}
      />
    </div>
  );
}
