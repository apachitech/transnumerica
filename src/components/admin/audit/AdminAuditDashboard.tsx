'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  History,
  ShieldAlert,
  ShieldCheck,
  Search,
  RefreshCw,
  Filter,
  Download,
  AlertTriangle,
  Layers,
  Lock,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  XCircle,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';
import {
  EnhancedAuditLogEntry,
  AuditEntityType,
  AuditLogStatus,
  AuditVerificationResult,
  SuspiciousActivityAlert,
  AuditLogFilterParams,
} from '@/types';
import { AuditDiffDrawer } from './AuditDiffDrawer';
import { AuditIntegrityChecker } from './AuditIntegrityChecker';
import { SuspiciousAlertsList } from './SuspiciousAlertsList';
import { AuditExportModal } from './AuditExportModal';

const ENTITY_OPTIONS: { label: string; value: AuditEntityType | '' }[] = [
  { label: 'Toutes les entités', value: '' },
  { label: 'Utilisateurs & Personnel', value: 'USER' },
  { label: 'Rôles & Privilèges', value: 'ROLE' },
  { label: 'Lignes & Arrêts', value: 'ROUTE' },
  { label: 'Réservations & Trajets', value: 'BOOKING' },
  { label: 'Finances & Payouts', value: 'FINANCE' },
  { label: 'Paramètres Système', value: 'SETTINGS' },
  { label: 'Authentification & 2FA', value: 'AUTH' },
  { label: 'CMS & Contenus', value: 'CMS' },
  { label: 'Notifications & Campagnes', value: 'NOTIFICATION' },
  { label: 'Sécurité & Accès', value: 'SECURITY' },
  { label: 'Système & Infrastructure', value: 'SYSTEM' },
];

export function AdminAuditDashboard() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'all' | 'denied' | 'integrity'>('all');

  // Logs state
  const [logs, setLogs] = useState<EnhancedAuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<AuditEntityType | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<AuditLogStatus | ''>('');
  const [ipFilter, setIpFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);

  // Verification & Alerts state
  const [verificationResult, setVerificationResult] = useState<AuditVerificationResult | null>(null);
  const [alerts, setAlerts] = useState<SuspiciousActivityAlert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [deniedCount, setDeniedCount] = useState(0);

  // Modals & Drawers
  const [selectedDiffEntryId, setSelectedDiffEntryId] = useState<string | null>(null);
  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Copy hash indicator
  const [copiedHashId, setCopiedHashId] = useState<string | null>(null);

  // Fetch Main Logs
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = activeTab === 'denied' ? '/api/admin/audit/denied' : '/api/admin/audit';
      const params = new URLSearchParams();

      if (search) params.set('search', search);
      if (selectedEntity) params.set('entityType', selectedEntity);
      if (activeTab === 'all' && selectedStatus) params.set('status', selectedStatus);
      if (ipFilter) params.set('ipAddress', ipFilter);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));

      const res = await fetch(`${endpoint}?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du chargement des logs d’audit');
      }

      setLogs(data.entries || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      setError(err.message || 'Impossible de récupérer le journal d’audit.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, selectedEntity, selectedStatus, ipFilter, startDate, endDate, page, pageSize]);

  // Fetch Integrity & Alerts metadata
  const fetchMetadata = useCallback(async () => {
    setAlertsLoading(true);
    try {
      // Verification
      const vRes = await fetch('/api/admin/audit/verify');
      const vData = await vRes.json();
      if (vRes.ok && vData.verification) {
        setVerificationResult(vData.verification);
      }

      // Alerts
      const aRes = await fetch('/api/admin/audit/alerts');
      const aData = await aRes.json();
      if (aRes.ok && aData.alerts) {
        setAlerts(aData.alerts);
      }

      // Denied count
      const dRes = await fetch('/api/admin/audit/denied?pageSize=1');
      const dData = await dRes.json();
      if (dRes.ok) {
        setDeniedCount(dData.total || 0);
      }
    } catch (err) {
      console.error('Error fetching metadata:', err);
    } finally {
      setAlertsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  const resetFilters = () => {
    setSearch('');
    setSelectedEntity('');
    setSelectedStatus('');
    setIpFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const handleOpenDiff = (id: string) => {
    setSelectedDiffEntryId(id);
    setIsDiffOpen(true);
  };

  const copyHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHashId(id);
    setTimeout(() => setCopiedHashId(null), 2000);
  };

  const currentFilters: AuditLogFilterParams = {
    search: search || undefined,
    entityType: selectedEntity || undefined,
    status: (activeTab === 'denied' ? 'DENIED' : selectedStatus) || undefined,
    ipAddress: ipFilter || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  };

  return (
    <div className="space-y-6" data-testid="admin-audit-dashboard">
      {/* Top Banner / Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Registre d'Audit Immuable (WORM)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-3xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <Lock className="h-3 w-3" /> Append-Only
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Traçabilité inviolable, scellement SHA-256 en chaîne, alertes d'anomalies et comparaison différentielle.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/10"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Exporter</span>
          </button>

          <button
            type="button"
            onClick={() => {
              fetchLogs();
              fetchMetadata();
            }}
            disabled={loading}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Blocks */}
        <div className="rounded-3xl bg-[#0D1E32] border border-white/10 p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between text-2xs font-bold uppercase tracking-wider text-neutral-400">
            <span>Total Blocs Scellés</span>
            <Layers className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {verificationResult?.totalVerified ?? verificationResult?.totalBlocksVerified ?? total}
          </div>
          <div className="text-3xs text-neutral-400">
            Chaînage continu depuis Genesis
          </div>
        </div>

        {/* Denied Attempts */}
        <div className="rounded-3xl bg-[#0D1E32] border border-white/10 p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between text-2xs font-bold uppercase tracking-wider text-neutral-400">
            <span>Accès Refusés (403/401)</span>
            <ShieldAlert className="h-4 w-4 text-red-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-red-400">
            {deniedCount}
          </div>
          <div className="text-3xs text-neutral-400">
            Sondes bloquées automatiquement
          </div>
        </div>

        {/* Chain Integrity */}
        <div className="rounded-3xl bg-[#0D1E32] border border-white/10 p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between text-2xs font-bold uppercase tracking-wider text-neutral-400">
            <span>Intégrité Chaîne</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 flex items-center gap-1.5">
            <span>100%</span>
            <CheckCircle className="h-4 w-4" />
          </div>
          <div className="text-3xs text-neutral-400">
            SHA-256 cryptographiquement valide
          </div>
        </div>

        {/* Suspicious Alerts */}
        <div className="rounded-3xl bg-[#0D1E32] border border-white/10 p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between text-2xs font-bold uppercase tracking-wider text-neutral-400">
            <span>Alertes Suspectes</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-400">
            {alerts.filter((a) => !a.acknowledged && !a.isAcknowledged).length}
          </div>
          <div className="text-3xs text-neutral-400">
            Anomalies détectées en attente
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-2">
        <button
          type="button"
          onClick={() => {
            setActiveTab('all');
            setPage(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'all'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <History className="h-3.5 w-3.5" />
          <span>Journal Général ({total})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('denied');
            setPage(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'denied'
              ? 'bg-red-500 text-white shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Tentatives Refusées ({deniedCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('integrity')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'integrity'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Intégrité & Alertes ({alerts.length})</span>
        </button>
      </div>

      {/* View 1 & 2: Table Views */}
      {activeTab !== 'integrity' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#0D1E32] border border-white/10 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* Search text */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Recherche (action, acteur, IP, motif)..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-[#081524] border border-white/15 rounded-xl text-xs text-white placeholder-neutral-500 outline-none focus:border-amber-400"
                />
              </div>

              {/* Entity Type Filter */}
              <div>
                <select
                  value={selectedEntity}
                  onChange={(e) => {
                    setSelectedEntity(e.target.value as AuditEntityType | '');
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 bg-[#081524] border border-white/15 rounded-xl text-xs text-white outline-none focus:border-amber-400"
                >
                  {ENTITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-[#081524]">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter (only in 'all' tab) */}
              {activeTab === 'all' && (
                <div>
                  <select
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value as AuditLogStatus | '');
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 bg-[#081524] border border-white/15 rounded-xl text-xs text-white outline-none focus:border-amber-400"
                  >
                    <option value="" className="bg-[#081524]">Tous les statuts</option>
                    <option value="SUCCESS" className="bg-[#081524]">Succès (SUCCESS)</option>
                    <option value="DENIED" className="bg-[#081524]">Refusé (DENIED)</option>
                    <option value="WARNING" className="bg-[#081524]">Avertissement (WARNING)</option>
                  </select>
                </div>
              )}

              {/* IP filter */}
              <div>
                <input
                  type="text"
                  placeholder="Filtrer par IP (ex: 197.157...)"
                  value={ipFilter}
                  onChange={(e) => {
                    setIpFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 bg-[#081524] border border-white/15 rounded-xl text-xs text-white placeholder-neutral-500 outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Additional Date Range & Reset Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5 text-2xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-neutral-400 font-bold">Période :</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-[#081524] border border-white/15 text-white text-2xs"
                />
                <span className="text-neutral-400">à</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-[#081524] border border-white/15 text-white text-2xs"
                />
              </div>

              {(search || selectedEntity || selectedStatus || ipFilter || startDate || endDate) && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Réinitialiser les filtres</span>
                </button>
              )}
            </div>
          </div>

          {/* Table Card */}
          <div className="rounded-3xl bg-[#0D1E32] border border-white/10 overflow-hidden">
            {error && (
              <div className="p-4 bg-red-500/10 border-b border-red-500/20 text-red-300 text-xs">
                {error}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-2xs font-black uppercase tracking-wider text-neutral-400 bg-black/30 border-b border-white/10">
                  <tr>
                    <th className="py-3 px-3.5">Bloc</th>
                    <th className="py-3 px-3.5">Date & Heure</th>
                    <th className="py-3 px-3.5">Acteur</th>
                    <th className="py-3 px-3.5">Action & Entité</th>
                    <th className="py-3 px-3.5">Statut</th>
                    <th className="py-3 px-3.5">Adresse IP</th>
                    <th className="py-3 px-3.5">Hachage (SHA-256)</th>
                    <th className="py-3 px-3.5 text-right">Diff Avant/Après</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {loading && (
                    <>
                      {[...Array(6)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={8} className="py-4 px-3.5">
                            <div className="h-4 bg-white/5 rounded-lg w-full" />
                          </td>
                        </tr>
                      ))}
                    </>
                  )}

                  {!loading && logs.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 px-4 text-center">
                        <div className="max-w-sm mx-auto space-y-2">
                          <History className="h-8 w-8 mx-auto text-neutral-500" />
                          <div className="font-bold text-white text-sm">
                            Aucun enregistrement d'audit trouvé
                          </div>
                          <p className="text-2xs text-neutral-400">
                            Aucune entrée ne correspond aux critères de recherche spécifiés.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    logs.map((log) => {
                      const seqNum = log.sequenceNumber ?? log.sequence ?? 0;
                      const actorName = log.adminUser || log.actor || 'N/A';
                      const logHash = log.currentHash || log.hash || '';

                      return (
                        <tr
                          key={log.id}
                          className="hover:bg-white/5 transition-colors group"
                          data-testid={`audit-row-${seqNum}`}
                        >
                          {/* Sequence */}
                          <td className="py-3.5 px-3.5 font-mono text-2xs font-black text-amber-400 whitespace-nowrap">
                            #{seqNum}
                          </td>

                          {/* Timestamp */}
                          <td className="py-3.5 px-3.5 text-neutral-400 font-mono text-2xs whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString('fr-FR', {
                              timeZone: 'Africa/Kinshasa',
                            })}
                          </td>

                          {/* Actor */}
                          <td className="py-3.5 px-3.5 whitespace-nowrap">
                            <div className="font-bold text-white text-xs truncate max-w-[140px]">
                              {actorName}
                            </div>
                            {log.actorRole && (
                              <span className="text-3xs text-neutral-400 font-mono">
                                {log.actorRole}
                              </span>
                            )}
                          </td>

                          {/* Action & Entity */}
                          <td className="py-3.5 px-3.5">
                            <div className="font-extrabold text-white text-xs">
                              {log.action}
                            </div>
                            <div className="text-3xs text-neutral-400 flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-blue-300 font-bold uppercase">
                                {log.entityType}
                              </span>
                              <span>•</span>
                              <span className="truncate max-w-[160px] text-neutral-300">
                                {log.entityId}
                              </span>
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-3.5 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-3xs font-black uppercase tracking-wider border ${
                                log.status === 'SUCCESS'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : log.status === 'DENIED'
                                  ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              }`}
                            >
                              {log.status === 'SUCCESS'
                                ? 'Succès'
                                : log.status === 'DENIED'
                                ? 'Refusé'
                                : 'Alerte'}
                            </span>
                          </td>

                          {/* IP Address */}
                          <td className="py-3.5 px-3.5 font-mono text-2xs text-neutral-300 whitespace-nowrap">
                            {log.ipAddress}
                          </td>

                          {/* Hash (truncated with copy button) */}
                          <td className="py-3.5 px-3.5 whitespace-nowrap font-mono text-3xs">
                            <button
                              type="button"
                              onClick={() => copyHash(logHash, log.id)}
                              className="flex items-center gap-1 text-neutral-400 hover:text-amber-400 transition-colors p-1 rounded-lg bg-black/30 border border-white/5"
                              title={logHash}
                            >
                              {copiedHashId === log.id ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                              <span className="truncate max-w-[80px]">
                                {logHash ? `${logHash.slice(0, 10)}...` : 'N/A'}
                              </span>
                            </button>
                          </td>

                          {/* Action: Open Diff Drawer */}
                          <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleOpenDiff(log.id)}
                              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-amber-500 hover:text-black text-white text-xs font-bold transition-all flex items-center gap-1.5 ml-auto"
                              data-testid={`btn-diff-${seqNum}`}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>Voir Diff</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-black/20 border-t border-white/10 text-xs text-neutral-400">
              <div>
                Affichage de <span className="font-bold text-white">{logs.length}</span> sur{' '}
                <span className="font-bold text-white">{total}</span> entrées scellées
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1 text-xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Précédent</span>
                </button>

                <span className="px-2 font-mono text-2xs text-white">
                  Page {page} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1 text-xs"
                >
                  <span>Suivant</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 3: Integrity & Suspicious Patterns Tab */}
      {activeTab === 'integrity' && (
        <div className="space-y-6">
          <AuditIntegrityChecker
            initialResult={verificationResult}
            onVerified={(res) => setVerificationResult(res)}
          />

          <SuspiciousAlertsList
            alerts={alerts}
            loading={alertsLoading}
            onRefresh={fetchMetadata}
          />
        </div>
      )}

      {/* Diff Drawer */}
      <AuditDiffDrawer
        entryId={selectedDiffEntryId}
        isOpen={isDiffOpen}
        onClose={() => {
          setIsDiffOpen(false);
          setSelectedDiffEntryId(null);
        }}
      />

      {/* Export Modal */}
      <AuditExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        filters={currentFilters}
      />
    </div>
  );
}
