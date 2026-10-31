'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  PayoutBatch,
  PayoutsStats,
  CommissionConfigRule,
  PayeeAccount,
  PayoutBatchStatus,
} from '@/types';
import {
  Search,
  Filter,
  RefreshCw,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building,
  Smartphone,
  Eye,
  SlidersHorizontal,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Percent,
  Wallet,
  Receipt,
  Ban,
  Users,
} from 'lucide-react';
import { PayoutBatchDetailDrawer } from './PayoutBatchDetailDrawer';
import { PayoutApprovalModal } from './PayoutApprovalModal';
import { PayoutExecutionModal } from './PayoutExecutionModal';
import { PayoutHoldModal } from './PayoutHoldModal';
import { GenerateBatchModal } from './GenerateBatchModal';
import { CommissionsRulesModal } from './CommissionsRulesModal';
import { PayeeAdjustmentModal } from './PayeeAdjustmentModal';
import { PayeeStatementModal } from './PayeeStatementModal';

type TabType = 'batches' | 'commissions' | 'payees';

export function AdminPayoutsDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('batches');

  // Batches state
  const [batches, setBatches] = useState<PayoutBatch[]>([]);
  const [stats, setStats] = useState<PayoutsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filters for batches
  const [batchSearch, setBatchSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Commissions state
  const [rules, setRules] = useState<CommissionConfigRule[]>([]);
  const [selectedRuleForEdit, setSelectedRuleForEdit] = useState<CommissionConfigRule | null>(null);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);

  // Payees state
  const [payees, setPayees] = useState<PayeeAccount[]>([]);
  const [selectedPayeeForAdjustment, setSelectedPayeeForAdjustment] = useState<PayeeAccount | null>(null);
  const [selectedPayeeForStatement, setSelectedPayeeForStatement] = useState<PayeeAccount | null>(null);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);

  // Modals and Drawer state for batches
  const [selectedBatch, setSelectedBatch] = useState<PayoutBatch | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isExecutionModalOpen, setIsExecutionModalOpen] = useState(false);
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [batchesRes, statsRes, rulesRes, payeesRes] = await Promise.all([
        fetch('/api/admin/payouts/batches'),
        fetch('/api/admin/payouts/stats'),
        fetch('/api/admin/payouts/commissions'),
        fetch('/api/admin/payouts/payees'),
      ]);

      if (!batchesRes.ok || !statsRes.ok || !rulesRes.ok || !payeesRes.ok) {
        throw new Error('Erreur lors du chargement des données de règlements et commissions');
      }

      const [batchesData, statsData, rulesData, payeesData] = await Promise.all([
        batchesRes.json(),
        statsRes.json(),
        rulesRes.json(),
        payeesRes.json(),
      ]);

      setBatches(batchesData);
      setStats(statsData);
      setRules(rulesData);
      setPayees(payeesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur inattendue est survenue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle auto-clearing feedback
  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 5000);
  };

  // Handlers for Drawer & Actions
  const handleOpenDrawer = (batch: PayoutBatch) => {
    setSelectedBatch(batch);
    setIsDrawerOpen(true);
  };

  const handleApproveBatch = (batch: PayoutBatch) => {
    setSelectedBatch(batch);
    setIsApprovalModalOpen(true);
  };

  const handleExecuteBatch = (batch: PayoutBatch) => {
    setSelectedBatch(batch);
    setIsExecutionModalOpen(true);
  };

  const handleToggleHoldBatch = (batch: PayoutBatch) => {
    setSelectedBatch(batch);
    setIsHoldModalOpen(true);
  };

  const handleExportCsv = (batchId: string) => {
    window.open(`/api/admin/payouts/batches/${batchId}/export`, '_blank');
  };

  // Filter batches
  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(batchSearch.toLowerCase()) ||
      b.id.toLowerCase().includes(batchSearch.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: PayoutBatchStatus) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Payé
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <ShieldCheck className="w-3 h-3" /> Approuvé
          </span>
        );
      case 'NEEDS_SECOND_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" /> 2nd Visa Requis
          </span>
        );
      case 'PENDING_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Clock className="w-3 h-3" /> En Attente
          </span>
        );
      case 'ON_HOLD':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-3 h-3" /> Bloqué
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-700 text-zinc-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Commissions & Règlements des Partenaires
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Gestion des barèmes de commission, cycles de reversement et approbations financières duales
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            aria-label="Actualiser les données"
            className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {activeTab === 'batches' && (
            <button
              onClick={() => setIsGenerateModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition shadow-lg shadow-blue-600/25"
            >
              <Plus className="w-4 h-4" /> Générer un Lot
            </button>
          )}
          {activeTab === 'commissions' && (
            <button
              onClick={() => {
                setSelectedRuleForEdit(null);
                setIsRuleModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-2 transition shadow-lg shadow-amber-600/25"
            >
              <Plus className="w-4 h-4" /> Nouvelle Règle
            </button>
          )}
        </div>
      </div>

      {/* Global Feedback notification */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-medium">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs hover:underline ml-4 text-zinc-400 hover:text-white"
          >
            Fermer
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Décaissé */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Total Décaissé (Payé)</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-white mt-2">
            {stats ? stats.totalPaidOutCdf.toLocaleString('fr-FR') : '—'}{' '}
            <span className="text-xs font-normal text-zinc-500">CDF</span>
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">
            ≈ {stats ? Math.round(stats.totalPaidOutCdf / 2850).toLocaleString('fr-FR') : '—'} USD
          </p>
        </div>

        {/* En Attente d'Approbation */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">En Attente d'Approbation</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-white mt-2">
            {stats ? stats.pendingApprovalCdf.toLocaleString('fr-FR') : '—'}{' '}
            <span className="text-xs font-normal text-zinc-500">CDF</span>
          </p>
          <p className="text-[11px] text-purple-400 mt-1">
            {stats?.batchesPendingCount || 0} lot(s) en attente
          </p>
        </div>

        {/* Seuil Dual en Attente */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Visa Superviseur (Dual)</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-amber-300 mt-2">
            {stats?.dualApprovalPendingCount || 0}{' '}
            <span className="text-xs font-normal text-zinc-400">lot(s) bloqué(s)</span>
          </p>
          <p className="text-[11px] text-amber-400/80 mt-1">
            Montant &gt; 5 000 000 CDF en attente
          </p>
        </div>

        {/* Commissions Retenues */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Commissions Retenues</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-blue-300 mt-2">
            {stats ? stats.totalCommissionRetainedCdf.toLocaleString('fr-FR') : '—'}{' '}
            <span className="text-xs font-normal text-zinc-500">CDF</span>
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">
            Revenu net plateforme Transnumerica
          </p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-1 border-b border-zinc-800 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('batches')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'batches'
              ? 'bg-zinc-800 text-white border-b-2 border-blue-500'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          <Layers className="w-4 h-4 text-blue-400" /> Lots de Règlements ({batches.length})
        </button>

        <button
          onClick={() => setActiveTab('commissions')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'commissions'
              ? 'bg-zinc-800 text-white border-b-2 border-amber-500'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          <Percent className="w-4 h-4 text-amber-400" /> Barème & Règles ({rules.length})
        </button>

        <button
          onClick={() => setActiveTab('payees')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'payees'
              ? 'bg-zinc-800 text-white border-b-2 border-purple-500'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          <Wallet className="w-4 h-4 text-purple-400" /> Soldes des Partenaires ({payees.length})
        </button>
      </div>

      {/* TAB 1: BATCHES */}
      {activeTab === 'batches' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-zinc-900/60 rounded-2xl border border-zinc-800">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Rechercher par titre ou identifiant de lot..."
                value={batchSearch}
                onChange={(e) => setBatchSearch(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-zinc-500 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="PENDING_APPROVAL">En attente d'approbation</option>
                <option value="NEEDS_SECOND_APPROVAL">En attente du 2nd visa</option>
                <option value="APPROVED">Approuvé (Prêt)</option>
                <option value="PAID">Réglé / Décaissé</option>
                <option value="ON_HOLD">Bloqué / Suspendu</option>
              </select>
            </div>
          </div>

          {/* Batches Table / Cards */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-zinc-800/40 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredBatches.length === 0 ? (
            <div className="p-12 text-center bg-zinc-900/30 rounded-2xl border border-zinc-800">
              <Layers className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-zinc-300">Aucun lot de règlement trouvé</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Ajustez vos filtres de recherche ou générez un nouveau lot périodique.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBatches.map((batch) => (
                <div
                  key={batch.id}
                  className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                          {batch.id}
                        </span>
                        {getStatusBadge(batch.status)}
                        {batch.requiresDualApproval && (
                          <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
                            Double Visa
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-white mt-1.5">{batch.title}</h3>
                      <p className="text-xs text-zinc-400">
                        Période: {new Date(batch.periodStart).toLocaleDateString('fr-FR')} -{' '}
                        {new Date(batch.periodEnd).toLocaleDateString('fr-FR')} • {batch.payeeCount} bénéficiaires
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-base sm:text-lg font-black text-emerald-400">
                        {batch.totalNetPayoutCdf.toLocaleString('fr-FR')} CDF
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        Brut: {batch.totalGrossRevenueCdf.toLocaleString('fr-FR')} • Com:{' '}
                        {batch.totalCommissionCdf.toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  {/* Batch Actions Row */}
                  <div className="pt-2 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenDrawer(batch)}
                      className="text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 transition"
                    >
                      <Eye className="w-3.5 h-3.5 text-zinc-400" /> Détails & Lignes
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleExportCsv(batch.id)}
                        title="Exporter le CSV pour virement bancaire / mobile money"
                        className="text-xs text-zinc-300 hover:text-white flex items-center gap-1 py-1 px-2.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 transition"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> CSV
                      </button>

                      {batch.status !== 'PAID' && (
                        <button
                          onClick={() => handleToggleHoldBatch(batch)}
                          className={`text-xs flex items-center gap-1 py-1 px-2.5 rounded-lg transition ${
                            batch.status === 'ON_HOLD'
                              ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                              : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                          }`}
                        >
                          {batch.status === 'ON_HOLD' ? 'Débloquer' : 'Bloquer'}
                        </button>
                      )}

                      {(batch.status === 'PENDING_APPROVAL' || batch.status === 'NEEDS_SECOND_APPROVAL') && (
                        <button
                          onClick={() => handleApproveBatch(batch)}
                          className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1 py-1 px-3 rounded-lg transition shadow-md shadow-blue-600/20"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {batch.status === 'NEEDS_SECOND_APPROVAL' ? '2nd Visa' : 'Approuver'}
                        </button>
                      )}

                      {batch.status === 'APPROVED' && (
                        <button
                          onClick={() => handleExecuteBatch(batch)}
                          className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1 py-1 px-3 rounded-lg transition shadow-md shadow-emerald-600/20"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" /> Décaisser
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COMMISSIONS RULES */}
      {activeTab === 'commissions' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Barèmes et Règles de Commissionnement</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Taux et frais appliqués automatiquement lors du calcul des reversements
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedRuleForEdit(null);
                  setIsRuleModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Ajouter une règle
              </button>
            </div>

            <div className="divide-y divide-zinc-800/80 rounded-xl border border-zinc-800 overflow-hidden bg-zinc-950/40">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-800/30 transition text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{rule.description || rule.title}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          rule.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {rule.isActive ? 'Active' : 'Désactivée'}
                      </span>
                    </div>
                    <p className="text-zinc-400 flex items-center gap-2">
                      <span>Service: <strong className="text-zinc-300">{rule.service || rule.serviceType}</strong></span>
                      <span>•</span>
                      <span>Ville: <strong className="text-zinc-300">{rule.city || rule.cityId}</strong></span>
                      <span>•</span>
                      <span>Véhicule: <strong className="text-zinc-300">{rule.vehicleType}</strong></span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-left sm:text-right">
                      <p className="text-base font-black text-amber-400">
                        {rule.percentage}%
                        {rule.fixedFeeCdf > 0 && ` + ${rule.fixedFeeCdf} CDF`}
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        Type: {rule.rateType} (v{rule.version})
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedRuleForEdit(rule);
                        setIsRuleModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition"
                    >
                      Modifier
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PAYEES & BALANCES */}
      {activeTab === 'payees' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-white">Comptes et Soldes des Partenaires</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Soldes disponibles, ajustements manuels (primes, pénalités) et relevés de reversement
              </p>
            </div>

            <div className="space-y-3">
              {payees.map((payee) => (
                <div
                  key={payee.id}
                  className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/80 hover:border-zinc-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">{payee.payeeName}</h4>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          payee.payeeType === 'OPERATOR'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {payee.payeeType === 'OPERATOR' ? 'Opérateur' : 'Chauffeur'}
                      </span>
                    </div>
                    <p className="text-zinc-400 flex items-center gap-2">
                      {payee.preferredPayoutMethod.includes('MONEY') || payee.preferredPayoutMethod === 'MPESA' ? (
                        <Smartphone className="w-3.5 h-3.5 text-zinc-500" />
                      ) : (
                        <Building className="w-3.5 h-3.5 text-zinc-500" />
                      )}
                      <span>{payee.phone}</span>
                      <span>•</span>
                      <span>{payee.preferredPayoutMethod}</span>
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="text-left sm:text-right">
                      <p className="text-base font-black text-emerald-400">
                        {payee.currentBalanceCdf.toLocaleString('fr-FR')} CDF
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        Cumul décaissé: {payee.totalPaidOutCdf.toLocaleString('fr-FR')} CDF
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedPayeeForStatement(payee);
                          setIsStatementModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1 transition"
                      >
                        <Receipt className="w-3.5 h-3.5 text-blue-400" /> Relevé
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPayeeForAdjustment(payee);
                          setIsAdjustmentModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" /> Ajustement
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODALS & DRAWERS */}
      <PayoutBatchDetailDrawer
        batch={selectedBatch}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onApprove={handleApproveBatch}
        onExecute={handleExecuteBatch}
        onToggleHold={handleToggleHoldBatch}
        onExportCsv={handleExportCsv}
      />

      <PayoutApprovalModal
        batch={selectedBatch}
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        onSuccess={(updated) => {
          setIsApprovalModalOpen(false);
          setIsDrawerOpen(false);
          showFeedback(`Lot ${updated.id} approuvé avec succès`);
          fetchData();
        }}
      />

      <PayoutExecutionModal
        batch={selectedBatch}
        isOpen={isExecutionModalOpen}
        onClose={() => setIsExecutionModalOpen(false)}
        onSuccess={(updated) => {
          setIsExecutionModalOpen(false);
          setIsDrawerOpen(false);
          showFeedback(`Lot ${updated.id} marqué comme payé et décaissé avec succès`);
          fetchData();
        }}
      />

      <PayoutHoldModal
        batch={selectedBatch}
        isOpen={isHoldModalOpen}
        onClose={() => setIsHoldModalOpen(false)}
        onSuccess={(updated) => {
          setIsHoldModalOpen(false);
          setIsDrawerOpen(false);
          showFeedback(`Statut du lot ${updated.id} mis à jour (${updated.status})`);
          fetchData();
        }}
      />

      <GenerateBatchModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onSuccess={(newBatch) => {
          setIsGenerateModalOpen(false);
          showFeedback(`Nouveau lot généré avec succès (${newBatch.id})`);
          fetchData();
        }}
      />

      <CommissionsRulesModal
        rule={selectedRuleForEdit}
        isOpen={isRuleModalOpen}
        onClose={() => setIsRuleModalOpen(false)}
        onSuccess={(saved) => {
          setIsRuleModalOpen(false);
          showFeedback(`Règle de commission enregistrée avec succès`);
          fetchData();
        }}
      />

      <PayeeAdjustmentModal
        payee={selectedPayeeForAdjustment}
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        onSuccess={() => {
          setIsAdjustmentModalOpen(false);
          showFeedback(`Ajustement financier enregistré avec succès`);
          fetchData();
        }}
      />

      <PayeeStatementModal
        payee={selectedPayeeForStatement}
        isOpen={isStatementModalOpen}
        onClose={() => setIsStatementModalOpen(false)}
      />
    </div>
  );
}
