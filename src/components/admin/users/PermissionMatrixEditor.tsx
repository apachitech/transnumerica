'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
} from 'lucide-react';
import { UserRole, AdminPermission } from '@/types';
import { ALL_ADMIN_PERMISSIONS } from '@/lib/security/roles-permissions';

interface Props {
  currentUserRole?: UserRole;
}

const ROLES_LIST: { role: UserRole; label: string; color: string }[] = [
  { role: 'SUPER_ADMIN', label: 'Super Admin', color: 'text-purple-400 bg-purple-950/60 border-purple-500/40' },
  { role: 'ADMIN', label: 'Admin Régulation', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40' },
  { role: 'FINANCE', label: 'Finance & Payouts', color: 'text-blue-400 bg-blue-950/60 border-blue-500/40' },
  { role: 'SUPPORT', label: 'Support & Litiges', color: 'text-amber-400 bg-amber-950/60 border-amber-500/40' },
  { role: 'OPERATIONS', label: 'Opérations Lignes', color: 'text-orange-400 bg-orange-950/60 border-orange-500/40' },
  { role: 'CONTENT', label: 'Contenu & Tarifs', color: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40' },
];

const PERMISSION_GROUPS: { groupName: string; permissions: { key: AdminPermission; label: string }[] }[] = [
  {
    groupName: 'Gestion des Passagers & Clients',
    permissions: [
      { key: 'users.read', label: 'Consulter la liste et profils passagers' },
      { key: 'users.create', label: 'Créer manuellement un passager' },
      { key: 'users.update', label: 'Modifier les coordonnées passagers' },
      { key: 'users.suspend', label: 'Suspendre temporairement un compte passager' },
      { key: 'users.ban', label: 'Bannir définitivement un passager' },
      { key: 'users.delete', label: 'Supprimer (soft delete) un compte passager' },
      { key: 'users.restore', label: 'Restaurer un passager supprimé' },
      { key: 'users.impersonate', label: 'Visualiser en tant qu’utilisateur (View as user)' },
      { key: 'users.export', label: 'Exporter les passagers au format CSV' },
    ],
  },
  {
    groupName: 'Personnel & Rôles Administrateurs',
    permissions: [
      { key: 'staff.read', label: 'Consulter la liste des agents et collaborateurs' },
      { key: 'staff.create', label: 'Créer des comptes administrateurs (Super Admin)' },
      { key: 'staff.update', label: 'Modifier les habilitations d’un collaborateur' },
      { key: 'staff.delete', label: 'Désactiver ou supprimer un compte collaborateur' },
      { key: 'staff.sessions', label: 'Inspecter et révoquer les sessions actives' },
      { key: 'staff.export', label: 'Exporter la liste des agents' },
      { key: 'roles.manage', label: 'Modifier la matrice des rôles et permissions' },
    ],
  },
  {
    groupName: 'Transport, Corridors & Chauffeurs',
    permissions: [
      { key: 'corridors.read', label: 'Consulter les lignes et corridors interurbains' },
      { key: 'corridors.create', label: 'Créer de nouvelles lignes et corridors' },
      { key: 'corridors.update', label: 'Modifier tarifs de base et arrêts' },
      { key: 'corridors.delete', label: 'Supprimer ou archiver un corridor' },
      { key: 'corridors.restore', label: 'Restaurer un corridor supprimé' },
      { key: 'corridors.export', label: 'Exporter les corridors au format CSV' },
      { key: 'corridors.import', label: 'Importer des corridors par fichier CSV' },
      { key: 'drivers.read', label: 'Consulter les chauffeurs partenaires' },
      { key: 'drivers.verify', label: 'Valider les dossiers KYC chauffeurs' },
      { key: 'operators.read', label: 'Consulter les compagnies de bus partenaires' },
      { key: 'operators.verify', label: 'Valider les licences opérateurs' },
    ],
  },
  {
    groupName: 'Réservations, Finances & Litiges',
    permissions: [
      { key: 'bookings.read', label: 'Consulter les réservations et courses en direct' },
      { key: 'bookings.export', label: 'Exporter les réservations en CSV' },
      { key: 'payments.read', label: 'Consulter les transactions Mobile Money' },
      { key: 'payments.refund', label: 'Effectuer des remboursements financiers' },
      { key: 'payouts.read', label: 'Consulter les demandes de versement (Payouts)' },
      { key: 'payouts.execute', label: 'Exécuter les décaissements opérateurs / chauffeurs' },
      { key: 'disputes.read', label: 'Consulter les réclamations et litiges passagers' },
      { key: 'disputes.resolve', label: 'Clôturer et résoudre les litiges' },
    ],
  },
  {
    groupName: 'Gouvernance, Système & Audit',
    permissions: [
      { key: 'analytics.read', label: 'Consulter les statistiques et indicateurs KPI' },
      { key: 'services.read', label: 'Consulter la grille des services par ville' },
      { key: 'services.toggle', label: 'Activer ou suspendre un service dans une ville' },
      { key: 'pricing.read', label: 'Consulter la grille tarifaire' },
      { key: 'pricing.manage', label: 'Modifier les majorations et frais de service' },
      { key: 'audit.read', label: 'Consulter le journal d’audit immuable' },
      { key: 'settings.read', label: 'Consulter les paramètres système' },
      { key: 'settings.manage', label: 'Modifier les paramètres globaux de sécurité' },
    ],
  },
];

export function PermissionMatrixEditor({ currentUserRole }: Props) {
  const [matrix, setMatrix] = useState<Record<UserRole, AdminPermission[]>>({} as any);
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState<UserRole | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [reasonInput, setReasonInput] = useState('');
  const [selectedRoleForSave, setSelectedRoleForSave] = useState<UserRole | null>(null);

  const isSuper = currentUserRole === 'SUPER_ADMIN';

  const fetchMatrix = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users/roles/matrix');
      if (res.ok) {
        const data = await res.json();
        setMatrix(data.matrix);
      }
    } catch {
      setFeedback({ message: 'Erreur lors du chargement de la matrice.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, []);

  const handleToggle = (role: UserRole, perm: AdminPermission) => {
    if (role === 'SUPER_ADMIN' || !isSuper) return; // Super admin possesses everything, only super admin can edit

    setMatrix((prev) => {
      const currentList = prev[role] || [];
      const hasIt = currentList.includes(perm);
      const updatedList = hasIt ? currentList.filter((p) => p !== perm) : [...currentList, perm];
      return {
        ...prev,
        [role]: updatedList,
      };
    });
  };

  const handleSaveRole = async (role: UserRole) => {
    if (!reasonInput || reasonInput.trim().length < 5) {
      setFeedback({
        message: 'Un motif d’audit obligatoire (min. 5 caractères) est requis pour enregistrer.',
        type: 'error',
      });
      return;
    }

    setSavingRole(role);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/users/roles/matrix', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          permissions: matrix[role] || [],
          reason: reasonInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedback({ message: data.error || 'Erreur lors de la sauvegarde.', type: 'error' });
        return;
      }

      setFeedback({
        message: `Matrice de permissions pour ${role} mise à jour et journalisée avec succès.`,
        type: 'success',
      });
      setSelectedRoleForSave(null);
      setReasonInput('');
    } catch {
      setFeedback({ message: 'Erreur réseau lors de la mise à jour.', type: 'error' });
    } finally {
      setSavingRole(null);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
        <span>Chargement de la matrice des permissions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Informative banner */}
      <div className="p-4 rounded-2xl bg-[#0D1E32] border border-white/10 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-neutral-300 space-y-1">
            <h3 className="font-bold text-white text-sm">
              Éditeur de Matrice RBAC (Rôles & Permissions Granulaires)
            </h3>
            <p className="text-2xs text-neutral-400">
              Définissez les privilèges applicables par défaut aux différents profils de personnel.
              Les modifications sont appliquées immédiatement et inscrites dans le journal d’audit.
            </p>
          </div>
        </div>
        {!isSuper && (
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-2xs font-bold shrink-0">
            Lecture seule (Réservé Super Admin)
          </span>
        )}
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Role Save Bar if selected */}
      {selectedRoleForSave && isSuper && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-200">
              Enregistrer les modifications pour le rôle : <strong className="text-white">{selectedRoleForSave}</strong>
            </span>
            <button
              type="button"
              onClick={() => setSelectedRoleForSave(null)}
              className="text-2xs text-neutral-400 hover:text-white"
            >
              Annuler
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              placeholder="Motif d’audit obligatoire (ex: Ajustement sécurité audit trimestriel)..."
              className="w-full sm:flex-1 px-3 py-2 text-xs bg-neutral-900 border border-white/15 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={() => handleSaveRole(selectedRoleForSave)}
              disabled={savingRole !== null}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
            >
              {savingRole === selectedRoleForSave && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <Save className="w-3.5 h-3.5" />
              <span>Valider & Journaliser</span>
            </button>
          </div>
        </div>
      )}

      {/* Matrix Table */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#0D1E32] border border-white/10 overflow-hidden shadow-xl space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-white/10 text-2xs uppercase tracking-wider text-neutral-400">
                <th className="py-3 px-3 w-1/3">Permission Système</th>
                {ROLES_LIST.map((r) => (
                  <th key={r.role} className="py-3 px-2 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`px-2 py-0.5 rounded-full text-3xs font-black uppercase border ${r.color}`}>
                        {r.label}
                      </span>
                      {isSuper && r.role !== 'SUPER_ADMIN' && (
                        <button
                          type="button"
                          onClick={() => setSelectedRoleForSave(r.role)}
                          className="text-3xs text-amber-400 hover:text-amber-300 underline font-bold mt-0.5"
                        >
                          Sauvegarder
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {PERMISSION_GROUPS.map((group) => (
                <React.Fragment key={group.groupName}>
                  {/* Group Header */}
                  <tr className="bg-white/5 font-bold text-white text-2xs">
                    <td colSpan={ROLES_LIST.length + 1} className="py-2.5 px-3 uppercase tracking-wider text-amber-300">
                      {group.groupName}
                    </td>
                  </tr>

                  {/* Permissions rows */}
                  {group.permissions.map((p) => (
                    <tr key={p.key} className="hover:bg-white/5 transition-colors">
                      <td className="py-2 px-3">
                        <div className="font-semibold text-white">{p.label}</div>
                        <div className="font-mono text-3xs text-neutral-400">{p.key}</div>
                      </td>
                      {ROLES_LIST.map((r) => {
                        const isGranted =
                          r.role === 'SUPER_ADMIN' || Boolean(matrix[r.role]?.includes(p.key));
                        const isLocked = r.role === 'SUPER_ADMIN' || !isSuper;

                        return (
                          <td key={r.role} className="py-2 px-2 text-center">
                            {r.role === 'SUPER_ADMIN' ? (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-purple-950/80 text-purple-400 border border-purple-500/40">
                                <Lock className="w-3 h-3" />
                              </span>
                            ) : (
                              <input
                                type="checkbox"
                                checked={isGranted}
                                disabled={isLocked}
                                onChange={() => handleToggle(r.role, p.key)}
                                className="w-4 h-4 rounded border-white/20 bg-neutral-900 text-amber-500 focus:ring-amber-400 focus:ring-offset-0 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                              />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

