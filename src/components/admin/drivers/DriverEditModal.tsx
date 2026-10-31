'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, Loader2, ShieldCheck, Car, Phone, User, MapPin } from 'lucide-react';
import { DriverAccount } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  driver: DriverAccount | null;
  onSuccess: () => void;
  onConflict?: (serverVersion: number) => void;
}

export function DriverEditModal({ isOpen, onClose, driver, onSuccess, onConflict }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Kinshasa');
  const [cooperativeName, setCooperativeName] = useState('');
  const [hasPassengerHelmet, setHasPassengerHelmet] = useState(false);
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (driver) {
      setName(driver.name);
      setPhone(driver.phone);
      setEmail(driver.email || '');
      setCity(driver.city);
      setCooperativeName(driver.cooperativeName || '');
      setHasPassengerHelmet(driver.hasPassengerHelmet);
      const primaryVehicle = driver.vehicles[0];
      if (primaryVehicle) {
        setVehicleModel(primaryVehicle.model);
        setVehiclePlate(primaryVehicle.plate);
        setVehicleColor(primaryVehicle.color);
      }
    }
  }, [driver]);

  if (!isOpen || !driver) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError('Veuillez renseigner un nom valide.');
      return;
    }
    if (!phone.startsWith('+243') || phone.length < 12) {
      setError('Le numéro de téléphone doit être au format valide (+243...)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/drivers/${driver.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: driver.version,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          city,
          cooperativeName: cooperativeName.trim() || undefined,
          hasPassengerHelmet,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          if (onConflict) {
            onConflict(data.serverVersion || driver.version + 1);
          }
          throw new Error('Conflit de modification simultanée. Le profil a été mis à jour par un autre administrateur.');
        }
        throw new Error(data.error || 'Erreur lors de la mise à jour du profil chauffeur.');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-[#0D1E32] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-8">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-[#091522] flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-brand-primary" />
              Modifier le profil chauffeur
            </h3>
            <p className="text-2xs text-neutral-400 font-mono mt-0.5">
              ID: {driver.id} • Version courante: v{driver.version}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="text-2xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                Nom complet du chauffeur *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-2xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                  Téléphone (RDC) *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+243..."
                  className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="text-2xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                  Ville d&apos;activité *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="Kinshasa">Kinshasa</option>
                  <option value="Lubumbashi">Lubumbashi</option>
                  <option value="Goma">Goma</option>
                  <option value="Kolwezi">Kolwezi</option>
                  <option value="Matadi">Matadi</option>
                  <option value="Bukavu">Bukavu</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-2xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                  Coopérative ou syndicat
                </label>
                <input
                  type="text"
                  value={cooperativeName}
                  onChange={(e) => setCooperativeName(e.target.value)}
                  placeholder="Ex: COWEMOTO Lemba"
                  className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="text-2xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                  Email (optionnel)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="chauffeur@domaine.cd"
                  className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>

            {/* Helmet Compliance Switch */}
            <div className="p-3.5 rounded-2xl bg-[#091522] border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">
                  Casque Passager Fourni (Conformité)
                </span>
                <span className="text-3xs text-neutral-400">
                  Attribue automatiquement le badge de conformité
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasPassengerHelmet}
                  onChange={(e) => setHasPassengerHelmet(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-neutral-300 text-xs font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-brand-primary text-black font-bold text-xs hover:bg-brand-primary/90 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Sauvegarder les modifications
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
