'use client';

import React, { useState } from 'react';
import {
  X,
  Shield,
  KeyRound,
  Laptop,
  Trash2,
  Edit,
  RotateCcw,
  UserCheck,
  UserX,
  AlertTriangle,
  Lock,
  Layers,
} from 'lucide-react';
import { StaffAccount, UserRole, AdminPermission } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffAccount | null;
  currentUserRole?: UserRole;
  onEdit: (staff: StaffAccount) => void;
  onRevokeSession: (staffId: string, sessionId?: string) => Promise<void>;
  onToggleStatus: (staff: StaffAccount, newStatus: 'ACTIVE' | 'DISABLED') => void;
  onForce2FA: (staff: StaffAccount) => void;
  onDelete: (staff: StaffAccount) => void;
}

export function StaffDetailDrawer({
  isOpen,
  onClose,
  staff,
  currentUserRole,
  onEdit,
  onRevokeSession,
  onToggleStatus,
  onForce2FA,
  onDelete,
}: Props) {
  const [activeTab, setActiveTab] = useState<'INFO' | 'SESSIONS' | 'PERMISSIONS'>('INFO');
  const [revoking, setRevoking] = useState<string | null>(null);

  if (!isOpen || !staff) return null;

  const isSuper = currentUserRole === 'SUPER_ADMIN';

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-2xs font-black uppercase bg-purple-950 border border-purple-500/50 text-purple-300">
            Super Administrateur
          </span>
        );
      case 'ADMIN':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-2xs font-black uppercase bg-emerald-950 border border-emerald-500/50 text-emerald-300">
            Admin Régulation
          </span>
        );
      case 'FINANCE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-2xs font-black uppercase bg-blue-950 border border-blue-500/50 text-blue-300">
            Finance & Payouts
          </span>
        );
      case 'SUPPORT':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-2xs font-black uppercase bg-amber-950 border border-amber-500/50 text-amber-300">
            Support & Litiges
          </span>
        );
      case 'OPERATIONS':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-2xs font-black uppercase bg-orange-950 border border-orange-500/50 text-orange-300">
            Opérations Lignes
          </span>
        );
      case 'CONTENT':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-2xs font-black uppercase bg-cyan-950 border border-cyan-500/50 text-cyan-300">
            Contenu & Tarifs
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-2xs font-black uppercase bg-white/10 text-neutral-300">
            {role}
          </span>
        );
    }
  };

  const handleRevoke = async (sessionId?: string) => {
    setRevoking(sessionId || 'ALL');
    try {
      await onRevokeSession(staff.id, sessionId);
    } finally {
      setRevoking(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="w-full max-w-xl bg-[#0A1624] border-l border-white/10 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-start justify-between bg-[#0D1E32]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xs font-mono text-neutral-400">ID: {staff.id}</span>
              <span className="text-2xs px-2 py-0.5 rounded bg-white/10 text-neutral-300 font-mono">
                v{staff.version}
              </span>
              {getRoleBadge(staff.role)}
            </div>
            <h2 className="text-lg font-black text-white">{staff.name}</h2>
            <div className="text-2xs font-mono text-neutral-400">
              {staff.email} • {staff.phone}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-white/10 bg-[#0A1624] px-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('INFO')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'INFO'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Fiche Agent</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SESSIONS')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'SESSIONS'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Sessions Actives ({staff.activeSessions?.length || 0})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PERMISSIONS')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'PERMISSIONS'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Permissions ({staff.permissions?.length || 0})</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeTab === 'INFO' && (
            <div className="space-y-4">
              {staff.status === 'DISABLED' && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  <strong>Compte collaborateur désactivé :</strong> Cet agent ne peut plus se connecter au tableau de bord.
                </div>
              )}

              {/* 2FA Security status */}
              <div className="p-4 rounded-2xl bg-[#0D1E32] border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Double Authentification (2FA / TOTP)</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-2xs font-bold ${
                      staff.totpEnabled
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {staff.totpEnabled ? 'Actif & Opérationnel' : 'Non activé'}
                  </span>
                </div>
                <p className="text-2xs text-neutral-400">
                  {staff.forceTotp
                    ? 'La configuration 2FA est rendue obligatoire par la politique de sécurité.'
                    : '2FA optionnel.'}
                </p>
              </div>

              {/* Account Details */}
              <div className="p-4 rounded-2xl bg-[#0D1E32] border border-white/5 space-y-3 text-xs">
                <h4 className="font-bold text-white uppercase tracking-wider text-2xs">
                  Détails du Collaborateur
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-neutral-300">
                  <div>
                    <span className="text-2xs text-neutral-500 block">Rôle attribué :</span>
                    <span className="font-bold text-white">{staff.role}</span>
                  </div>
                  <div>
                    <span className="text-2xs text-neutral-500 block">Statut du compte :</span>
                    <span className="font-bold text-white">{staff.status}</span>
                  </div>
                  <div>
                    <span className="text-2xs text-neutral-500 block">Création du compte :</span>
                    <span>{new Date(staff.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div>
                    <span className="text-2xs text-neutral-500 block">Dernière connexion :</span>
                    <span>{staff.lastLoginAt ? new Date(staff.lastLoginAt).toLocaleString('fr-FR') : 'Jamais'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'SESSIONS' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Sessions de navigation en cours</span>
                {staff.activeSessions && staff.activeSessions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleRevoke()}
                    disabled={revoking !== null}
                    className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-200 border border-rose-800/40 text-2xs font-bold"
                  >
                    {revoking === 'ALL' ? 'Révocation...' : 'Révoquer toutes les sessions'}
                  </button>
                )}
              </div>

              {staff.activeSessions && staff.activeSessions.length > 0 ? (
                staff.activeSessions.map((s) => (
                  <div
                    key={s.sessionId}
                    className="p-3.5 rounded-2xl bg-[#0D1E32] border border-white/5 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="font-mono text-2xs text-neutral-300 font-bold">
                        IP: {s.ipAddress}
                      </div>
                      <div className="text-3xs text-neutral-400 font-mono">
                        Session: {s.sessionId.slice(0, 16)}...
                      </div>
                      <div className="text-2xs text-neutral-400 truncate max-w-xs">
                        {s.userAgent}
                      </div>
                      <div className="text-3xs text-neutral-500">
                        Activité : {new Date(s.lastActivityAt).toLocaleTimeString('fr-FR')}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRevoke(s.sessionId)}
                      disabled={revoking === s.sessionId}
                      className="px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/30 text-2xs font-bold shrink-0"
                    >
                      {revoking === s.sessionId ? 'Révocation...' : 'Révoquer'}
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-neutral-400 italic bg-[#0D1E32] rounded-2xl">
                  Aucune session active actuellement pour cet agent.
                </div>
              )}
            </div>
          )}

          {activeTab === 'PERMISSIONS' && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-white block">
                Permissions granulaires octroyées ({staff.permissions?.length || 0})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {staff.permissions?.map((p) => (
                  <div
                    key={p}
                    className="p-2.5 rounded-xl bg-[#0D1E32] border border-white/5 font-mono text-2xs text-neutral-300 flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0D1E32] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(staff)}
              className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Modifier rôle & permissions</span>
            </button>

            <button
              type="button"
              onClick={() => onForce2FA(staff)}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>{staff.forceTotp ? '2FA forcé (Actif)' : 'Forcer 2FA'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {staff.status === 'ACTIVE' ? (
              <button
                type="button"
                onClick={() => onToggleStatus(staff, 'DISABLED')}
                className="px-2.5 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900 text-amber-200 border border-amber-800/40 text-2xs font-bold flex items-center gap-1"
              >
                <UserX className="w-3 h-3 text-amber-400" />
                <span>Désactiver le compte</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onToggleStatus(staff, 'ACTIVE')}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-200 border border-emerald-800/40 text-2xs font-bold flex items-center gap-1"
              >
                <UserCheck className="w-3 h-3 text-emerald-400" />
                <span>Réactiver le compte</span>
              </button>
            )}

            {isSuper && (
              <button
                type="button"
                onClick={() => onDelete(staff)}
                className="px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/30 text-2xs font-bold flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3 text-rose-400" />
                <span>Supprimer</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

