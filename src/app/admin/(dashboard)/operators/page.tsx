'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Bus,
  Search,
  Filter,
  Download,
  Plus,
  ShieldCheck,
  ShieldAlert,
  Percent,
  Star,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { OperatorAccount } from '@/types';
import { OperatorDetailDrawer } from '@/components/admin/operators/OperatorDetailDrawer';
import { OperatorFormModal } from '@/components/admin/operators/OperatorFormModal';
import { OperatorSuspendModal } from '@/components/admin/operators/OperatorSuspendModal';
import { OperatorCommissionModal } from '@/components/admin/operators/OperatorCommissionModal';
import { UserActionModal } from '@/components/admin/users/UserActionModal';
import { OptimisticConflictModal } from '@/components/admin/crud/OptimisticConflictModal';

export default function AdminOperatorsPage() {
  const [activeTab, setActiveTab] = useState<'OPERATORS' | 'FLEET' | 'TRASH'>('OPERATORS');

  // Operators List State
  const [operators, setOperators] = useState<OperatorAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cityFilter, setCityFilter] = useState('ALL');

  // Trash State
  const [trashOperators, setTrashOperators] = useState<OperatorAccount[]>([]);
  const [trashLoading, setTrashLoading] = useState(false);

  // Modals & Drawers
  const [selectedDrawerOperator, setSelectedDrawerOperator] = useState<OperatorAccount | null>(null);
  const [formModalData, setFormModalData] = useState<{
    isOpen: boolean;
    operator: OperatorAccount | null; // null for create
  }>({ isOpen: false, operator: null });
  const [suspendModalOperator, setSuspendModalOperator] = useState<OperatorAccount | null>(null);
  const [commissionModalOperator, setCommissionModalOperator] = useState<OperatorAccount | null>(null);

  // Common Action Confirmation Modal (for soft-delete & restore)
  const [actionModalConfig, setActionModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    targetName: string;
    actionType: 'DELETE' | 'RESTORE' | 'SUSPEND';
    onConfirm: (reason: string) => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    targetName: '',
    actionType: 'DELETE',
    onConfirm: async () => {},
  });

  // Optimistic Locking Conflict Modal
  const [conflictModalData, setConflictModalData] = useState<{
    isOpen: boolean;
    serverVersion: number;
    clientVersion: number;
  }>({ isOpen: false, serverVersion: 1, clientVersion: 1 });

  // Feedback Notification Banner
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(
    null
  );

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  // 1. Fetch Operators
  const fetchOperators = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (cityFilter !== 'ALL') params.set('city', cityFilter);

      const res = await fetch(`/api/admin/operators?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setOperators(data.data || []);
      }
    } catch {
      showFeedback('Erreur lors du chargement des opérateurs', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, cityFilter]);

  // 2. Fetch Trash
  const fetchTrash = useCallback(async () => {
    setTrashLoading(true);
    try {
      const res = await fetch('/api/admin/operators?trash=true');
      const data = await res.json();
      if (res.ok) {
        setTrashOperators(data.data || []);
      }
    } catch {
      showFeedback('Erreur lors du chargement de la corbeille', 'error');
    } finally {
      setTrashLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOperators();
  }, [fetchOperators]);

  useEffect(() => {
    if (activeTab === 'TRASH') {
      fetchTrash();
    }
  }, [activeTab, fetchTrash]);

  // Actions
  const handleReinstate = async (op: OperatorAccount) => {
    try {
      const res = await fetch(`/api/admin/operators/${op.id}/reinstate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'Régularisation administrative et reprise normale de l’exploitation',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la réactivation');

      showFeedback(`L’opérateur ${op.brandName} a été réactivé.`);
      fetchOperators();
      if (selectedDrawerOperator && selectedDrawerOperator.id === op.id) {
        setSelectedDrawerOperator(data.operator);
      }
    } catch (err: any) {
      showFeedback(err?.message || 'Erreur', 'error');
    }
  };

  const handleDeleteClick = (op: OperatorAccount) => {
    setActionModalConfig({
      isOpen: true,
      title: 'Mettre l’opérateur en corbeille',
      description: `L’opérateur ${op.brandName} sera déplacé dans la corbeille. Ses lignes et autocars n’apparaîtront plus dans l’annuaire actif.`,
      targetName: op.brandName,
      actionType: 'DELETE',
      onConfirm: async (reason: string) => {
        const res = await fetch(`/api/admin/operators/${op.id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erreur lors de la suppression');

        showFeedback(`Opérateur ${op.brandName} déplacé dans la corbeille.`);
        if (selectedDrawerOperator && selectedDrawerOperator.id === op.id) {
          setSelectedDrawerOperator(null);
        }
        fetchOperators();
        if (activeTab === 'TRASH') fetchTrash();
      },
    });
  };

  const handleRestoreClick = (op: OperatorAccount) => {
    setActionModalConfig({
      isOpen: true,
      title: 'Restaurer l’opérateur depuis la corbeille',
      description: `L’opérateur ${op.brandName} sera restauré dans l’annuaire actif.`,
      targetName: op.brandName,
      actionType: 'RESTORE',
      onConfirm: async (reason: string) => {
        const res = await fetch(`/api/admin/operators/${op.id}/restore`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erreur lors de la restauration');

        showFeedback(`Opérateur ${op.brandName} restauré.`);
        fetchTrash();
        fetchOperators();
      },
    });
  };

  const formatCDF = (amount: number) => {
    return new Intl.NumberFormat('fr-CD').format(amount) + ' FC';
  };

  // Metrics computation
  const totalFleetCount = operators.reduce((acc, o) => acc + (o.fleet?.length || 0), 0);
  const totalRoutesCount = operators.reduce((acc, o) => acc + (o.routes?.length || 0), 0);
  const avgOccupancy =
    operators.length > 0
      ? Math.round(
          operators.reduce((acc, o) => acc + (o.metrics?.occupancyRate || 85), 0) / operators.length
        )
      : 85;

  return (
    <div className="space-y-6">
      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-top-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="text-xs font-semibold">{feedback.message}</span>
        </div>
      )}

      {/* Main Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-brand-primary" />
            Gestion des Opérateurs Agréés & Flotte
          </h1>
          <p className="text-2xs sm:text-xs text-neutral-400 mt-0.5">
            Supervision des licences Ministère des Transports, commissionnement, flotte d&apos;autocars et départs interurbains.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setFormModalData({ isOpen: true, operator: null })}
            className="px-4 py-2.5 rounded-2xl bg-brand-primary hover:bg-brand-primary/90 text-black text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-primary/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Nouvel Opérateur
          </button>

          <a
            href="/api/admin/operators/export"
            download="transnumerica-operateurs.csv"
            className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-brand-primary" />
            Exporter CSV
          </a>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-3xl bg-[#0D1E32] border border-white/10">
          <span className="text-3xs font-bold text-neutral-400 uppercase tracking-wider block">
            Opérateurs Agréés
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-white">
              {operators.filter((o) => o.status === 'ACCREDITED').length}
            </span>
            <span className="text-2xs text-neutral-400">compagnies</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[#0D1E32] border border-brand-primary/20">
          <span className="text-3xs font-bold text-brand-primary uppercase tracking-wider block flex items-center gap-1">
            <Bus className="w-3.5 h-3.5" />
            Flotte Autocars
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-white">{totalFleetCount}</span>
            <span className="text-2xs text-neutral-400">véhicules inspectés</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[#0D1E32] border border-white/10">
          <span className="text-3xs font-bold text-neutral-400 uppercase tracking-wider block flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            Lignes Déclarées
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-white">{totalRoutesCount}</span>
            <span className="text-2xs text-neutral-400">corridors RN</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[#0D1E32] border border-emerald-500/20">
          <span className="text-3xs font-bold text-emerald-400 uppercase tracking-wider block flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Taux d&apos;Occupation
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-300">{avgOccupancy}%</span>
            <span className="text-2xs text-emerald-500/80">remplissage moyen</span>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('OPERATORS')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'OPERATORS'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Opérateurs Agréés
          <span className="px-2 py-0.5 rounded-full text-3xs font-mono bg-white/10 text-neutral-300">
            {operators.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('FLEET')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'FLEET'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Bus className="w-4 h-4" />
          Supervision Flotte & Départs
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('TRASH')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'TRASH'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          Corbeille
          {trashOperators.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-3xs font-mono bg-rose-500/20 text-rose-300">
              {trashOperators.length}
            </span>
          )}
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: OPERATORS DIRECTORY */}
      {/* ============================================================ */}
      {activeTab === 'OPERATORS' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par nom, marque, RCCM, licence..."
                className="w-full bg-[#0D1E32] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="bg-[#0D1E32] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="ALL">Toutes les villes</option>
                <option value="Kinshasa">Kinshasa</option>
                <option value="Lubumbashi">Lubumbashi</option>
                <option value="Goma">Goma</option>
                <option value="Kolwezi">Kolwezi</option>
                <option value="Matadi">Matadi</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#0D1E32] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="ACCREDITED">Agréé Ministère</option>
                <option value="PENDING_REVIEW">En examen</option>
                <option value="SUSPENDED">Suspendu</option>
              </select>

              <button
                type="button"
                onClick={fetchOperators}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10"
                title="Actualiser"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#0D1E32] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-3xs uppercase tracking-wider text-neutral-400 font-bold">
                    <th className="py-3.5 px-4">Opérateur & Marque</th>
                    <th className="py-3.5 px-4">Licence & Siège</th>
                    <th className="py-3.5 px-4 text-center">Flotte & Lignes</th>
                    <th className="py-3.5 px-4 text-center">Commission</th>
                    <th className="py-3.5 px-4 text-center">Note / Avis</th>
                    <th className="py-3.5 px-4 text-right">Solde Payout CDF</th>
                    <th className="py-3.5 px-4 text-center">Statut</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs text-neutral-300">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-neutral-400">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto text-brand-primary mb-2" />
                        Chargement des opérateurs agréés...
                      </td>
                    </tr>
                  ) : operators.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-neutral-400">
                        Aucun opérateur correspondant aux critères.
                      </td>
                    </tr>
                  ) : (
                    operators.map((op) => {
                      const isSuspended = op.status === 'SUSPENDED';

                      return (
                        <tr key={op.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white flex items-center gap-2">
                              {op.brandName}
                              {op.status === 'ACCREDITED' && (
                                <span title="Agréé Ministère des Transports">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                </span>
                              )}
                            </div>
                            <div className="text-3xs text-neutral-400 font-mono mt-0.5 truncate max-w-xs">
                              {op.name} • {op.tradeRegisterNumber}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {op.badges.slice(0, 2).map((b) => (
                                <span
                                  key={b}
                                  className="px-1.5 py-0.2 rounded text-3xs font-medium bg-brand-primary/10 text-brand-primary"
                                >
                                  {b}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-mono text-2xs text-white">{op.ministryLicense}</div>
                            <div className="text-3xs text-neutral-400">{op.primaryCity}</div>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span className="font-bold text-white block">{op.fleet.length} autocars</span>
                            <span className="text-3xs text-neutral-400">{op.routes.length} corridors</span>
                          </td>

                          <td className="py-3.5 px-4 text-center font-mono font-bold text-brand-primary">
                            {op.commissionRate}%
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1 font-bold text-amber-400">
                              <Star className="w-3 h-3 fill-amber-400" />
                              {op.metrics.rating.toFixed(1)}
                            </div>
                            <div className="text-3xs text-neutral-400">{op.metrics.totalReviews} avis</div>
                          </td>

                          <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                            {formatCDF(op.payoutDetails.pendingBalanceCDF)}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-3xs font-black uppercase border ${
                                op.status === 'ACCREDITED'
                                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                                  : isSuspended
                                  ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                                  : 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                              }`}
                            >
                              {op.status === 'ACCREDITED'
                                ? 'Agréé'
                                : isSuspended
                                ? 'Suspendu'
                                : 'En examen'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setSelectedDrawerOperator(op)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-brand-primary/20 hover:text-brand-primary text-neutral-300 transition-colors"
                                title="Voir le profil complet"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setFormModalData({ isOpen: true, operator: op })}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 transition-colors"
                                title="Modifier"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setCommissionModalOperator(op)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-brand-primary/20 hover:text-brand-primary text-neutral-300 transition-colors"
                                title="Ajuster la commission"
                              >
                                <Percent className="w-4 h-4" />
                              </button>
                              {isSuspended ? (
                                <button
                                  type="button"
                                  onClick={() => handleReinstate(op)}
                                  className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                                  title="Réactiver l’opérateur"
                                >
                                  <ShieldCheck className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setSuspendModalOperator(op)}
                                  className="p-1.5 rounded-lg bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition-colors"
                                  title="Suspendre l’opérateur"
                                >
                                  <ShieldAlert className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteClick(op)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-300 transition-colors"
                                title="Mettre en corbeille"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: FLEET & LIVE TRIPS SUPERVISION */}
      {/* ============================================================ */}
      {activeTab === 'FLEET' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-[#0D1E32] border border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bus className="w-4 h-4 text-brand-primary" />
                Supervision des Départs Interurbains Programmés
              </h3>
              <p className="text-2xs text-neutral-400 mt-0.5">
                Surveillance de la disponibilité des billets et départs actifs sous régulation Transnumerica.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchOperators}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10"
              title="Actualiser"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {operators.flatMap((op) =>
              (op.trips || []).map((trp) => (
                <div
                  key={trp.id}
                  className="p-4 rounded-3xl bg-[#0D1E32] border border-white/10 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-2xs font-bold text-brand-primary uppercase block">
                        {op.brandName}
                      </span>
                      <h4 className="text-sm font-bold text-white font-mono">{trp.tripRef}</h4>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-2xs font-bold border ${
                        trp.isBookable
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {trp.isBookable ? 'Billet Ouvert' : 'Non Réservable (Gelé)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-2xs p-3 rounded-2xl bg-black/40 border border-white/5">
                    <div>
                      <span className="text-3xs text-neutral-400 block">Départ</span>
                      <span className="font-semibold text-white">
                        {new Date(trp.departureTime).toLocaleString('fr-CD')}
                      </span>
                    </div>
                    <div>
                      <span className="text-3xs text-neutral-400 block">Tarif Voyageur</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {formatCDF(trp.fareCDF)}
                      </span>
                    </div>
                    <div>
                      <span className="text-3xs text-neutral-400 block">Autocar Assigné</span>
                      <span className="font-mono text-amber-300">{trp.vehiclePlate}</span>
                    </div>
                    <div>
                      <span className="text-3xs text-neutral-400 block">Remplissage</span>
                      <span className="font-bold text-white">
                        {trp.bookedSeats} / {trp.totalSeats} places
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: TRASH (CORBEILLE) */}
      {/* ============================================================ */}
      {activeTab === 'TRASH' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-400">
              Opérateurs archivés en corbeille (soft-delete). Ils n&apos;apparaissent plus aux voyageurs mais
              peuvent être restaurés sans perte de données.
            </p>
            <button
              type="button"
              onClick={fetchTrash}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10"
              title="Actualiser la corbeille"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-[#0D1E32] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-3xs uppercase tracking-wider text-neutral-400 font-bold">
                    <th className="py-3.5 px-4">Opérateur</th>
                    <th className="py-3.5 px-4">RCCM</th>
                    <th className="py-3.5 px-4">Supprimé le</th>
                    <th className="py-3.5 px-4">Par</th>
                    <th className="py-3.5 px-4">Motif d&apos;archivage</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs text-neutral-300">
                  {trashLoading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-neutral-400">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto text-brand-primary mb-2" />
                        Chargement de la corbeille...
                      </td>
                    </tr>
                  ) : trashOperators.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-neutral-400">
                        La corbeille des opérateurs est vide.
                      </td>
                    </tr>
                  ) : (
                    trashOperators.map((op) => (
                      <tr key={op.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white">{op.brandName}</td>
                        <td className="py-3.5 px-4 font-mono text-2xs text-neutral-300">
                          {op.tradeRegisterNumber}
                        </td>
                        <td className="py-3.5 px-4 text-neutral-400">
                          {op.deletedAt ? new Date(op.deletedAt).toLocaleString('fr-CD') : '—'}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-2xs text-brand-primary">
                          {op.deletedBy || 'Admin'}
                        </td>
                        <td className="py-3.5 px-4 text-2xs text-neutral-400 italic">
                          {op.deletionReason || 'Non spécifié'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleRestoreClick(op)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 ml-auto border border-emerald-500/30"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Restaurer
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* INTEGRATED MODALS & DRAWERS */}
      {/* ============================================================ */}

      {/* Operator Detail Drawer */}
      {selectedDrawerOperator && (
        <OperatorDetailDrawer
          isOpen={!!selectedDrawerOperator}
          onClose={() => setSelectedDrawerOperator(null)}
          operator={selectedDrawerOperator}
          onEdit={(op) => {
            setSelectedDrawerOperator(null);
            setFormModalData({ isOpen: true, operator: op });
          }}
          onSuspendClick={(op) => {
            setSelectedDrawerOperator(null);
            setSuspendModalOperator(op);
          }}
          onReinstateClick={(op) => handleReinstate(op)}
          onCommissionClick={(op) => {
            setSelectedDrawerOperator(null);
            setCommissionModalOperator(op);
          }}
          onDeleteClick={(op) => handleDeleteClick(op)}
          onRestoreClick={(op) => handleRestoreClick(op)}
        />
      )}

      {/* Operator Form Modal (Create / Edit) */}
      {formModalData.isOpen && (
        <OperatorFormModal
          isOpen={formModalData.isOpen}
          onClose={() => setFormModalData({ isOpen: false, operator: null })}
          operator={formModalData.operator}
          onSuccess={() => {
            showFeedback(
              formModalData.operator ? 'Opérateur mis à jour avec succès.' : 'Nouvel opérateur créé avec succès.'
            );
            fetchOperators();
          }}
          onConflict={(serverVersion) => {
            setConflictModalData({
              isOpen: true,
              serverVersion,
              clientVersion: formModalData.operator?.version || 1,
            });
          }}
        />
      )}

      {/* Operator Suspend Modal with Policy */}
      {suspendModalOperator && (
        <OperatorSuspendModal
          isOpen={!!suspendModalOperator}
          onClose={() => setSuspendModalOperator(null)}
          operator={suspendModalOperator}
          onSuccess={() => {
            showFeedback(`Opérateur ${suspendModalOperator.brandName} suspendu. Départs gelés.`);
            fetchOperators();
          }}
        />
      )}

      {/* Operator Commission Modal */}
      {commissionModalOperator && (
        <OperatorCommissionModal
          isOpen={!!commissionModalOperator}
          onClose={() => setCommissionModalOperator(null)}
          operator={commissionModalOperator}
          onSuccess={() => {
            showFeedback('Taux de commission plateforme mis à jour.');
            fetchOperators();
          }}
        />
      )}

      {/* Action Confirmation Modal (Delete / Restore) */}
      <UserActionModal
        isOpen={actionModalConfig.isOpen}
        onClose={() => setActionModalConfig((prev) => ({ ...prev, isOpen: false }))}
        title={actionModalConfig.title}
        description={actionModalConfig.description}
        targetName={actionModalConfig.targetName}
        actionType={actionModalConfig.actionType as any}
        onConfirm={actionModalConfig.onConfirm}
      />

      {/* Optimistic Conflict Modal */}
      <OptimisticConflictModal
        isOpen={conflictModalData.isOpen}
        onClose={() => setConflictModalData((prev) => ({ ...prev, isOpen: false }))}
        currentVersion={conflictModalData.clientVersion}
        expectedVersion={conflictModalData.serverVersion}
        onReload={() => {
          setConflictModalData((prev) => ({ ...prev, isOpen: false }));
          setFormModalData({ isOpen: false, operator: null });
          fetchOperators();
        }}
      />
    </div>
  );
}
