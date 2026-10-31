'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CityServiceMatrixEntry,
  FeatureFlag,
  ServiceControlSnapshot,
  ServiceMatrixServiceId,
} from '@/types';
import {
  ShieldAlert,
  Clock,
  MapPin,
  RotateCcw,
  Sliders,
  Flag,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Plus,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Building,
  Info,
  Radio,
} from 'lucide-react';

interface MatrixResponse {
  matrix: CityServiceMatrixEntry[];
  total: number;
  activeCount: number;
  suspendedCount: number;
  disabledCount: number;
}

interface FlagsResponse {
  flags: FeatureFlag[];
  total: number;
  activeCount: number;
}

interface HistoryResponse {
  snapshots: ServiceControlSnapshot[];
  total: number;
}

const SERVICE_LABELS: Record<ServiceMatrixServiceId, { label: string; icon: string }> = {
  bus: { label: 'Bus Interurbain', icon: '🚌' },
  taxi: { label: 'Taxi Urbain', icon: '🚕' },
  moto: { label: 'Wewa (Moto)', icon: '🏍️' },
  delivery: { label: 'Moto Express', icon: '📦' },
  flights: { label: 'Vols Domestiques', icon: '✈️' },
  hotels: { label: 'Hôtels & Logis', icon: '🏨' },
  train: { label: 'Train ONATRA', icon: '🚆' },
};

const CITIES_LIST = [
  { id: 'kinshasa', name: 'Kinshasa' },
  { id: 'lubumbashi', name: 'Lubumbashi' },
  { id: 'kolwezi', name: 'Kolwezi' },
  { id: 'matadi', name: 'Matadi' },
  { id: 'goma', name: 'Goma' },
];

export function ServiceControlDashboard() {
  const [activeTab, setActiveTab] = useState<'matrix' | 'flags' | 'history'>('matrix');
  const [matrixData, setMatrixData] = useState<MatrixResponse | null>(null);
  const [flagsData, setFlagsData] = useState<FlagsResponse | null>(null);
  const [historyData, setHistoryData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filters
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [suspensionModalEntry, setSuspensionModalEntry] = useState<CityServiceMatrixEntry | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [suspensionUserMessage, setSuspensionUserMessage] = useState('');

  const [editModalEntry, setEditModalEntry] = useState<CityServiceMatrixEntry | null>(null);
  const [editTimeWindowEnabled, setEditTimeWindowEnabled] = useState(false);
  const [editStartTime, setEditStartTime] = useState('06:00');
  const [editEndTime, setEditEndTime] = useState('21:00');
  const [editZoneLimitsEnabled, setEditZoneLimitsEnabled] = useState(false);
  const [editAllowedZones, setEditAllowedZones] = useState('');
  const [editRestrictedZones, setEditRestrictedZones] = useState('');
  const [editReason, setEditReason] = useState('');

  const [rollbackModalSnapshot, setRollbackModalSnapshot] = useState<ServiceControlSnapshot | null>(null);
  const [rollbackReason, setRollbackReason] = useState('');

  const [newFlagModalOpen, setNewFlagModalOpen] = useState(false);
  const [flagKey, setFlagKey] = useState('');
  const [flagName, setFlagName] = useState('');
  const [flagDesc, setFlagDesc] = useState('');
  const [flagRollout, setFlagRollout] = useState(100);
  const [flagEnabled, setFlagEnabled] = useState(true);
  const [flagCities, setFlagCities] = useState<string[]>([]);
  const [flagReason, setFlagReason] = useState('');

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 6000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [matrixRes, flagsRes, histRes] = await Promise.all([
        fetch('/api/admin/service-control/matrix'),
        fetch('/api/admin/service-control/flags'),
        fetch('/api/admin/service-control/history'),
      ]);

      if (matrixRes.ok) {
        const m = await matrixRes.json();
        setMatrixData(m);
      }
      if (flagsRes.ok) {
        const f = await flagsRes.json();
        setFlagsData(f);
      }
      if (histRes.ok) {
        const h = await histRes.json();
        setHistoryData(h);
      }
    } catch {
      showNotification('error', 'Erreur lors du chargement des données de régulation');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Quick Toggle Matrix Entry
  const handleToggleEntry = async (entry: CityServiceMatrixEntry) => {
    setActionLoading(true);
    const newEnabled = !entry.enabled;
    const reason = newEnabled
      ? `Réactivation opérationnelle du service ${entry.serviceName} à ${entry.cityName}`
      : `Désactivation temporaire du service ${entry.serviceName} à ${entry.cityName}`;

    try {
      const res = await fetch('/api/admin/service-control/matrix', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityId: entry.cityId,
          serviceId: entry.serviceId,
          enabled: newEnabled,
          reason,
          version: entry.version,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showNotification('error', data.error || 'Erreur lors du basculement');
      } else {
        showNotification(
          'success',
          `Service ${entry.serviceName} à ${entry.cityName} ${newEnabled ? 'activé' : 'désactivé'} avec succès.`
        );
        fetchData();
      }
    } catch {
      showNotification('error', 'Erreur réseau');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Emergency Suspension Modal
  const openSuspensionModal = (entry: CityServiceMatrixEntry) => {
    setSuspensionModalEntry(entry);
    if (entry.suspension.isSuspended) {
      setSuspensionReason(entry.suspension.reason || '');
      setSuspensionUserMessage(entry.suspension.userMessage || '');
    } else {
      setSuspensionReason('Arrêté préfectoral ou perturbation climatique majeure');
      setSuspensionUserMessage(
        `Le service ${entry.serviceName} est temporairement suspendu à ${entry.cityName} en raison de conditions exceptionnelles. Nos équipes travaillent pour rétablir le service dans les plus brefs délais.`
      );
    }
  };

  // Submit Emergency Suspension
  const handleSubmitSuspension = async (isSuspended: boolean) => {
    if (!suspensionModalEntry) return;
    if (isSuspended && (!suspensionReason.trim() || !suspensionUserMessage.trim())) {
      showNotification('error', 'Veuillez renseigner le motif administratif et le message usager.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/service-control/suspend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityId: suspensionModalEntry.cityId,
          serviceId: suspensionModalEntry.serviceId,
          isSuspended,
          reason: suspensionReason.trim() || 'Levée de la suspension administrative',
          userMessage: suspensionUserMessage.trim() || 'Service rétabli.',
          version: suspensionModalEntry.version,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showNotification('error', data.error || 'Erreur lors de la suspension');
      } else {
        showNotification(
          'success',
          isSuspended
            ? `🚨 Suspension d'urgence activée pour ${suspensionModalEntry.serviceName} à ${suspensionModalEntry.cityName}. Le message est visible par les usagers.`
            : `✅ Suspension levée pour ${suspensionModalEntry.serviceName} à ${suspensionModalEntry.cityName}.`
        );
        setSuspensionModalEntry(null);
        fetchData();
      }
    } catch {
      showNotification('error', 'Erreur réseau');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (entry: CityServiceMatrixEntry) => {
    setEditModalEntry(entry);
    setEditTimeWindowEnabled(entry.timeWindow.enabled);
    setEditStartTime(entry.timeWindow.startTime);
    setEditEndTime(entry.timeWindow.endTime);
    setEditZoneLimitsEnabled(entry.zoneLimits.enabled);
    setEditAllowedZones(entry.zoneLimits.allowedZones.join(', '));
    setEditRestrictedZones(entry.zoneLimits.restrictedZones.join(', '));
    setEditReason('Ajustement des règles opérationnelles');
  };

  // Submit Edit Modal
  const handleSubmitEdit = async () => {
    if (!editModalEntry) return;
    if (!editReason.trim()) {
      showNotification('error', 'Le motif de modification est obligatoire.');
      return;
    }

    setActionLoading(true);
    try {
      const allowedArr = editAllowedZones
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const restrictedArr = editRestrictedZones
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/admin/service-control/matrix', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityId: editModalEntry.cityId,
          serviceId: editModalEntry.serviceId,
          enabled: editModalEntry.enabled,
          timeWindow: {
            enabled: editTimeWindowEnabled,
            startTime: editStartTime,
            endTime: editEndTime,
          },
          zoneLimits: {
            enabled: editZoneLimitsEnabled,
            allowedZones: allowedArr,
            restrictedZones: restrictedArr,
          },
          reason: editReason.trim(),
          version: editModalEntry.version,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showNotification('error', data.error || 'Erreur lors de la mise à jour');
      } else {
        showNotification(
          'success',
          `Règles de ${editModalEntry.serviceName} à ${editModalEntry.cityName} mises à jour avec succès.`
        );
        setEditModalEntry(null);
        fetchData();
      }
    } catch {
      showNotification('error', 'Erreur réseau');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Feature Flag
  const handleToggleFlag = async (flag: FeatureFlag) => {
    setActionLoading(true);
    const newEnabled = !flag.isEnabled;
    const reason = newEnabled
      ? `Activation du Feature Flag ${flag.name}`
      : `Désactivation du Feature Flag ${flag.name}`;

    try {
      const res = await fetch('/api/admin/service-control/flags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: flag.key,
          isEnabled: newEnabled,
          reason,
          version: flag.version,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showNotification('error', data.error || 'Erreur lors du basculement');
      } else {
        showNotification(
          'success',
          `Drapeau ${flag.name} ${newEnabled ? 'activé' : 'désactivé'} avec succès.`
        );
        fetchData();
      }
    } catch {
      showNotification('error', 'Erreur réseau');
    } finally {
      setActionLoading(false);
    }
  };

  // Rollout slider change
  const handleRolloutChange = async (flag: FeatureFlag, newPercentage: number) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/service-control/flags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: flag.key,
          name: flag.name,
          description: flag.description,
          isEnabled: flag.isEnabled,
          rolloutPercentage: newPercentage,
          targetCities: flag.targetCities,
          reason: `Ajustement du déploiement progressif à ${newPercentage}%`,
          version: flag.version,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showNotification('error', data.error || 'Erreur');
      } else {
        showNotification('success', `Taux de déploiement fixé à ${newPercentage}%`);
        fetchData();
      }
    } catch {
      showNotification('error', 'Erreur réseau');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit New Feature Flag
  const handleSubmitNewFlag = async () => {
    if (!flagKey.trim() || !flagName.trim() || !flagDesc.trim() || !flagReason.trim()) {
      showNotification('error', 'Tous les champs sont requis.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/service-control/flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: flagKey.trim().toLowerCase(),
          name: flagName.trim(),
          description: flagDesc.trim(),
          isEnabled: flagEnabled,
          rolloutPercentage: flagRollout,
          targetCities: flagCities,
          reason: flagReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showNotification('error', data.error || 'Erreur');
      } else {
        showNotification('success', `Feature flag "${flagName}" créé avec succès.`);
        setNewFlagModalOpen(false);
        setFlagKey('');
        setFlagName('');
        setFlagDesc('');
        setFlagReason('');
        setFlagCities([]);
        fetchData();
      }
    } catch {
      showNotification('error', 'Erreur réseau');
    } finally {
      setActionLoading(false);
    }
  };

  // Rollback to Snapshot
  const handleRollback = async () => {
    if (!rollbackModalSnapshot) return;
    if (!rollbackReason.trim() || rollbackReason.trim().length < 5) {
      showNotification('error', 'Le motif de restauration doit contenir au moins 5 caractères.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/service-control/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          snapshotId: rollbackModalSnapshot.id,
          reason: rollbackReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showNotification('error', data.error || 'Erreur lors du rollback');
      } else {
        showNotification(
          'success',
          `Restauration complète vers l'instantané effectuée avec succès. Cache public invalidé.`
        );
        setRollbackModalSnapshot(null);
        setRollbackReason('');
        fetchData();
      }
    } catch {
      showNotification('error', 'Erreur réseau');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered Matrix Entries
  const filteredMatrix = (matrixData?.matrix || []).filter((entry) => {
    if (selectedCityFilter !== 'ALL' && entry.cityId.toLowerCase() !== selectedCityFilter.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        entry.cityName.toLowerCase().includes(query) ||
        entry.serviceName.toLowerCase().includes(query) ||
        (entry.suspension.reason && entry.suspension.reason.toLowerCase().includes(query)) ||
        (entry.suspension.userMessage && entry.suspension.userMessage.toLowerCase().includes(query))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Toast Notification */}
      {notification && (
        <div
          role="alert"
          data-testid="toast-notification"
          className={`p-4 rounded-xl text-sm font-semibold flex items-center justify-between shadow-lg transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 border border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/90 border border-rose-500/50 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs text-neutral-400 hover:text-white ml-4 underline"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Header and Live Status Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Régulation des Services & Drapeaux
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              En direct (Sans Redéploiement)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Matrice opérationnelle des transports par ville congolaise, fenêtres horaires, périmètres restreints, suspensions d'urgence et déploiement progressif.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchData}
            disabled={loading || actionLoading}
            className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-200 text-xs sm:text-sm font-medium rounded-lg flex items-center gap-2 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            <span>Actualiser</span>
          </button>

          {activeTab === 'flags' && (
            <button
              type="button"
              onClick={() => setNewFlagModalOpen(true)}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs sm:text-sm font-bold rounded-lg flex items-center gap-1.5 shadow transition"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Flag</span>
            </button>
          )}
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
            <span>Services Opérationnels</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {matrixData?.activeCount ?? '--'}
            <span className="text-xs font-normal text-neutral-500 ml-1.5">
              / {matrixData?.total ?? '--'}
            </span>
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1">Actifs en temps réel</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
            <span>Suspensions d'Urgence</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-400 mt-2">
            {matrixData?.suspendedCount ?? '--'}
          </div>
          <div className="text-[11px] text-rose-400/80 mt-1">Blocages avec message usager</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
            <span>Services Inactifs</span>
            <XCircle className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="text-2xl font-black text-neutral-400 mt-2">
            {matrixData?.disabledCount ?? '--'}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">Hors ligne administrativement</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
            <span>Feature Flags Actifs</span>
            <Flag className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">
            {flagsData?.activeCount ?? '--'}
            <span className="text-xs font-normal text-neutral-500 ml-1.5">
              / {flagsData?.total ?? '--'}
            </span>
          </div>
          <div className="text-[11px] text-amber-400/80 mt-1">Déploiements ciblés & %</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-neutral-800 gap-1 sm:gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'matrix'
              ? 'border-amber-500 text-amber-400 bg-neutral-900/40 rounded-t-lg'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Matrice Ville × Service ({matrixData?.total || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('flags')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'flags'
              ? 'border-amber-500 text-amber-400 bg-neutral-900/40 rounded-t-lg'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Flag className="w-4 h-4" />
          <span>Feature Flags ({flagsData?.total || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'history'
              ? 'border-amber-500 text-amber-400 bg-neutral-900/40 rounded-t-lg'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Historique & Rollback ({historyData?.total || 0})</span>
        </button>
      </div>

      {/* ======================= TAB 1: MATRIX VIEW ======================= */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          {/* Controls: Search and City Filter */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-neutral-400">Filtrer par Ville :</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedCityFilter('ALL')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                    selectedCityFilter === 'ALL'
                      ? 'bg-amber-500 text-neutral-950 font-bold'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  Toutes ({matrixData?.matrix.length || 0})
                </button>
                {CITIES_LIST.map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => setSelectedCityFilter(city.id)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                      selectedCityFilter === city.id
                        ? 'bg-amber-500 text-neutral-950 font-bold'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher service, motif..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-950 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Table / Grid for Matrix */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-950/60 text-neutral-400 font-semibold">
                    <th className="p-3 sm:p-4">Ville & Service</th>
                    <th className="p-3 sm:p-4">Statut Opérationnel</th>
                    <th className="p-3 sm:p-4 hidden md:table-cell">Plage Horaire</th>
                    <th className="p-3 sm:p-4 hidden lg:table-cell">Restrictions de Zones</th>
                    <th className="p-3 sm:p-4 text-right">Actions de Régulation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {filteredMatrix.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-neutral-500">
                        Aucun service trouvé pour les critères sélectionnés.
                      </td>
                    </tr>
                  ) : (
                    filteredMatrix.map((entry) => {
                      const isSuspended = entry.suspension.isSuspended;
                      const isEnabled = entry.enabled;
                      const serviceMeta = SERVICE_LABELS[entry.serviceId] || {
                        label: entry.serviceName,
                        icon: '🚗',
                      };

                      return (
                        <tr
                          key={entry.id}
                          className={`hover:bg-neutral-800/40 transition ${
                            isSuspended
                              ? 'bg-rose-950/20'
                              : !isEnabled
                              ? 'bg-neutral-950/40 opacity-75'
                              : ''
                          }`}
                        >
                          {/* City & Service */}
                          <td className="p-3 sm:p-4">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl shrink-0" role="img" aria-label={entry.serviceName}>
                                {serviceMeta.icon}
                              </span>
                              <div>
                                <div className="font-bold text-white text-sm flex items-center gap-1.5">
                                  <span>{entry.serviceName}</span>
                                </div>
                                <div className="text-neutral-400 text-xs flex items-center gap-1">
                                  <Building className="w-3 h-3 text-neutral-500" />
                                  <span className="font-medium text-amber-400/90">{entry.cityName}</span>
                                  <span className="text-[10px] text-neutral-600 font-mono">
                                    (v{entry.version})
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="p-3 sm:p-4">
                            {isSuspended ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-black bg-rose-950 text-rose-300 border border-rose-800/80">
                                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                                  SUSPENDU D'URGENCE
                                </span>
                                {entry.suspension.userMessage && (
                                  <p className="text-[11px] text-rose-300/90 line-clamp-2 italic max-w-xs">
                                    "{entry.suspension.userMessage}"
                                  </p>
                                )}
                              </div>
                            ) : isEnabled ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                OPÉRATIONNEL
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-neutral-800 text-neutral-400 border border-neutral-700">
                                <XCircle className="w-3.5 h-3.5 text-neutral-500" />
                                DÉSACTIVÉ
                              </span>
                            )}
                          </td>

                          {/* Time Window */}
                          <td className="p-3 sm:p-4 hidden md:table-cell">
                            {entry.timeWindow.enabled ? (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                                <Clock className="w-3.5 h-3.5 text-amber-400" />
                                <span className="font-mono text-xs font-semibold">
                                  {entry.timeWindow.startTime} - {entry.timeWindow.endTime}
                                </span>
                              </div>
                            ) : (
                              <span className="text-neutral-500 text-xs">24h / 24h</span>
                            )}
                          </td>

                          {/* Zone Limits */}
                          <td className="p-3 sm:p-4 hidden lg:table-cell">
                            {entry.zoneLimits.enabled ? (
                              <div className="space-y-1">
                                {entry.zoneLimits.restrictedZones.length > 0 && (
                                  <div className="text-[11px] text-rose-400 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 shrink-0" />
                                    <span>
                                      {entry.zoneLimits.restrictedZones.length} interdite(s) :{' '}
                                      {entry.zoneLimits.restrictedZones.slice(0, 1).join(', ')}...
                                    </span>
                                  </div>
                                )}
                                {entry.zoneLimits.allowedZones.length > 0 && (
                                  <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                                    <span>
                                      {entry.zoneLimits.allowedZones.length} autorisée(s)
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-neutral-500 text-xs">Tout le périmètre urbain</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-3 sm:p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Quick Toggle On/Off */}
                              <button
                                type="button"
                                title={isEnabled ? 'Désactiver' : 'Activer'}
                                onClick={() => handleToggleEntry(entry)}
                                disabled={actionLoading}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                  isEnabled
                                    ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                }`}
                              >
                                {isEnabled ? 'Désactiver' : 'Activer'}
                              </button>

                              {/* Configure Limits */}
                              <button
                                type="button"
                                title="Réguler horaires & zones"
                                onClick={() => openEditModal(entry)}
                                className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-medium flex items-center gap-1 transition"
                              >
                                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                                <span className="hidden sm:inline">Réguler</span>
                              </button>

                              {/* Instant Emergency Suspension */}
                              <button
                                type="button"
                                title={isSuspended ? 'Lever la suspension' : 'Suspension d’urgence'}
                                onClick={() => openSuspensionModal(entry)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                                  isSuspended
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                                    : 'bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900'
                                }`}
                              >
                                <ShieldAlert className="w-3.5 h-3.5" />
                                <span>{isSuspended ? 'Lever' : 'Urgence'}</span>
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

      {/* ======================= TAB 2: FEATURE FLAGS ======================= */}
      {activeTab === 'flags' && (
        <div className="space-y-4">
          <div className="bg-neutral-900/60 p-4 rounded-xl border border-neutral-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Flag className="w-4 h-4 text-amber-400" />
                <span>Gestionnaire de Déploiement Progressif (Feature Flags)</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Activez ou désactivez les fonctionnalités stratégiques avec ciblage par ville ou pourcentage d’usagers (A/B testing).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(flagsData?.flags || []).map((flag) => {
              return (
                <div
                  key={flag.key}
                  className={`bg-neutral-900 border rounded-xl p-4 space-y-3 transition ${
                    flag.isEnabled ? 'border-neutral-800' : 'border-neutral-800/60 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
                          {flag.key}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          v{flag.version}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1.5">{flag.name}</h4>
                    </div>

                    {/* Switch button */}
                    <button
                      type="button"
                      onClick={() => handleToggleFlag(flag)}
                      disabled={actionLoading}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        flag.isEnabled ? 'bg-emerald-600' : 'bg-neutral-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          flag.isEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed">{flag.description}</p>

                  {/* Rollout slider & Percentage */}
                  <div className="pt-2 border-t border-neutral-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-400">Pourcentage de Déploiement :</span>
                      <span className="font-mono font-bold text-amber-400">
                        {flag.rolloutPercentage}% des passagers
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={flag.rolloutPercentage}
                        onChange={(e) => handleRolloutChange(flag, parseInt(e.target.value, 10))}
                        className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Target Cities */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-neutral-400">Villes ciblées :</span>
                    <span className="text-neutral-300 font-medium">
                      {flag.targetCities.length === 0 ? (
                        <span className="text-emerald-400">Toutes les villes congolaises</span>
                      ) : (
                        flag.targetCities.map((c) => c.toUpperCase()).join(', ')
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================= TAB 3: SNAPSHOTS & ROLLBACK ======================= */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-neutral-900/60 p-4 rounded-xl border border-neutral-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Historique Immuable & Restauration en 1-Clic</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Chaque changement de matrice ou de drapeau capture un instantané complet. Vous pouvez restaurer n'importe quel état passé en un clic avec justification obligatoire.
            </p>
          </div>

          <div className="space-y-3">
            {(historyData?.snapshots || []).map((snapshot, idx) => {
              const dateFormatted = new Date(snapshot.timestamp).toLocaleString('fr-FR', {
                dateStyle: 'medium',
                timeStyle: 'medium',
              });

              return (
                <div
                  key={snapshot.id}
                  className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-neutral-700 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-neutral-400">
                        {dateFormatted}
                      </span>
                      {idx === 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-950 text-emerald-400 border border-emerald-800">
                          ÉTAT COURANT
                        </span>
                      )}
                      <span className="text-xs text-amber-400/80 font-medium">
                        par {snapshot.adminName}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{snapshot.description}</h4>
                    <p className="text-xs text-neutral-400">
                      <span className="font-semibold text-neutral-300">Motif :</span> {snapshot.reason}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {idx !== 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setRollbackModalSnapshot(snapshot);
                          setRollbackReason(`Restauration vers l'état du ${dateFormatted}`);
                        }}
                        className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restaurer cet état</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================= MODAL: EMERGENCY SUSPENSION ======================= */}
      {suspensionModalEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-neutral-900 border border-rose-800/80 rounded-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 border-b border-rose-950 pb-3">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {suspensionModalEntry.suspension.isSuspended
                    ? 'Lever la Suspension d’Urgence'
                    : 'Suspension d’Urgence Immédiate'}
                </h3>
                <p className="text-xs text-rose-300">
                  {suspensionModalEntry.serviceName} à {suspensionModalEntry.cityName}
                </p>
              </div>
            </div>

            {suspensionModalEntry.suspension.isSuspended ? (
              <div className="space-y-4 text-xs text-neutral-300">
                <p>
                  Ce service est actuellement suspendu avec le message suivant pour les passagers :
                </p>
                <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 italic text-neutral-400">
                  "{suspensionModalEntry.suspension.userMessage}"
                </div>
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">
                    Motif de levée de suspension :
                  </label>
                  <input
                    type="text"
                    value={suspensionReason}
                    onChange={(e) => setSuspensionReason(e.target.value)}
                    placeholder="Ex: Fin des intempéries, réouverture de la voie par la police"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-neutral-200 mb-1">
                    1. Justification Administrative (Audit Interne) : *
                  </label>
                  <input
                    type="text"
                    value={suspensionReason}
                    onChange={(e) => setSuspensionReason(e.target.value)}
                    placeholder="Ex: Arrêté préfectoral n°14 / Fortes pluies et RN1 impraticable"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-200 mb-1">
                    2. Message Public Affiché aux Passagers (Application & Web) : *
                  </label>
                  <textarea
                    rows={3}
                    value={suspensionUserMessage}
                    onChange={(e) => setSuspensionUserMessage(e.target.value)}
                    placeholder="Ex: Le service est temporairement interrompu suite à des inondations sur le boulevard. Nos équipes interviennent pour rétablir la circulation."
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white leading-relaxed"
                  />
                  <span className="text-[11px] text-neutral-400">
                    Ce message s'affichera immédiatement sur la page d'accueil et bloquera les réservations.
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setSuspensionModalEntry(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-lg"
              >
                Annuler
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() =>
                  handleSubmitSuspension(!suspensionModalEntry.suspension.isSuspended)
                }
                className={`px-4 py-2 text-xs font-bold rounded-lg shadow transition ${
                  suspensionModalEntry.suspension.isSuspended
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                }`}
              >
                {actionLoading
                  ? 'Exécution...'
                  : suspensionModalEntry.suspension.isSuspended
                  ? 'Confirmer la Levée'
                  : 'Déclencher la Suspension Immédiate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL: ADVANCED RULES EDIT ======================= */}
      {editModalEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Régulation des Horaires & Zones</h3>
                <p className="text-xs text-neutral-400">
                  {editModalEntry.serviceName} à {editModalEntry.cityName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditModalEntry(null)}
                className="text-neutral-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Active Time Window */}
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-200 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Plage Horaire Autorisée (Couvre-feu / Service de Nuit)</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={editTimeWindowEnabled}
                    onChange={(e) => setEditTimeWindowEnabled(e.target.checked)}
                    className="accent-amber-500 w-4 h-4"
                  />
                </div>

                {editTimeWindowEnabled && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">
                        Heure de Début (HH:mm)
                      </label>
                      <input
                        type="time"
                        value={editStartTime}
                        onChange={(e) => setEditStartTime(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">
                        Heure de Fin (HH:mm)
                      </label>
                      <input
                        type="time"
                        value={editEndTime}
                        onChange={(e) => setEditEndTime(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Zone Limits */}
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-200 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-400" />
                    <span>Restrictions Géographiques (Communes & Artères)</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={editZoneLimitsEnabled}
                    onChange={(e) => setEditZoneLimitsEnabled(e.target.checked)}
                    className="accent-amber-500 w-4 h-4"
                  />
                </div>

                {editZoneLimitsEnabled && (
                  <div className="space-y-2 pt-2">
                    <div>
                      <label className="text-[11px] text-rose-400 block mb-1">
                        Zones Interdites (séparées par une virgule)
                      </label>
                      <input
                        type="text"
                        value={editRestrictedZones}
                        onChange={(e) => setEditRestrictedZones(e.target.value)}
                        placeholder="Ex: Gombe - Boulevard du 30 Juin, Zone Présidentielle"
                        className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-emerald-400 block mb-1">
                        Zones Autorisées (optionnel, laissez vide pour toutes les autres)
                      </label>
                      <input
                        type="text"
                        value={editAllowedZones}
                        onChange={(e) => setEditAllowedZones(e.target.value)}
                        placeholder="Ex: Kalamu, Limete, Ngaliema"
                        className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Reason */}
              <div>
                <label className="block font-semibold text-neutral-200 mb-1">
                  Justification de la Régulation : *
                </label>
                <input
                  type="text"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="Ex: Mise en conformité arrêté gouvernorat"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setEditModalEntry(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-lg"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleSubmitEdit}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-lg shadow"
              >
                {actionLoading ? 'Enregistrement...' : 'Enregistrer les Règles'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL: ROLLBACK CONFIRMATION ======================= */}
      {rollbackModalSnapshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-neutral-900 border border-rose-800/80 rounded-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 border-b border-rose-950 pb-3">
              <RotateCcw className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="text-base font-black text-white">Confirmer le Rollback en 1-Clic</h3>
                <p className="text-xs text-rose-300">
                  Restauration complète de l'état système précédent
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-neutral-300">
              <p>
                Vous êtes sur le point de restaurer l'état système du{' '}
                <span className="font-bold text-white">
                  {new Date(rollbackModalSnapshot.timestamp).toLocaleString('fr-FR')}
                </span>
                .
              </p>
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-1">
                <div className="font-semibold text-amber-400">{rollbackModalSnapshot.description}</div>
                <div className="text-neutral-500">Auteur initial : {rollbackModalSnapshot.adminName}</div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-200 mb-1">
                  Motif obligatoire de la restauration : *
                </label>
                <textarea
                  rows={2}
                  value={rollbackReason}
                  onChange={(e) => setRollbackReason(e.target.value)}
                  placeholder="Ex: Correction d'une régulation erronée suite à validation du cabinet"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setRollbackModalSnapshot(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-lg"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleRollback}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow"
              >
                {actionLoading ? 'Restauration en cours...' : 'Confirmer et Restaurer Immédiatement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL: NEW FEATURE FLAG ======================= */}
      {newFlagModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Nouveau Feature Flag</h3>
                <p className="text-xs text-neutral-400">Déploiement progressif & ciblage</p>
              </div>
              <button
                type="button"
                onClick={() => setNewFlagModalOpen(false)}
                className="text-neutral-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  Clé Technique (snake_case) : *
                </label>
                <input
                  type="text"
                  value={flagKey}
                  onChange={(e) => setFlagKey(e.target.value)}
                  placeholder="ex: starlink_bus_wifi"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  Nom Fonctionnel : *
                </label>
                <input
                  type="text"
                  value={flagName}
                  onChange={(e) => setFlagName(e.target.value)}
                  placeholder="ex: Option Wi-Fi Satellite Starlink"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  Description Détaillée : *
                </label>
                <textarea
                  rows={2}
                  value={flagDesc}
                  onChange={(e) => setFlagDesc(e.target.value)}
                  placeholder="Décrivez l'impact pour les utilisateurs..."
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  Pourcentage initial de déploiement : ({flagRollout}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={flagRollout}
                  onChange={(e) => setFlagRollout(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  Villes Cibles (optionnel, vide = toutes les villes) :
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {CITIES_LIST.map((city) => {
                    const isChecked = flagCities.includes(city.id);
                    return (
                      <button
                        type="button"
                        key={city.id}
                        onClick={() => {
                          setFlagCities((prev) =>
                            isChecked ? prev.filter((c) => c !== city.id) : [...prev, city.id]
                          );
                        }}
                        className={`px-2.5 py-1 text-xs rounded-lg font-medium border transition ${
                          isChecked
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                        }`}
                      >
                        {city.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  Motif Administratif : *
                </label>
                <input
                  type="text"
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  placeholder="Justification pour l'audit..."
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setNewFlagModalOpen(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-lg"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleSubmitNewFlag}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-lg shadow"
              >
                {actionLoading ? 'Création...' : 'Créer le Feature Flag'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

