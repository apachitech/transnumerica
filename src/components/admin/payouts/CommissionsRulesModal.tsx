'use client';

import React, { useState, useEffect } from 'react';
import { CommissionConfigRule, CommissionRateType } from '@/types';
import { X, Percent, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CommissionsRulesModalProps {
  rule: CommissionConfigRule | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (savedRule: CommissionConfigRule) => void;
}

export function CommissionsRulesModal({
  rule,
  isOpen,
  onClose,
  onSuccess,
}: CommissionsRulesModalProps) {
  const [service, setService] = useState<'ALL' | 'BUS' | 'TAXI' | 'MOTO' | 'DELIVERY'>('TAXI');
  const [city, setCity] = useState<'ALL' | 'kinshasa' | 'lubumbashi' | 'matadi' | 'kolwezi' | 'goma'>('kinshasa');
  const [vehicleType, setVehicleType] = useState<'ALL' | 'CAR' | 'MOTO' | 'BUS' | 'VAN'>('ALL');
  const [rateType, setRateType] = useState<CommissionRateType>('PERCENTAGE');
  const [percentage, setPercentage] = useState(15.0);
  const [fixedFeeCdf, setFixedFeeCdf] = useState(0);
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (rule) {
      setService((rule.service || rule.serviceType || 'TAXI') as any);
      setCity((rule.city || rule.cityId || 'kinshasa') as any);
      setVehicleType((rule.vehicleType || 'ALL') as any);
      setRateType(rule.rateType);
      setPercentage(rule.percentage);
      setFixedFeeCdf(rule.fixedFeeCdf);
      setDescription(rule.description || rule.title || '');
      setIsActive(rule.isActive);
    } else {
      setService('TAXI');
      setCity('kinshasa');
      setVehicleType('ALL');
      setRateType('PERCENTAGE');
      setPercentage(15.0);
      setFixedFeeCdf(0);
      setDescription('');
      setIsActive(true);
    }
    setError(null);
  }, [rule, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Une description de la règle est obligatoire.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        id: rule ? rule.id : undefined,
        operatorId: rule?.operatorId || null,
        service,
        city,
        vehicleType,
        rateType,
        percentage,
        fixedFeeCdf,
        validFrom: rule ? rule.validFrom : new Date().toISOString(),
        validUntil: rule?.validUntil || null,
        isActive,
        description: description.trim(),
        version: rule?.version,
      };

      const res = await fetch('/api/admin/payouts/commissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'enregistrement de la règle');
      }

      onSuccess(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
        <div className="p-4 sm:p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {rule ? 'Modifier la Règle de Commission' : 'Nouvelle Règle de Commission'}
              </h2>
              <p className="text-xs text-zinc-400">
                {rule ? `Version ${rule.version}` : 'Définition du barème Transnumerica'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer la modal"
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Description / Intitulé <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Commission standard Taxis Kinshasa"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Service concerné</label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">Tous les services</option>
                <option value="TAXI">Taxi Express</option>
                <option value="MOTO">Mototaxi</option>
                <option value="BUS">Bus Interurbain</option>
                <option value="DELIVERY">Livraison & Colis</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Ville / Zone</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">National (Toutes les villes)</option>
                <option value="kinshasa">Kinshasa</option>
                <option value="lubumbashi">Lubumbashi</option>
                <option value="matadi">Matadi</option>
                <option value="kolwezi">Kolwezi</option>
                <option value="goma">Goma</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Type de barème</label>
              <select
                value={rateType}
                onChange={(e) => setRateType(e.target.value as CommissionRateType)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="PERCENTAGE">Pourcentage simple (%)</option>
                <option value="FLAT_FEE">Frais fixe uniquement (CDF)</option>
                <option value="HYBRID">Hybride (% + frais fixe CDF)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Type de véhicule</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">Tous véhicules</option>
                <option value="CAR">Voiture / Berline</option>
                <option value="MOTO">Moto</option>
                <option value="BUS">Bus / Minibus</option>
                <option value="VAN">Van / Utilitaire</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Taux de commission (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={percentage}
                onChange={(e) => setPercentage(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Frais fixe par course (CDF)</label>
              <input
                type="number"
                min={0}
                step={50}
                value={fixedFeeCdf}
                onChange={(e) => setFixedFeeCdf(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded bg-zinc-950 border-zinc-700 text-amber-500 focus:ring-0"
            />
            <label htmlFor="isActiveCheck" className="text-xs text-zinc-300">
              Règle active pour le calcul des prochains lots
            </label>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 shadow-lg shadow-amber-600/20"
            >
              {loading ? (
                'Enregistrement...'
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Enregistrer la Règle
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
