'use client';

import React, { useState, useEffect } from 'react';
import { X, UserPlus, Edit, Loader2, AlertCircle } from 'lucide-react';
import { PassengerAccount } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  passengerToEdit?: PassengerAccount | null;
  onSuccess: () => void;
}

export function PassengerFormModal({
  isOpen,
  onClose,
  passengerToEdit,
  onSuccess,
}: Props) {
  const isEditing = Boolean(passengerToEdit);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Kinshasa');
  const [loyaltyTier, setLoyaltyTier] = useState<'STANDARD' | 'SILVER' | 'GOLD' | 'VIP'>('STANDARD');
  const [preferredPayment, setPreferredPayment] = useState<'MPESA' | 'AIRTEL_MONEY' | 'ORANGE_MONEY' | 'CASH'>('MPESA');
  const [status, setStatus] = useState<'ACTIVE' | 'SUSPENDED' | 'BANNED'>('ACTIVE');
  const [notes, setNotes] = useState('');
  const [auditReason, setAuditReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (passengerToEdit) {
      setName(passengerToEdit.name);
      setPhone(passengerToEdit.phone);
      setEmail(passengerToEdit.email || '');
      setCity(passengerToEdit.city);
      setLoyaltyTier(passengerToEdit.loyaltyTier);
      setPreferredPayment(passengerToEdit.preferredPayment as any);
      setStatus(passengerToEdit.status);
      setNotes(passengerToEdit.notes || '');
      setAuditReason('');
      setError(null);
    } else {
      setName('');
      setPhone('+243');
      setEmail('');
      setCity('Kinshasa');
      setLoyaltyTier('STANDARD');
      setPreferredPayment('MPESA');
      setStatus('ACTIVE');
      setNotes('');
      setAuditReason('');
      setError(null);
    }
  }, [passengerToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing && passengerToEdit) {
        const res = await fetch(`/api/admin/users/passengers/${passengerToEdit.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim() || undefined,
            city: city.trim(),
            loyaltyTier,
            preferredPayment,
            status,
            notes: notes.trim() || undefined,
            version: passengerToEdit.version,
            auditReason: auditReason ? auditReason.trim() : 'Mise à jour coordonnées passager',
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Erreur lors de la mise à jour du passager.');
          setLoading(false);
          return;
        }
      } else {
        const res = await fetch('/api/admin/users/passengers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim() || undefined,
            city: city.trim(),
            loyaltyTier,
            preferredPayment,
            notes: notes.trim() || undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Erreur lors de l’enregistrement du passager.');
          setLoading(false);
          return;
        }
      }

      onSuccess();
      onClose();
    } catch {
      setError('Erreur réseau lors de la soumission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-[#0D1E32] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {isEditing ? (
              <Edit className="w-5 h-5 text-amber-400" />
            ) : (
              <UserPlus className="w-5 h-5 text-emerald-400" />
            )}
            <h3 className="text-base font-bold text-white">
              {isEditing ? `Modifier le passager : ${passengerToEdit?.name}` : 'Nouveau compte passager'}
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-2xs font-bold text-neutral-300 uppercase tracking-wider block">
              Nom complet du passager *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Merveille Kalala"
              className="w-full px-3 py-2 text-xs bg-neutral-900 border border-white/15 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <div className="space-y-1">
              <label className="text-2xs font-bold text-neutral-300 uppercase tracking-wider block">
                Email (Optionnel)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="passager@gmail.com"
                className="w-full px-3 py-2 text-xs bg-neutral-900 border border-white/15 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-2xs font-bold text-neutral-300 uppercase tracking-wider block">
                Ville principale *
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Kinshasa">Kinshasa</option>
                <option value="Lubumbashi">Lubumbashi</option>
                <option value="Goma">Goma</option>
                <option value="Kolwezi">Kolwezi</option>
                <option value="Matadi">Matadi</option>
                <option value="Kisangani">Kisangani</option>
                <option value="Bukavu">Bukavu</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-2xs font-bold text-neutral-300 uppercase tracking-wider block">
                Niveau Fidélité
              </label>
              <select
                value={loyaltyTier}
                onChange={(e) => setLoyaltyTier(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-neutral-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-amber-400"
              >
                <option value="STANDARD">Standard</option>
                <option value="SILVER">Silver</option>
                <option value="GOLD">Gold</option>
                <option value="VIP">VIP</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-2xs font-bold text-neutral-300 uppercase tracking-wider block">
                Paiement Favori
              </label>
              <select
                value={preferredPayment}
                onChange={(e) => setPreferredPayment(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-neutral-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-amber-400"
              >
                <option value="MPESA">Vodacom M-Pesa</option>
                <option value="AIRTEL_MONEY">Airtel Money</option>
                <option value="ORANGE_MONEY">Orange Money</option>
                <option value="CASH">Espèces (Cash)</option>
              </select>
            </div>
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
                <option value="SUSPENDED">Suspendu</option>
                <option value="BANNED">Banni</option>
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-2xs font-bold text-neutral-300 uppercase tracking-wider block">
              Notes internes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Passager VIP régulier sur la ligne Kinshasa-Matadi..."
              rows={2}
              className="w-full px-3 py-2 text-xs bg-neutral-900 border border-white/15 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {isEditing && (
            <div className="space-y-1 pt-2 border-t border-white/10">
              <label className="text-2xs font-bold text-neutral-300 uppercase tracking-wider block">
                Motif d’audit (Optionnel mais recommandé)
              </label>
              <input
                type="text"
                value={auditReason}
                onChange={(e) => setAuditReason(e.target.value)}
                placeholder="Ex: Mise à jour du numéro de téléphone suite à demande..."
                className="w-full px-3 py-2 text-xs bg-neutral-900 border border-white/15 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
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
              <span>{isEditing ? 'Enregistrer les modifications' : 'Créer le passager'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

