'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  ShieldCheck,
  UserPlus,
  KeyRound,
  Download,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Award,
  Layers,
  Laptop,
  Lock,
  UserX,
  UserCheck,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { PassengerAccount, StaffAccount, UserRole } from '@/types';
import { PassengerDetailDrawer } from '@/components/admin/users/PassengerDetailDrawer';
import { ViewAsUserModal } from '@/components/admin/users/ViewAsUserModal';
import { PassengerFormModal } from '@/components/admin/users/PassengerFormModal';
import { StaffDetailDrawer } from '@/components/admin/users/StaffDetailDrawer';
import { StaffFormModal } from '@/components/admin/users/StaffFormModal';
import { UserActionModal } from '@/components/admin/users/UserActionModal';
import { PermissionMatrixEditor } from '@/components/admin/users/PermissionMatrixEditor';
import { OptimisticConflictModal } from '@/components/admin/crud/OptimisticConflictModal';

export default function AdminUsersPage() {
  const [activeMainTab, setActiveMainTab] = useState<'PASSENGERS' | 'STAFF' | 'MATRIX'>('PASSENGERS');

  // Passenger state
  const [passengers, setPassengers] = useState<PassengerAccount[]>([]);
  const [passengerSearch, setPassengerSearch] = useState('');
  const [passengerStatusFilter, setPassengerStatusFilter] = useState('ALL');
  const [passengerCityFilter, setPassengerCityFilter] = useState('ALL');
  const [passengerTrashMode, setPassengerTrashMode] = useState(false);
  const [passengerLoading, setPassengerLoading] = useState(true);
  const [selectedPassenger, setSelectedPassenger] = useState<PassengerAccount | null>(null);
  const [passengerToEdit, setPassengerToEdit] = useState<PassengerAccount | null>(null);
  const [isPassengerFormOpen, setIsPassengerFormOpen] = useState(false);
  const [impersonatePassenger, setImpersonatePassenger] = useState<PassengerAccount | null>(null);
  const [isViewAsUserOpen, setIsViewAsUserOpen] = useState(false);

  // Staff state
  const [staffList, setStaffList] = useState<StaffAccount[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffTrashMode, setStaffTrashMode] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffAccount | null>(null);
  const [staffToEdit, setStaffToEdit] = useState<StaffAccount | null>(null);
  const [isStaffFormOpen, setIsStaffFormOpen] = useState(false);

  // Common modals state
  const [conflictModalData, setConflictModalData] = useState<{
    isOpen: boolean;
    serverVersion: number;
    clientVersion: number;
    message?: string;
  }>({ isOpen: false, serverVersion: 1, clientVersion: 1 });

  const [actionModalConfig, setActionModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    targetName: string;
    actionType: 'SUSPEND' | 'BAN' | 'DELETE' | 'RESET_SESSIONS' | 'DISABLE' | 'FORCE_2FA' | 'RESTORE';
    onConfirm: (reason: string) => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    targetName: '',
    actionType: 'SUSPEND',
    onConfirm: async () => {},
  });

  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(
    null
  );

  // Current session admin info
  const [currentAdminRole, setCurrentAdminRole] = useState<UserRole>('SUPER_ADMIN');

  // 1. Fetch Passengers
  const fetchPassengers = useCallback(async () => {
    setPassengerLoading(true);
    try {
      const params = new URLSearchParams();
      if (passengerSearch) params.set('search', passengerSearch);
      if (passengerStatusFilter !== 'ALL') params.set('status', passengerStatusFilter);
      if (passengerCityFilter !== 'ALL') params.set('city', passengerCityFilter);
      if (passengerTrashMode) params.set('trash', 'true');
      params.set('limit', '50');

      const res = await fetch(`/api/admin/users/passengers?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setPassengers(json.data || []);
      }
    } catch {
      // Ignored
    } finally {
      setPassengerLoading(false);
    }
  }, [passengerSearch, passengerStatusFilter, passengerCityFilter, passengerTrashMode]);

  // 2. Fetch Staff
  const fetchStaff = useCallback(async () => {
    setStaffLoading(true);
    try {
      const res = await fetch(`/api/admin/users/staff?trash=${staffTrashMode}`);
      if (res.ok) {
        const json = await res.json();
        setStaffList(json.staff || []);
      }
    } catch {
      // Ignored
    } finally {
      setStaffLoading(false);
    }
  }, [staffTrashMode]);

  useEffect(() => {
    fetchPassengers();
  }, [fetchPassengers]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Handle View as User
  const handleOpenViewAsUser = async (passenger: PassengerAccount) => {
    try {
      const res = await fetch(`/api/admin/users/passengers/${passenger.id}/impersonate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Consultation auditée profil passager' }),
      });
      if (res.ok) {
        const data = await res.json();
        setImpersonatePassenger(data.snapshot || passenger);
        setIsViewAsUserOpen(true);
      }
    } catch {
      setFeedback({ message: 'Erreur lors de l’audit de simulation.', type: 'error' });
    }
  };

  // Passenger actions handler
  const handlePassengerAction = (
    action: 'SUSPEND' | 'BAN' | 'ACTIVATE' | 'DELETE' | 'RESTORE' | 'RESET_SESSIONS',
    p: PassengerAccount
  ) => {
    const titles: Record<string, string> = {
      SUSPEND: 'Suspendre le compte passager',
      BAN: 'Bannir définitivement le passager',
      ACTIVATE: 'Réactiver le compte passager',
      DELETE: 'Déplacer dans la corbeille',
      RESTORE: 'Restaurer le compte passager',
      RESET_SESSIONS: 'Réinitialiser toutes les sessions mobiles',
    };

    const descriptions: Record<string, string> = {
      SUSPEND: 'Le passager ne pourra plus réserver de courses tant que le compte sera suspendu.',
      BAN: 'Interdiction définitive d’accès aux services Transnumerica en RDC.',
      ACTIVATE: 'Rétablissement immédiat des privilèges d’accès et réservation.',
      DELETE: 'Suppression logique réversible avec archivage du motif légal.',
      RESTORE: 'Rétablissement du passager dans la liste active.',
      RESET_SESSIONS: 'Toutes les applications connectées avec ce numéro devront se reconnecter.',
    };

    setActionModalConfig({
      isOpen: true,
      title: titles[action] || 'Action sur le passager',
      description: descriptions[action] || '',
      targetName: `${p.name} (${p.phone})`,
      actionType: action as any,
      onConfirm: async (reason: string) => {
        let endpoint = `/api/admin/users/passengers/${p.id}`;
        let method = 'PATCH';
        let body: any = { action, reason, version: p.version };

        if (action === 'DELETE') {
          method = 'DELETE';
          body = { reason };
        } else if (action === 'RESTORE') {
          endpoint = `/api/admin/users/passengers/${p.id}/restore`;
          method = 'POST';
          body = { reason };
        } else if (action === 'RESET_SESSIONS') {
          endpoint = `/api/admin/users/passengers/${p.id}/sessions/reset`;
          method = 'POST';
          body = { reason };
        }

        const res = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        const data = await res.json();
        if (!res.ok) {
          if (res.status === 409) {
            setConflictModalData({
              isOpen: true,
              clientVersion: p.version,
              serverVersion: data.currentVersion || p.version + 1,
              message: data.error,
            });
            throw new Error(data.error);
          }
          throw new Error(data.error || 'Erreur lors de l’exécution.');
        }

        setFeedback({ message: 'Action exécutée et auditée avec succès.', type: 'success' });
        setSelectedPassenger(null);
        fetchPassengers();
      },
    });
  };

  // Staff actions handler
  const handleRevokeStaffSession = async (staffId: string, sessionId?: string) => {
    setActionModalConfig({
      isOpen: true,
      title: sessionId ? 'Révoquer la session active' : 'Révoquer toutes les sessions',
      description: 'Déconnecte immédiatement l’agent sur ce terminal.',
      targetName: `Agent #${staffId}`,
      actionType: 'RESET_SESSIONS',
      onConfirm: async (reason: string) => {
        const url = sessionId
          ? `/api/admin/users/staff/${staffId}/sessions?sessionId=${sessionId}`
          : `/api/admin/users/staff/${staffId}/sessions`;
        const res = await fetch(url, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason }),
        });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || 'Erreur lors de la révocation');
        }
        setFeedback({ message: 'Session(s) révoquée(s) avec succès.', type: 'success' });
        fetchStaff();
        if (selectedStaff) {
          setSelectedStaff((prev) => (prev ? { ...prev, activeSessions: [] } : null));
        }
      },
    });
  };

  const handleToggleStaffStatus = (staff: StaffAccount, newStatus: 'ACTIVE' | 'DISABLED') => {
    setActionModalConfig({
      isOpen: true,
      title: newStatus === 'DISABLED' ? 'Désactiver le compte collaborateur' : 'Réactiver le compte',
      description:
        newStatus === 'DISABLED'
          ? 'L’agent perdra immédiatement l’accès à toutes les consoles de gestion.'
          : 'Rétablissement des droits d’accès.',
      targetName: `${staff.name} (${staff.email})`,
      actionType: newStatus === 'DISABLED' ? 'DISABLE' : 'FORCE_2FA',
      onConfirm: async (reason: string) => {
        const res = await fetch(`/api/admin/users/staff/${staff.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: newStatus === 'DISABLED' ? 'DISABLE' : 'ENABLE',
            reason,
            version: staff.version,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Erreur lors de la mise à jour');
        }

        setFeedback({ message: 'Statut du compte mis à jour.', type: 'success' });
        setSelectedStaff(null);
        fetchStaff();
      },
    });
  };

  const handleDeleteStaff = (staff: StaffAccount) => {
    setActionModalConfig({
      isOpen: true,
      title: 'Supprimer le compte collaborateur',
      description: 'Désactivation et archivage définitif du compte par le Super Administrateur.',
      targetName: `${staff.name} (${staff.email})`,
      actionType: 'DELETE',
      onConfirm: async (reason: string) => {
        const res = await fetch(`/api/admin/users/staff/${staff.id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Erreur lors de la suppression');
        }

        setFeedback({ message: 'Compte collaborateur supprimé.', type: 'success' });
        setSelectedStaff(null);
        fetchStaff();
      },
    });
  };

  const formatCDF = (amount: number) => {
    return new Intl.NumberFormat('fr-CD').format(amount) + ' FC';
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-amber-400" />
            <span>Gestion des Utilisateurs & Rôles Administrateurs</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Annuaire des passagers, attribution des privilèges staff et matrice RBAC souveraine en RDC.
          </p>
        </div>

        {/* Action button based on active tab */}
        <div className="flex items-center gap-2">
          {activeMainTab === 'PASSENGERS' && (
            <>
              <a
                href="/api/admin/users/passengers/export"
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exporter CSV</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setPassengerToEdit(null);
                  setIsPassengerFormOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-500/10"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Nouveau Passager</span>
              </button>
            </>
          )}

          {activeMainTab === 'STAFF' && (
            <button
              type="button"
              onClick={() => {
                setStaffToEdit(null);
                setIsStaffFormOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-lg shadow-purple-600/20"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Ajouter un Collaborateur</span>
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-neutral-400 hover:text-white text-2xs"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-white/10 text-xs font-bold gap-2 overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => setActiveMainTab('PASSENGERS')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeMainTab === 'PASSENGERS'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Passagers ({passengers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('STAFF')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeMainTab === 'STAFF'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span>Personnel & Rôles ({staffList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('MATRIX')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeMainTab === 'MATRIX'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>Matrice des Permissions</span>
        </button>
      </div>

      {/* TAB 1: PASSENGERS */}
      {activeMainTab === 'PASSENGERS' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-3.5 rounded-2xl bg-[#0D1E32] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2 w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={passengerSearch}
                  onChange={(e) => setPassengerSearch(e.target.value)}
                  placeholder="Rechercher par nom, téléphone (+243...), identifiant ou email..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-900 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <select
                value={passengerStatusFilter}
                onChange={(e) => setPassengerStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-neutral-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-400"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="ACTIVE">Actifs</option>
                <option value="SUSPENDED">Suspendus</option>
                <option value="BANNED">Bannis</option>
              </select>

              <select
                value={passengerCityFilter}
                onChange={(e) => setPassengerCityFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-neutral-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-400 hidden sm:block"
              >
                <option value="ALL">Toutes les villes</option>
                <option value="Kinshasa">Kinshasa</option>
                <option value="Lubumbashi">Lubumbashi</option>
                <option value="Goma">Goma</option>
                <option value="Kolwezi">Kolwezi</option>
                <option value="Matadi">Matadi</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setPassengerTrashMode((prev) => !prev)}
              className={`px-3 py-2 rounded-xl text-2xs font-bold border transition-colors flex items-center gap-1.5 shrink-0 ${
                passengerTrashMode
                  ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                  : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{passengerTrashMode ? 'Vue Corbeille active' : 'Afficher corbeille'}</span>
            </button>
          </div>

          {/* Passengers Data Table */}
          <div className="rounded-3xl bg-[#0D1E32] border border-white/10 overflow-hidden shadow-xl">
            {passengerLoading ? (
              <div className="p-12 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Chargement de la liste des passagers...</span>
              </div>
            ) : passengers.length === 0 ? (
              <div className="p-12 text-center text-neutral-400 text-xs italic">
                Aucun passager trouvé correspondant aux critères.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left min-w-[750px]">
                  <thead className="text-2xs font-black uppercase text-neutral-400 border-b border-white/10 bg-white/2">
                    <tr>
                      <th className="py-3 px-4">Passager & Identifiant</th>
                      <th className="py-3 px-3">Téléphone & Ville</th>
                      <th className="py-3 px-3">Statut</th>
                      <th className="py-3 px-3">Fidélité</th>
                      <th className="py-3 px-3">Courses / Bus</th>
                      <th className="py-3 px-3">Total Dépensé</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {passengers.map((p) => (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => setSelectedPassenger(p)}
                            className="text-left group"
                          >
                            <div className="font-bold text-white group-hover:text-amber-300 transition-colors">
                              {p.name}
                            </div>
                            <div className="text-2xs text-neutral-400 font-mono flex items-center gap-1.5">
                              <span>#{p.id}</span>
                              <span className="text-3xs px-1.5 py-0.2 rounded bg-white/10">v{p.version}</span>
                            </div>
                          </button>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-mono text-neutral-200">{p.phone}</div>
                          <div className="text-2xs text-neutral-400">{p.city}</div>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-3xs font-black uppercase tracking-wider border ${
                              p.status === 'ACTIVE'
                                ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                                : p.status === 'SUSPENDED'
                                ? 'bg-amber-950/70 border-amber-500/40 text-amber-300'
                                : 'bg-rose-950/70 border-rose-500/40 text-rose-300'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-3xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300 inline-flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            <span>{p.loyaltyTier}</span>
                          </span>
                        </td>

                        <td className="py-3 px-3 text-neutral-300">
                          {p.totalRides} courses • {p.totalBookings} bus
                        </td>

                        <td className="py-3 px-3 font-mono font-bold text-white">
                          {formatCDF(p.totalSpentCDF)}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View as User Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenViewAsUser(p)}
                              title="Visualiser en tant qu’utilisateur (Audit)"
                              className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Details Button */}
                            <button
                              type="button"
                              onClick={() => setSelectedPassenger(p)}
                              title="Détails complets & Historique"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 transition-colors"
                            >
                              <Layers className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setPassengerToEdit(p);
                                setIsPassengerFormOpen(true);
                              }}
                              title="Modifier les coordonnées"
                              className="p-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900 text-blue-300 border border-blue-800/40 transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: STAFF & ROLES */}
      {activeMainTab === 'STAFF' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-[#0D1E32] border border-white/10 flex items-center justify-between">
            <div className="text-xs text-neutral-300">
              <span className="font-bold text-white block">Personnel Administrateur & Régulateurs</span>
              Seul le <strong className="text-purple-300">Super Administrateur</strong> a l’autorisation
              de promouvoir ou d’assigner des rôles. Protection active contre la suppression du dernier compte racine.
            </div>
            <button
              type="button"
              onClick={() => setStaffTrashMode((prev) => !prev)}
              className={`px-3 py-2 rounded-xl text-2xs font-bold border transition-colors flex items-center gap-1.5 shrink-0 ${
                staffTrashMode
                  ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                  : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{staffTrashMode ? 'Vue Corbeille active' : 'Afficher corbeille'}</span>
            </button>
          </div>

          <div className="rounded-3xl bg-[#0D1E32] border border-white/10 overflow-hidden shadow-xl">
            {staffLoading ? (
              <div className="p-12 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                <span>Chargement de l’équipe administrative...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left min-w-[700px]">
                  <thead className="text-2xs font-black uppercase text-neutral-400 border-b border-white/10 bg-white/2">
                    <tr>
                      <th className="py-3 px-4">Agent & Email</th>
                      <th className="py-3 px-3">Téléphone</th>
                      <th className="py-3 px-3">Rôle Attribué</th>
                      <th className="py-3 px-3">Authentification 2FA</th>
                      <th className="py-3 px-3">Sessions Actives</th>
                      <th className="py-3 px-3">Statut</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {staffList.map((s) => (
                      <tr key={s.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => setSelectedStaff(s)}
                            className="text-left group"
                          >
                            <div className="font-bold text-white group-hover:text-purple-300 transition-colors">
                              {s.name}
                            </div>
                            <div className="text-2xs text-neutral-400 font-mono">{s.email}</div>
                          </button>
                        </td>

                        <td className="py-3 px-3 font-mono text-neutral-300">{s.phone}</td>

                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-2xs font-black uppercase tracking-wider border ${
                              s.role === 'SUPER_ADMIN'
                                ? 'bg-purple-950/70 border-purple-500/50 text-purple-300'
                                : s.role === 'ADMIN'
                                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                                : s.role === 'FINANCE'
                                ? 'bg-blue-950/70 border-blue-500/50 text-blue-300'
                                : s.role === 'SUPPORT'
                                ? 'bg-amber-950/70 border-amber-500/50 text-amber-300'
                                : s.role === 'OPERATIONS'
                                ? 'bg-orange-950/70 border-orange-500/50 text-orange-300'
                                : 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300'
                            }`}
                          >
                            {s.role}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 text-2xs font-bold ${
                              s.totpEnabled ? 'text-emerald-400' : 'text-amber-400'
                            }`}
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>{s.totpEnabled ? 'TOTP Configuré' : '2FA Forcé'}</span>
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-white/5 font-mono text-2xs text-neutral-300">
                            {s.activeSessionsCount} session(s)
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-3xs font-black uppercase ${
                              s.status === 'ACTIVE'
                                ? 'bg-emerald-950 text-emerald-300'
                                : 'bg-rose-950 text-rose-300'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedStaff(s)}
                              title="Gérer les sessions et permissions"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 transition-colors"
                            >
                              <Laptop className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setStaffToEdit(s);
                                setIsStaffFormOpen(true);
                              }}
                              title="Modifier rôle et attributs"
                              className="p-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900 text-purple-200 border border-purple-800/40 transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {s.status === 'ACTIVE' ? (
                              <button
                                type="button"
                                onClick={() => handleToggleStaffStatus(s, 'DISABLED')}
                                title="Désactiver le compte"
                                className="p-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900 text-amber-300 border border-amber-800/40 transition-colors"
                              >
                                <UserX className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleStaffStatus(s, 'ACTIVE')}
                                title="Réactiver le compte"
                                className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/40 transition-colors"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MATRIX */}
      {activeMainTab === 'MATRIX' && (
        <PermissionMatrixEditor currentUserRole={currentAdminRole} />
      )}

      {/* DRAWERS & MODALS */}
      <PassengerDetailDrawer
        isOpen={Boolean(selectedPassenger)}
        passenger={selectedPassenger}
        onClose={() => setSelectedPassenger(null)}
        onEdit={(p) => {
          setSelectedPassenger(null);
          setPassengerToEdit(p);
          setIsPassengerFormOpen(true);
        }}
        onAction={(action, p) => handlePassengerAction(action, p)}
        onViewAsUser={(p) => handleOpenViewAsUser(p)}
      />

      <ViewAsUserModal
        isOpen={isViewAsUserOpen}
        passenger={impersonatePassenger}
        onClose={() => setIsViewAsUserOpen(false)}
      />

      <PassengerFormModal
        isOpen={isPassengerFormOpen}
        passengerToEdit={passengerToEdit}
        onClose={() => {
          setIsPassengerFormOpen(false);
          setPassengerToEdit(null);
        }}
        onSuccess={() => {
          setFeedback({ message: 'Passager enregistré avec succès.', type: 'success' });
          fetchPassengers();
        }}
      />

      <StaffDetailDrawer
        isOpen={Boolean(selectedStaff)}
        staff={selectedStaff}
        currentUserRole={currentAdminRole}
        onClose={() => setSelectedStaff(null)}
        onEdit={(s) => {
          setSelectedStaff(null);
          setStaffToEdit(s);
          setIsStaffFormOpen(true);
        }}
        onRevokeSession={(staffId, sessionId) => handleRevokeStaffSession(staffId, sessionId)}
        onToggleStatus={(s, st) => handleToggleStaffStatus(s, st)}
        onForce2FA={(s) => handleToggleStaffStatus(s, s.status)}
        onDelete={(s) => handleDeleteStaff(s)}
      />

      <StaffFormModal
        isOpen={isStaffFormOpen}
        staffToEdit={staffToEdit}
        isSuperAdmin={currentAdminRole === 'SUPER_ADMIN'}
        onClose={() => {
          setIsStaffFormOpen(false);
          setStaffToEdit(null);
        }}
        onSuccess={() => {
          setFeedback({ message: 'Compte collaborateur mis à jour.', type: 'success' });
          fetchStaff();
        }}
      />

      <UserActionModal
        isOpen={actionModalConfig.isOpen}
        title={actionModalConfig.title}
        description={actionModalConfig.description}
        targetName={actionModalConfig.targetName}
        actionType={actionModalConfig.actionType}
        onClose={() => setActionModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={actionModalConfig.onConfirm}
      />

      <OptimisticConflictModal
        isOpen={conflictModalData.isOpen}
        currentVersion={conflictModalData.serverVersion}
        expectedVersion={conflictModalData.clientVersion}
        onClose={() => setConflictModalData((prev) => ({ ...prev, isOpen: false }))}
        onReload={() => {
          setConflictModalData((prev) => ({ ...prev, isOpen: false }));
          fetchPassengers();
          fetchStaff();
        }}
      />
    </div>
  );
}
