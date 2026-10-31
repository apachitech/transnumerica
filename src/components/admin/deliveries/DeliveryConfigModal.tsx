'use client';

import React, { useState } from 'react';
import { DeliveryPricingTierConfig, ProhibitedDeliveryItem } from '@/types';
import { Settings, X, ShieldAlert, DollarSign, Check, Ban, AlertCircle } from 'lucide-react';

interface DeliveryConfigModalProps {
  pricingTiers: DeliveryPricingTierConfig[];
  prohibitedItems: ProhibitedDeliveryItem[];
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function DeliveryConfigModal({
  pricingTiers,
  prohibitedItems,
  isOpen,
  onClose,
  onRefresh,
}: DeliveryConfigModalProps) {
  const [activeTab, setActiveTab] = useState<'PRICING' | 'PROHIBITED'>('PRICING');
  const [selectedTier, setSelectedTier] = useState<DeliveryPricingTierConfig | null>(
    pricingTiers[0] || null
  );
  const [baseFareCDF, setBaseFareCDF] = useState<number>(
    selectedTier ? selectedTier.baseFareCDFMinor / 100 : 3000
  );
  const [perKmCDF, setPerKmCDF] = useState<number>(
    selectedTier ? selectedTier.perKmCDFMinor / 100 : 500
  );
  const [maxWeightKg, setMaxWeightKg] = useState<number>(
    selectedTier ? selectedTier.maxWeightKg : 0.5
  );
  const [isAvailable, setIsAvailable] = useState<boolean>(
    selectedTier ? selectedTier.isAvailable : true
  );
  const [pricingReason, setPricingReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectTier = (tier: DeliveryPricingTierConfig) => {
    setSelectedTier(tier);
    setBaseFareCDF(tier.baseFareCDFMinor / 100);
    setPerKmCDF(tier.perKmCDFMinor / 100);
    setMaxWeightKg(tier.maxWeightKg);
    setIsAvailable(tier.isAvailable);
    setFeedback(null);
    setError(null);
  };

  const handleUpdatePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier) return;
    if (pricingReason.trim().length < 5) {
      setError('Le motif de mise à jour tarifaire est obligatoire (min. 5 caractères).');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/deliveries/config/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parcelSize: selectedTier.parcelSize,
          baseFareCDFMinor: Math.round(baseFareCDF * 100),
          perKmCDFMinor: Math.round(perKmCDF * 100),
          maxWeightKg,
          isAvailable,
          reason: pricingReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la mise à jour des tarifs');

      setFeedback(`Grille tarifaire ${selectedTier.parcelSize} mise à jour avec succès.`);
      setPricingReason('');
      onRefresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleProhibited = async (item: ProhibitedDeliveryItem) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const nextState = !item.isEnforced;
      const res = await fetch('/api/admin/deliveries/config/prohibited', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          isEnforced: nextState,
          reason: `Modification de la règle [${item.name}] par l'administrateur.`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la mise à jour de la règle');

      setFeedback(`Règle "${item.name}" ${nextState ? 'activée' : 'désactivée'}.`);
      onRefresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2.5 text-blue-400">
            <Settings className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-base text-white">
              Configuration Livraison : Tarification & Sécurité
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-neutral-800 bg-neutral-950 px-5 text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab('PRICING');
              setFeedback(null);
              setError(null);
            }}
            className={`py-3 font-bold border-b-2 mr-6 transition flex items-center gap-1.5 ${
              activeTab === 'PRICING'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Grille Tarifaire par Taille ({pricingTiers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('PROHIBITED');
              setFeedback(null);
              setError(null);
            }}
            className={`py-3 font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'PROHIBITED'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>Articles Prohibés & Cadre Légal ({prohibitedItems.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {feedback && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-xs text-emerald-300 font-semibold">
              {feedback}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-xs text-red-300">
              {error}
            </div>
          )}

          {activeTab === 'PRICING' ? (
            <div className="space-y-4">
              {/* Size Tier selector cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {pricingTiers.map((tier) => (
                  <button
                    key={tier.parcelSize}
                    type="button"
                    onClick={() => handleSelectTier(tier)}
                    className={`p-2.5 rounded-lg border text-left transition ${
                      selectedTier?.parcelSize === tier.parcelSize
                        ? 'bg-blue-950/60 border-blue-500 text-white font-bold'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <span className="block text-xs text-white">{tier.parcelSize}</span>
                    <span className="text-[10px] text-neutral-400 line-clamp-1">{tier.label}</span>
                    <span className="text-[11px] font-semibold text-emerald-400 block mt-1">
                      {(tier.baseFareCDFMinor / 100).toLocaleString('fr-FR')} CDF
                    </span>
                  </button>
                ))}
              </div>

              {selectedTier && (
                <form onSubmit={handleUpdatePricing} className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Paramétrer : {selectedTier.label} ({selectedTier.parcelSize})
                    </h4>
                    <span className="text-[10px] text-neutral-400">Version v{selectedTier.version}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">
                        Tarif de base forfaitaire (CDF)
                      </label>
                      <input
                        type="number"
                        min={500}
                        step={500}
                        value={baseFareCDF}
                        onChange={(e) => setBaseFareCDF(Number(e.target.value))}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">
                        Tarif kilométrique (CDF / km)
                      </label>
                      <input
                        type="number"
                        min={100}
                        step={100}
                        value={perKmCDF}
                        onChange={(e) => setPerKmCDF(Number(e.target.value))}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">
                        Poids max conseillé (kg)
                      </label>
                      <input
                        type="number"
                        min={0.1}
                        step={0.5}
                        value={maxWeightKg}
                        onChange={(e) => setMaxWeightKg(Number(e.target.value))}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      Motif obligatoire d’actualisation des tarifs (Audit Trail) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={pricingReason}
                      onChange={(e) => setPricingReason(e.target.value)}
                      placeholder="Ex : Révision tarifaire trimestrielle, flambée du carburant..."
                      className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-xs text-white"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAvailable}
                        onChange={(e) => setIsAvailable(e.target.checked)}
                        className="rounded border-neutral-700 bg-neutral-900 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Format disponible à la commande publique</span>
                    </label>

                    <button
                      type="submit"
                      disabled={isSubmitting || pricingReason.trim().length < 5}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs transition shadow"
                    >
                      {isSubmitting ? 'Enregistrement...' : 'Enregistrer la Grille'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Tab PROHIBITED ITEMS */
            <div className="space-y-3">
              <p className="text-xs text-neutral-400">
                Articles strictement interdits sur le réseau de livraison Transnumerica conformément aux lois et arrêtés de la République Démocratique du Congo.
              </p>

              <div className="space-y-2">
                {prohibitedItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            item.isEnforced
                              ? 'bg-red-600 text-white'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}>
                            {item.category}
                          </span>
                          <h4 className="font-bold text-xs text-white">{item.name}</h4>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-1">{item.legalNotice}</p>
                        <p className="text-[10px] text-amber-400 mt-0.5">Sanction : {item.penaltyDescription}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleProhibited(item)}
                        disabled={isSubmitting}
                        className={`px-3 py-1 rounded text-xs font-bold transition shrink-0 ${
                          item.isEnforced
                            ? 'bg-red-950 text-red-400 border border-red-500/40 hover:bg-red-900'
                            : 'bg-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {item.isEnforced ? 'Règle Active' : 'Désactivée'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-950 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition"
          >
            Fermer la fenêtre
          </button>
        </div>
      </div>
    </div>
  );
}

