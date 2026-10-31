'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  Star,
  Car,
  Smartphone,
  MapPin,
  Award,
  UserX,
  UserCheck,
  RefreshCw,
  Loader2,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { DriverAccount, KycReviewQueueItem, VehicleType, DriverKycDocument } from '@/types';
import { KycReviewModal } from '@/components/admin/drivers/KycReviewModal';
import { DriverDetailDrawer } from '@/components/admin/drivers/DriverDetailDrawer';
import { DriverEditModal } from '@/components/admin/drivers/DriverEditModal';
import { DocumentZoomModal } from '@/components/admin/drivers/DocumentZoomModal';
import { UserActionModal } from '@/components/admin/users/UserActionModal';
import { OptimisticConflictModal } from '@/components/admin/crud/OptimisticConflictModal';

export default function AdminDriversPage() {
  const [activeTab, setActiveTab] = useState<'QUEUE' | 'ACTIVE' | 'TRASH'>('QUEUE');

  // KYC Queue State
  const [queueItems, setQueueItems] = useState<KycReviewQueueItem[]>([]);
  const [queueLoading, setQueueLoading] = useState(true);
  const [queueFilterVehicle, setQueueFilterVehicle] = useState<'ALL' | 'MOTO' | 'CAR'>('ALL');
  const [queueSearch, setQueueSearch] = useState('');
  const [selectedQueueItem, setSelectedQueueItem] = useState<KycReviewQueueItem | null>(null);

  // Active Drivers State
  const [drivers, setDrivers] = useState<DriverAccount[]>([]);
  const [driversLoading, setDriversLoading] = useState(true);
  const [driverSearch, setDriverSearch] = useState('');
  const [driverStatusFilter, setDriverStatusFilter] = useState('ALL');
  const [driverCityFilter, setDriverCityFilter] = useState('ALL');
  const [driverVehicleFilter, setDriverVehicleFilter] = useState('ALL');

  // Trash Drivers State
  const [trashDrivers, setTrashDrivers] = useState<DriverAccount[]>([]);
  const [trashLoading, setTrashLoading] = useState(false);

  // Modals and Drawers
  const [inspectingDoc, setInspectingDoc] = useState<{
    doc: DriverKycDocument;
    driverName: string;
  } | null>(null);
  const [drawerDriver, setDrawerDriver] = useState<DriverAccount | null>(null);
  const [editingDriver, setEditingDriver] = useState<DriverAccount | null>(null);

  // Action Confirmation Modal
  const [actionModalConfig, setActionModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    targetName: string;
    actionType: 'SUSPEND' | 'BAN' | 'DELETE' | 'RESTORE';
    onConfirm: (reason: string) => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    targetName: '',
    actionType: 'SUSPEND',
    onConfirm: async () => {},
  });

  // Optimistic Locking Conflict Modal
  const [conflictModalData, setConflictModalData] = useState<{
    isOpen: boolean;
    serverVersion: number;
    clientVersion: number;
  }>({ isOpen: false, serverVersion: 1, clientVersion: 1 });

  // Feedback Toasts
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(
    null
  );

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  // 1. Fetch KYC Queue
  const fetchQueue = useCallback(async () => {
    setQueueLoading(true);
    try {
      const res = await fetch('/api/admin/drivers/verification');
      const data = await res.json();
      if (res.ok) {
        setQueueItems(data.queue || data.items || []);
      }
    } catch {
      showFeedback('Erreur lors du chargement de la file KYC', 'error');
    } finally {
      setQueueLoading(false);
    }
  }, []);

  // 2. Fetch Active Drivers
  const fetchDrivers = useCallback(async () => {
    setDriversLoading(true);
    try {
      const params = new URLSearchParams();
      if (driverSearch) params.set('search', driverSearch);
      if (driverStatusFilter !== 'ALL') params.set('status', driverStatusFilter);
      if (driverCityFilter !== 'ALL') params.set('city', driverCityFilter);
      if (driverVehicleFilter !== 'ALL') params.set('vehicleType', driverVehicleFilter);

      const res = await fetch(`/api/admin/drivers?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setDrivers(data.data || data.items || []);
      }
    } catch {
      showFeedback('Erreur lors du chargement des chauffeurs', 'error');
    } finally {
      setDriversLoading(false);
    }
  }, [driverSearch, driverStatusFilter, driverCityFilter, driverVehicleFilter]);

  // 3. Fetch Trash
  const fetchTrash = useCallback(async () => {
    setTrashLoading(true);
    try {
      const res = await fetch('/api/admin/drivers?trash=true');
      const data = await res.json();
      if (res.ok) {
        setTrashDrivers(data.data || data.items || []);
      }
    } catch {
      showFeedback('Erreur lors du chargement de la corbeille', 'error');
    } finally {
      setTrashLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
    fetchDrivers();
  }, [fetchQueue, fetchDrivers]);

  useEffect(() => {
    if (activeTab === 'TRASH') {
      fetchTrash();
    }
  }, [activeTab, fetchTrash]);

  // Filtered Queue
  const filteredQueue = queueItems.filter((item) => {
    const matchesVehicle =
      queueFilterVehicle === 'ALL' || item.vehicleType === queueFilterVehicle;
    const matchesSearch =
      !queueSearch ||
      item.applicantName.toLowerCase().includes(queueSearch.toLowerCase()) ||
      item.phone.includes(queueSearch) ||
      item.vehiclePlate.toLowerCase().includes(queueSearch.toLowerCase());
    return matchesVehicle && matchesSearch;
  });

  // SLA Metrics
  const slaOnTrackCount = queueItems.filter((i) => i.slaStatus === 'ON_TRACK').length;
  const slaWarningCount = queueItems.filter((i) => i.slaStatus === 'WARNING').length;
  const slaBreachedCount = queueItems.filter((i) => i.slaStatus === 'BREACHED').length;

  // Actions
  const handleHelmetToggle = async (driver: DriverAccount) => {
    try {
      const newHelmetState = !driver.hasPassengerHelmet;
      const res = await fetch(`/api/admin/drivers/${driver.id}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SET_HELMET',
          hasPassengerHelmet: newHelmetState,
          reason: `Mise à jour conformité casque passager : ${newHelmetState ? 'Fourni' : 'Non fourni'}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors du changement de casque');

      showFeedback(
        `Conformité casque passager mise à jour : ${newHelmetState ? 'Conforme' : 'Non fourni'}`
      );
      fetchDrivers();
      if (drawerDriver && drawerDriver.id === driver.id) {
        setDrawerDriver(data.driver);
      }
    } catch (err: any) {
      showFeedback(err?.message || 'Erreur', 'error');
    }
  };

  const handleSuspendClick = (driver: DriverAccount) => {
    const isSuspended = driver.status === 'SUSPENDED';
    setActionModalConfig({
      isOpen: true,
      title: isSuspended ? 'Réactiver le compte chauffeur' : 'Suspendre le compte chauffeur',
      description: isSuspended
        ? `Le chauffeur ${driver.name} pourra à nouveau recevoir et effectuer des courses Transnumerica.`
        : `Le chauffeur ${driver.name} sera immédiatement déconnecté et ses courses en attente seront annulées.`,
      targetName: driver.name,
      actionType: 'SUSPEND',
      onConfirm: async (reason: string) => {
        const res = await fetch(`/api/admin/drivers/${driver.id}/actions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: isSuspended ? 'REINSTATE' : 'SUSPEND',
            reason,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erreur lors du changement de statut');

        showFeedback(
          isSuspended
            ? `Compte de ${driver.name} réactivé avec succès.`
            : `Compte de ${driver.name} suspendu.`
        );
        fetchDrivers();
        if (drawerDriver && drawerDriver.id === driver.id) {
          setDrawerDriver(data.driver);
        }
      },
    });
  };

  const handleDeleteClick = (driver: DriverAccount) => {
    setActionModalConfig({
      isOpen: true,
      title: 'Mettre le compte chauffeur en corbeille',
      description: `Le profil de ${driver.name} sera déplacé dans la corbeille. Ses accès seront suspendus sans perte d’historique.`,
      targetName: driver.name,
      actionType: 'DELETE',
      onConfirm: async (reason: string) => {
        const res = await fetch(`/api/admin/drivers/${driver.id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erreur lors de la suppression');

        showFeedback(`Chauffeur ${driver.name} déplacé dans la corbeille.`);
        if (drawerDriver && drawerDriver.id === driver.id) {
          setDrawerDriver(null);
        }
        fetchDrivers();
        if (activeTab === 'TRASH') fetchTrash();
      },
    });
  };

  const handleRestoreClick = (driver: DriverAccount) => {
    setActionModalConfig({
      isOpen: true,
      title: 'Restaurer le chauffeur depuis la corbeille',
      description: `Le compte de ${driver.name} sera restauré dans l’annuaire actif.`,
      targetName: driver.name,
      actionType: 'RESTORE',
      onConfirm: async (reason: string) => {
        const res = await fetch(`/api/admin/drivers/${driver.id}/restore`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erreur lors de la restauration');

        showFeedback(`Chauffeur ${driver.name} restauré avec succès.`);
        fetchTrash();
        fetchDrivers();
      },
    });
  };

  const handleBadgeToggle = async (
    driver: DriverAccount,
    badge: string,
    action: 'ADD' | 'REMOVE'
  ) => {
    try {
      const currentBadges = driver.badges || [];
      const updatedBadges =
        action === 'ADD'
          ? Array.from(new Set([...currentBadges, badge]))
          : currentBadges.filter((b) => b !== badge);

      const res = await fetch(`/api/admin/drivers/${driver.id}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_BADGES',
          badges: updatedBadges,
          reason: `Gestion manuelle des badges : ${action === 'ADD' ? 'Ajout' : 'Retrait'} de "${badge}"`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la modification du badge');

      showFeedback(`Badge "${badge}" ${action === 'ADD' ? 'ajouté' : 'retiré'}.`);
      fetchDrivers();
      if (drawerDriver && drawerDriver.id === driver.id) {
        setDrawerDriver(data.driver);
      }
    } catch (err: any) {
      showFeedback(err?.message || 'Erreur', 'error');
    }
  };

  const formatCDF = (amount: number) => {
    return new Intl.NumberFormat('fr-CD').format(amount) + ' FC';
  };

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
            <Car className="w-6 h-6 text-brand-primary" />
            Gestion des Chauffeurs & File KYC
          </h1>
          <p className="text-2xs sm:text-xs text-neutral-400 mt-0.5">
            Validation des dossiers, conformité casque passager, SLA de traitement et suivi des courses.
          </p>
        </div>

        {/* Global Export Button */}
        <a
          href="/api/admin/drivers/export"
          download="transnumerica-chauffeurs.csv"
          className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-brand-primary" />
          Exporter CSV (RFC 4180)
        </a>
      </div>

      {/* SLA Metric Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-3xl bg-[#0D1E32] border border-white/10">
          <span className="text-3xs font-bold text-neutral-400 uppercase tracking-wider block">
            File KYC en attente
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-white">{queueItems.length}</span>
            <span className="text-2xs text-neutral-400">dossiers</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[#0D1E32] border border-emerald-500/20">
          <span className="text-3xs font-bold text-emerald-400 uppercase tracking-wider block flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            SLA Dans les temps
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-300">{slaOnTrackCount}</span>
            <span className="text-2xs text-emerald-500/80">&gt; 4h restantes</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[#0D1E32] border border-amber-500/20">
          <span className="text-3xs font-bold text-amber-400 uppercase tracking-wider block flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            SLA Attention (&lt; 4h)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-amber-300">{slaWarningCount}</span>
            <span className="text-2xs text-amber-500/80">urgent</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[#0D1E32] border border-rose-500/20">
          <span className="text-3xs font-bold text-rose-400 uppercase tracking-wider block flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            SLA Dépassé (&gt; 24h)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-rose-300">{slaBreachedCount}</span>
            <span className="text-2xs text-rose-500/80">critique</span>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('QUEUE')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'QUEUE'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          File d&apos;attente KYC
          {queueItems.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-3xs font-mono bg-brand-primary/20 text-brand-primary font-bold">
              {queueItems.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ACTIVE')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'ACTIVE'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Car className="w-4 h-4" />
          Annuaire des Chauffeurs
          <span className="px-2 py-0.5 rounded-full text-3xs font-mono bg-white/10 text-neutral-300">
            {drivers.length}
          </span>
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
          {trashDrivers.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-3xs font-mono bg-rose-500/20 text-rose-300">
              {trashDrivers.length}
            </span>
          )}
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: KYC QUEUE */}
      {/* ============================================================ */}
      {activeTab === 'QUEUE' && (
        <div className="space-y-4">
          {/* Queue Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={queueSearch}
                onChange={(e) => setQueueSearch(e.target.value)}
                placeholder="Rechercher par nom, téléphone, plaque..."
                className="w-full bg-[#0D1E32] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xs text-neutral-400">Catégorie :</span>
              {(['ALL', 'MOTO', 'CAR'] as const).map((vt) => (
                <button
                  key={vt}
                  type="button"
                  onClick={() => setQueueFilterVehicle(vt)}
                  className={`px-3 py-1.5 rounded-xl text-2xs font-bold transition-all ${
                    queueFilterVehicle === vt
                      ? 'bg-brand-primary text-black'
                      : 'bg-white/5 text-neutral-400 hover:text-white border border-white/10'
                  }`}
                >
                  {vt === 'ALL' ? 'Tous' : vt === 'MOTO' ? 'Moto' : 'Voiture / Taxi'}
                </button>
              ))}
              <button
                type="button"
                onClick={fetchQueue}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10"
                title="Actualiser la file"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Queue Items Grid */}
          {queueLoading ? (
            <div className="p-12 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
              Chargement de la file d&apos;attente KYC...
            </div>
          ) : filteredQueue.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#0D1E32] border border-white/10 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">Aucun dossier en attente</h3>
              <p className="text-2xs text-neutral-400">
                Tous les dossiers chauffeurs ont été traités dans les délais impartis.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredQueue.map((item) => {
                const isBreached = item.slaStatus === 'BREACHED';
                const isWarning = item.slaStatus === 'WARNING';
                const hoursLeft = Math.floor(Math.max(0, item.slaMinutesRemaining) / 60);
                const minsLeft = Math.max(0, item.slaMinutesRemaining) % 60;

                return (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 rounded-3xl bg-[#0D1E32] border border-white/10 hover:border-brand-primary/40 transition-all space-y-4 shadow-xl"
                  >
                    {/* Top line with SLA badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-3xs font-black uppercase bg-white/10 text-neutral-300">
                            {item.vehicleType}
                          </span>
                          <h3 className="text-base font-bold text-white">{item.applicantName}</h3>
                        </div>
                        <p className="text-2xs text-neutral-400 font-mono mt-0.5">{item.phone}</p>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-2xs font-bold flex items-center gap-1.5 border ${
                          isBreached
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : isWarning
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {isBreached ? 'SLA DÉPASSÉ' : `SLA: ${hoursLeft}h ${minsLeft}m`}
                      </span>
                    </div>

                    {/* Vehicle details & Cooperative */}
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-black/30 border border-white/5 text-2xs">
                      <div>
                        <span className="text-3xs text-neutral-500 block">Véhicule</span>
                        <span className="font-semibold text-white">{item.vehicleModel}</span>
                      </div>
                      <div>
                        <span className="text-3xs text-neutral-500 block">Plaque d&apos;immatriculation</span>
                        <span className="font-mono font-bold text-amber-300">{item.vehiclePlate}</span>
                      </div>
                      <div>
                        <span className="text-3xs text-neutral-500 block">Coopérative</span>
                        <span className="text-neutral-300">{item.cooperative || 'Indépendant'}</span>
                      </div>
                      <div>
                        <span className="text-3xs text-neutral-500 block">Casque Passager</span>
                        <span className={item.hasPassengerHelmet ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                          {item.hasPassengerHelmet ? 'Fourni & Conforme' : 'Non fourni'}
                        </span>
                      </div>
                    </div>

                    {/* Document thumbnails quick action */}
                    <div className="space-y-1.5">
                      <span className="text-3xs uppercase tracking-wider text-neutral-400 block font-bold">
                        Pièces téléversées ({item.documents.length})
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {item.documents.map((doc) => (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() =>
                              setInspectingDoc({
                                doc,
                                driverName: item.applicantName,
                              })
                            }
                            className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-3xs font-medium border border-white/10 flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3 h-3 text-brand-primary" />
                            {doc.name.split('(')[0].trim()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Review CTA */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                      <span className="text-3xs text-neutral-400">
                        Déposé le {new Date(item.appliedAt).toLocaleDateString('fr-CD')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedQueueItem(item)}
                        className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-black text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-brand-primary/20"
                      >
                        Examiner le dossier
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: ACTIVE DRIVERS DIRECTORY */}
      {/* ============================================================ */}
      {activeTab === 'ACTIVE' && (
        <div className="space-y-4">
          {/* Directory Filter Bar */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={driverSearch}
                onChange={(e) => setDriverSearch(e.target.value)}
                placeholder="Rechercher par nom, téléphone, plaque, coop..."
                className="w-full bg-[#0D1E32] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={driverCityFilter}
                onChange={(e) => setDriverCityFilter(e.target.value)}
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
                value={driverStatusFilter}
                onChange={(e) => setDriverStatusFilter(e.target.value)}
                className="bg-[#0D1E32] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="ACTIVE">Actif</option>
                <option value="SUSPENDED">Suspendu</option>
              </select>

              <select
                value={driverVehicleFilter}
                onChange={(e) => setDriverVehicleFilter(e.target.value)}
                className="bg-[#0D1E32] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="ALL">Tous types</option>
                <option value="MOTO">Moto</option>
                <option value="CAR">Voiture / Taxi</option>
              </select>

              <button
                type="button"
                onClick={fetchDrivers}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10"
                title="Actualiser"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Directory Table */}
          <div className="bg-[#0D1E32] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-3xs uppercase tracking-wider text-neutral-400 font-bold">
                    <th className="py-3.5 px-4">Chauffeur</th>
                    <th className="py-3.5 px-4">Téléphone & Ville</th>
                    <th className="py-3.5 px-4">Véhicule & Plaque</th>
                    <th className="py-3.5 px-4 text-center">Casque Passager</th>
                    <th className="py-3.5 px-4 text-center">Note / Courses</th>
                    <th className="py-3.5 px-4 text-right">Solde CDF</th>
                    <th className="py-3.5 px-4 text-center">Statut</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs text-neutral-300">
                  {driversLoading ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-neutral-400">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto text-brand-primary mb-2" />
                        Chargement de l&apos;annuaire...
                      </td>
                    </tr>
                  ) : drivers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-neutral-400">
                        Aucun chauffeur correspondant aux filtres.
                      </td>
                    </tr>
                  ) : (
                    drivers.map((d) => {
                      const primaryVehicle = d.vehicles[0];
                      const isSuspended = d.status === 'SUSPENDED';

                      return (
                        <tr key={d.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white flex items-center gap-2">
                              {d.name}
                              {d.verificationStatus === 'VERIFIED' && (
                                <span title="Compte Vérifié">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {d.badges.map((b) => (
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
                            <div className="font-mono text-2xs text-white">{d.phone}</div>
                            <div className="text-3xs text-neutral-400">{d.city}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            {primaryVehicle ? (
                              <div>
                                <span className="font-semibold text-white block">
                                  {primaryVehicle.model}
                                </span>
                                <span className="font-mono text-3xs text-amber-300 font-bold">
                                  {primaryVehicle.plate}
                                </span>
                              </div>
                            ) : (
                              <span className="text-neutral-500 italic">Aucun</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleHelmetToggle(d)}
                              className={`px-2 py-0.5 rounded-full text-3xs font-bold border transition-all ${
                                d.hasPassengerHelmet
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                              }`}
                              title="Cliquer pour basculer la conformité casque"
                            >
                              {d.hasPassengerHelmet ? 'Conforme' : 'Non fourni'}
                            </button>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1 font-bold text-amber-400">
                              <Star className="w-3 h-3 fill-amber-400" />
                              {d.rating.toFixed(1)}
                            </div>
                            <div className="text-3xs text-neutral-400">{d.totalTrips} courses</div>
                          </td>

                          <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                            {formatCDF(d.earnings.balanceCDF)}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-3xs font-black uppercase border ${
                                isSuspended
                                  ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                                  : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                              }`}
                            >
                              {isSuspended ? 'Suspendu' : 'Actif'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setDrawerDriver(d)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-brand-primary/20 hover:text-brand-primary text-neutral-300 transition-colors"
                                title="Voir le profil complet"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingDriver(d)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 transition-colors"
                                title="Modifier"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSuspendClick(d)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isSuspended
                                    ? 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                                }`}
                                title={isSuspended ? 'Réactiver' : 'Suspendre'}
                              >
                                {isSuspended ? (
                                  <UserCheck className="w-4 h-4" />
                                ) : (
                                  <UserX className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteClick(d)}
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
      {/* TAB 3: TRASH (CORBEILLE) */}
      {/* ============================================================ */}
      {activeTab === 'TRASH' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-400">
              Chauffeurs supprimés (soft-delete). Ils n&apos;apparaissent plus dans l&apos;annuaire actif mais
              peuvent être restaurés à tout moment.
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
                    <th className="py-3.5 px-4">Chauffeur</th>
                    <th className="py-3.5 px-4">Téléphone</th>
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
                  ) : trashDrivers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-neutral-400">
                        La corbeille des chauffeurs est vide.
                      </td>
                    </tr>
                  ) : (
                    trashDrivers.map((d) => (
                      <tr key={d.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white">{d.name}</td>
                        <td className="py-3.5 px-4 font-mono text-2xs text-neutral-300">{d.phone}</td>
                        <td className="py-3.5 px-4 text-neutral-400">
                          {d.deletedAt ? new Date(d.deletedAt).toLocaleString('fr-CD') : '—'}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-2xs text-brand-primary">
                          {d.deletedBy || 'Admin'}
                        </td>
                        <td className="py-3.5 px-4 text-2xs text-neutral-400 italic">
                          {d.deletionReason || 'Non spécifié'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleRestoreClick(d)}
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

      {/* KYC Review Modal */}
      {selectedQueueItem && (
        <KycReviewModal
          isOpen={!!selectedQueueItem}
          onClose={() => setSelectedQueueItem(null)}
          item={selectedQueueItem}
          onSuccess={() => {
            showFeedback('Décision KYC enregistrée avec succès.');
            fetchQueue();
            fetchDrivers();
          }}
        />
      )}

      {/* Driver Detail Drawer */}
      {drawerDriver && (
        <DriverDetailDrawer
          isOpen={!!drawerDriver}
          onClose={() => setDrawerDriver(null)}
          driver={drawerDriver}
          onEdit={(d) => {
            setDrawerDriver(null);
            setEditingDriver(d);
          }}
          onSuspendToggle={(d) => handleSuspendClick(d)}
          onHelmetToggle={(d) => handleHelmetToggle(d)}
          onDeleteToggle={(d) => handleDeleteClick(d)}
          onBadgeToggle={(d, badge, action) => handleBadgeToggle(d, badge, action)}
        />
      )}

      {/* Driver Edit Modal */}
      {editingDriver && (
        <DriverEditModal
          isOpen={!!editingDriver}
          onClose={() => setEditingDriver(null)}
          driver={editingDriver}
          onSuccess={() => {
            showFeedback('Profil chauffeur mis à jour.');
            fetchDrivers();
          }}
          onConflict={(serverVersion) => {
            setConflictModalData({
              isOpen: true,
              serverVersion,
              clientVersion: editingDriver.version,
            });
          }}
        />
      )}

      {/* Standalone Document Zoom Modal */}
      {inspectingDoc && (
        <DocumentZoomModal
          isOpen={!!inspectingDoc}
          onClose={() => setInspectingDoc(null)}
          document={inspectingDoc.doc}
          driverName={inspectingDoc.driverName}
        />
      )}

      {/* User / Driver Action Confirmation Modal */}
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
          setEditingDriver(null);
          fetchDrivers();
        }}
      />
    </div>
  );
}
