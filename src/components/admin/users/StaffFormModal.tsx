'use client';

import React, { useState, useEffect } from 'react';
import { X, Shield, KeyRound, Loader2, AlertCircle } from 'lucide-react';
import { StaffAccount, UserRole } from '@/types';
import { CreateStaffSchema, UpdateStaffSchema } from '@/lib/validations/users';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  staffToEdit?: StaffAccount | null;
  onSuccess: () => void;
  isSuperAdmin: boolean;
}

export function StaffFormModal({
  isOpen,
  onClose,
  staffToEdit,
  onSuccess,
  isSuperAdmin,
}: Props) {
  const isEditing = Boolean(staffToEdit);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [status, setStatus] = useState<'ACTIVE' | 'DISABLED'>('ACTIVE');
  const [forceTotp, setForceTotp] = useState(true);
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (staffToEdit) {
      setName(staffToEdit.name);
      setEmail(staffToEdit.email);
      setPhone(staffToEdit.phone);
      setRole(staffToEdit.role);
      setStatus(staffToEdit.status);
      setForceTotp(staffToEdit.forceTotp);
      setPassword('');
      setReason('');
      setError(null);
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setRole('ADMIN');
      setStatus('ACTIVE');
      setForceTotp(true);
      setPassword('');
      setReason('');
      setError(null);
    }
  }, [staffToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing && staffToEdit) {
        if (!reason || reason.trim().length < 5) {
          setError('Le motif d’audit est obligatoire (min. 5 caractères).');
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/admin/users/staff/${staffToEdit.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            role,
            status,
            permissions: staffToEdit.permissions || [],
            forceTotp,
            version: staffToEdit.version,
            reason: reason.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Erreur lors de la modification.');
          setLoading(false);
          return;
        }
      } else {
        const res = await fetch('/api/admin/users/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            role,
            forceTotp,
            password: password ? password.trim() : undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Erreur lors de la création du compte.');
          setLoading(false);
          return;
        }
      }

      onSuccess();
      onClose();
    } catch {
      setError('Erreur réseau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-[#0D1E32] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              {isEditing ? 'Modifier les habilitations du collaborateur' : 'Créer un compte administrateur'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-2xs font-bold text-neutral-300 uppercase tracking-wider block">
              Nom complet de l’agent *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Jean-Luc Mwamba"
              className="w-full px-3 py-2 text-xs bg-neutral-900 border border-white/15 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-2xs font-bold text-neutral-300 uppercase tracking-wider block">
                Email professionnel *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@transnumerica.cd"
                disabled={isEditing}
                className="w-full px-3 py-2 text-xs bg-neutral-900 border border-white/15 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 disabled:opacity-50"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-2xs font-bold text-neutral-300 uppercase tracking-wider block">
                Téléphone RDC *
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+243810000000"
                className="w-full px-3 py-2 text-xs bg-neutral-900 border border-white/15 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-2xs font-bold text-neutral-300 uppercase tracking-wider block">
                Rôle attribué *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                disabled={!isSuperAdmin}
                className="w-full px-3 py-2 text-xs bg-neutral-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-amber-400 disabled:opacity-50"
              >
                <option value="ADMIN">ADMIN (Régulation standard)</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN (Accès total racine)</option>
                <option value="FINANCE">FINANCE (Trésorerie & Payouts)</option>
                <option value="SUPPORT">SUPPORT (Litiges & Passagers)</option>
                <option value="OPERATIONS">OPERATIONS (Lignes & Flottes)</option>
                <option value="CONTENT">CONTENT (Tarifs & Contenu)</option>
              </select>
              {!isSuperAdmin && (
                <p className="text-3xs text-amber-400">
                  Seul le Super Administrateur peut modifier le rôle.
                </p>
              )}
            </div>

            {isEditing && (
              <div className="space-y-1">
                <label className="text-2xs font-bold text-neutral-300 uppercase tracking-wider block">
                  Statut du compte *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-neutral-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="ACTIVE">Actif</option>
                  <option value="DISABLED">Désactivé (Accès suspendu)</option>
                </select>
              </div>
            )}
          </div>

          {!isEditing && (
            <div className="space-y-1">
              <label className="text-2xs font-bold text-neutral-300 uppercase tracking-wider block">
                Mot de passe temporaire initial
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Laisser vide pour mot de passe par défaut sécurisé"
                className="w-full px-3 py-2 text-xs bg-neutral-900 border border-white/15 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          )}

          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-xs font-bold text-white">Exiger l’activation 2FA</div>
                <div className="text-2xs text-neutral-400">
                  L’agent devra scanner son code TOTP à la première connexion
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={forceTotp}
              onChange={(e) => setForceTotp(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-neutral-900 text-amber-500 focus:ring-amber-400 cursor-pointer"
            />
          </div>

          {isEditing && (
            <div className="space-y-1 pt-2 border-t border-white/10">
              <label className="text-2xs font-bold text-neutral-300 uppercase tracking-wider block">
                Motif d’audit obligatoire <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Changement de poste, promotion de rôle, audit de sécurité..."
                rows={2}
                className="w-full px-3 py-2 text-xs bg-neutral-900 border border-white/15 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                required
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-bold"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isEditing ? 'Enregistrer les modifications' : 'Créer l’administrateur'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

