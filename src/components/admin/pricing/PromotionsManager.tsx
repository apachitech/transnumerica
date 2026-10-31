'use client';

import React, { useState } from 'react';
import {
  PricingPromotion,
  PromotionType,
  PromotionDiscountType,
} from '@/types';
import {
  Tag,
  Plus,
  Power,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  Calendar,
  Users,
  MapPin,
} from 'lucide-react';

interface PromotionsManagerProps {
  promotions: PricingPromotion[];
  onPromotionsUpdated: () => void;
}

export function PromotionsManager({ promotions, onPromotionsUpdated }: PromotionsManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form state
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<PromotionType>('CODE');
  const [discountType, setDiscountType] = useState<PromotionDiscountType>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [maxDiscountCdf, setMaxDiscountCdf] = useState<string>('5000');
  const [validFrom, setValidFrom] = useState(() => new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [globalUsageLimit, setGlobalUsageLimit] = useState<number>(500);
  const [perUserLimit, setPerUserLimit] = useState<number>(1);
  const [selectedServices, setSelectedServices] = useState<string[]>(['TAXI', 'MOTO']);
  const [selectedCities, setSelectedCities] = useState<string[]>(['kinshasa']);
  const [minRideAmountCdf, setMinRideAmountCdf] = useState<string>('3000');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleToggleActive = async (promo: PricingPromotion) => {
    try {
      const res = await fetch(`/api/admin/pricing/promotions/${promo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: !promo.isActive,
          version: promo.version,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du basculement');
      }

      setSuccessMsg(data.message);
      setTimeout(() => setSuccessMsg(null), 3000);
      onPromotionsUpdated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleDelete = async (promo: PricingPromotion) => {
    if (!confirm(`Archiver définitivement l'offre "${promo.title}" ?`)) return;

    try {
      const res = await fetch(`/api/admin/pricing/promotions/${promo.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la suppression');
      }

      setSuccessMsg(data.message);
      setTimeout(() => setSuccessMsg(null), 3000);
      onPromotionsUpdated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/pricing/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: type === 'CODE' ? code.trim().toUpperCase() : null,
          title: title.trim(),
          description: description.trim(),
          type,
          discountType,
          discountValue: Number(discountValue),
          maxDiscountCdf: maxDiscountCdf ? Number(maxDiscountCdf) : undefined,
          validFrom: new Date(validFrom).toISOString(),
          validUntil: new Date(`${validUntil}T23:59:59Z`).toISOString(),
          globalUsageLimit: Number(globalUsageLimit),
          perUserLimit: Number(perUserLimit),
          eligibleServices: selectedServices,
          eligibleCities: selectedCities,
          minRideAmountCdf: minRideAmountCdf ? Number(minRideAmountCdf) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la promotion');
      }

      setSuccessMsg('Promotion créée et déployée avec succès.');
      setTimeout(() => setSuccessMsg(null), 4000);
      setIsCreateOpen(false);
      // Reset form
      setCode('');
      setTitle('');
      setDescription('');
      onPromotionsUpdated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleService = (s: string) => {
    setSelectedServices((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );
  };

  const toggleCity = (c: string) => {
    setSelectedCities((prev) =>
      prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]
    );
  };

  return (
    <div className="space-y-4">
      {successMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Header and Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-500" />
            <span>Codes Promo & Remises Automatiques ({promotions.length})</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gestion des réductions commerciales avec coupure instantanée (kill-switch)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Créer une offre</span>
        </button>
      </div>

      {/* Promotions List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promotions.map((p) => (
          <div
            key={p.id}
            className={`rounded-2xl border p-4 shadow-sm space-y-3 transition-all ${
              p.isActive
                ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/60'
                : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-700/30 opacity-75'
            }`}
          >
            {/* Header: Code/Auto + Status Pill */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-2">
                {p.code ? (
                  <span className="font-mono font-black text-sm bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-700 tracking-wider">
                    {p.code}
                  </span>
                ) : (
                  <span className="font-bold text-xs bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-300 px-2 py-0.5 rounded-lg border border-sky-300 dark:border-sky-800 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-sky-500" /> Remise Auto
                  </span>
                )}
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  {p.discountType === 'PERCENTAGE'
                    ? `-${p.discountValue}% ${p.maxDiscountCdf ? `(Plafond: ${p.maxDiscountCdf.toLocaleString('fr-FR')} FC)` : ''}`
                    : `-${p.discountValue.toLocaleString('fr-FR')} ${p.discountType === 'FIXED_USD' ? 'USD' : 'FC'}`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    p.isActive
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  {p.isActive ? 'ACTIF' : 'DÉSACTIVÉ'}
                </span>

                <button
                  type="button"
                  onClick={() => handleToggleActive(p)}
                  title={p.isActive ? 'Désactiver immédiatement (Kill-switch)' : 'Activer l’offre'}
                  className={`p-1.5 rounded-lg transition-colors ${
                    p.isActive
                      ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                      : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                  }`}
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Description & Usage */}
            <div className="space-y-1.5 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white">{p.title}</h4>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                {p.description}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Utilisations : <strong>{p.globalUsageCount} / {p.globalUsageLimit}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Fin : {new Date(p.validUntil).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>

              {/* Eligible Services & Cities pills */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {p.eligibleServices.map((s) => (
                  <span key={s} className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                    {s}
                  </span>
                ))}
                {p.eligibleCities.map((c) => (
                  <span key={c} className="bg-amber-100/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                    📍 {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer action */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/50 flex justify-end">
              <button
                type="button"
                onClick={() => handleDelete(p)}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 p-1 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Archiver</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <Tag className="w-5 h-5" />
                <span>Créer une Offre Promotionnelle</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs overflow-y-auto flex-1 pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Type d’offre
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as PromotionType)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="CODE">Code Promo Saisissable</option>
                    <option value="AUTOMATIC">Remise Automatique au Panier</option>
                  </select>
                </div>

                {type === 'CODE' && (
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Code Promo (Ex: PROMO2026) *
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="Ex: VACANCES20"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono uppercase font-bold"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Titre de l’opération *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Rentrée Scolaire — 20% sur les courses Wewa"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Description & conditions *
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Valable sur les courses de mototaxis à Kinshasa plafonné à 4000 FC"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Type de remise</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as PromotionDiscountType)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="PERCENTAGE">Pourcentage (%)</option>
                    <option value="FIXED_CDF">Montant Fixe CDF</option>
                    <option value="FIXED_USD">Montant Fixe USD</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Valeur</label>
                  <input
                    type="number"
                    min="1"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold font-mono"
                    required
                  />
                </div>

                {discountType === 'PERCENTAGE' && (
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Plafond (CDF)</label>
                    <input
                      type="number"
                      value={maxDiscountCdf}
                      onChange={(e) => setMaxDiscountCdf(e.target.value)}
                      placeholder="Ex: 5000"
                      className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Usage limits */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Limite d’utilisations totale
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={globalUsageLimit}
                    onChange={(e) => setGlobalUsageLimit(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Limite par passager
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={perUserLimit}
                    onChange={(e) => setPerUserLimit(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Date de début</label>
                  <input
                    type="date"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Date de fin</label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              {/* Eligible Services */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Services Éligibles
                </label>
                <div className="flex gap-2 flex-wrap">
                  {['TAXI', 'MOTO', 'DELIVERY', 'BUS'].map((svc) => (
                    <button
                      key={svc}
                      type="button"
                      onClick={() => toggleService(svc)}
                      className={`px-3 py-1 rounded-lg border font-semibold text-xs transition-colors ${
                        selectedServices.includes(svc)
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {svc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Eligible Cities */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Villes Éligibles
                </label>
                <div className="flex gap-2 flex-wrap">
                  {['kinshasa', 'lubumbashi', 'matadi', 'kolwezi', 'goma'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCity(c)}
                      className={`px-3 py-1 rounded-lg border font-semibold text-xs capitalize transition-colors ${
                        selectedCities.includes(c)
                          ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {submitting ? 'Création...' : 'Publier l’offre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

