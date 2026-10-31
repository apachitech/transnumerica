'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CityServiceFareFormula,
  BusRoutePriceRule,
  ExchangeRateState,
  PricingPromotion,
  PricingVersionSnapshot,
} from '@/types';
import {
  Coins,
  History,
  Calculator,
  RefreshCw,
  Sliders,
  Bus,
  Tag,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { ExchangeRateCard } from './ExchangeRateCard';
import { FareFormulasManager } from './FareFormulasManager';
import { BusRulesManager } from './BusRulesManager';
import { PromotionsManager } from './PromotionsManager';
import { PricingSimulatorCard } from './PricingSimulatorCard';
import { PricingVersionHistoryModal } from './PricingVersionHistoryModal';

export function AdminPricingDashboard() {
  const [activeTab, setActiveTab] = useState<'formulas' | 'bus' | 'promotions' | 'simulator'>('formulas');

  const [formulas, setFormulas] = useState<CityServiceFareFormula[]>([]);
  const [busRules, setBusRules] = useState<BusRoutePriceRule[]>([]);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRateState | null>(null);
  const [promotions, setPromotions] = useState<PricingPromotion[]>([]);
  const [versions, setVersions] = useState<PricingVersionSnapshot[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

  const fetchPricingData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [resFormulas, resBus, resRate, resPromos, resVersions] = await Promise.all([
        fetch('/api/admin/pricing/formulas'),
        fetch('/api/admin/pricing/bus-rules'),
        fetch('/api/admin/pricing/exchange-rate'),
        fetch('/api/admin/pricing/promotions'),
        fetch('/api/admin/pricing/versions'),
      ]);

      if (!resFormulas.ok || !resBus.ok || !resRate.ok || !resPromos.ok || !resVersions.ok) {
        throw new Error('Échec du chargement des modules tarifaires');
      }

      const dataFormulas = await resFormulas.json();
      const dataBus = await resBus.json();
      const dataRate = await resRate.json();
      const dataPromos = await resPromos.json();
      const dataVersions = await resVersions.json();

      setFormulas(dataFormulas.formulas || []);
      setBusRules(dataBus.busRules || []);
      setExchangeRate(dataRate);
      setPromotions(dataPromos.promotions || []);
      setVersions(dataVersions.versions || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPricingData();
  }, [fetchPricingData]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Coins className="w-6 h-6 text-amber-500" />
            <span>Pilotage & Régulation Tarifaire</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Formules urbaines, plafonds corridors FEC, surtensions météo, promotions et taux de change USD/CDF.
          </p>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsVersionModalOpen(true)}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
          >
            <History className="w-4 h-4 text-indigo-500" />
            <span>Versions & Diff ({versions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all ${
              activeTab === 'simulator'
                ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400/30'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Simulateur</span>
          </button>

          <button
            type="button"
            onClick={() => fetchPricingData()}
            className="p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 rounded-xl shadow-sm transition-all"
            title="Actualiser les données"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error Banner */}
      {error && !loading && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchPricingData()}
            className="px-2.5 py-1 bg-red-600 text-white rounded text-xs font-semibold"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Exchange Rate Card Banner */}
      {exchangeRate && (
        <ExchangeRateCard
          rateState={exchangeRate}
          onRateUpdated={() => {
            fetchPricingData();
            showToast('Taux de change ajusté avec succès.');
          }}
        />
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-2 pb-px text-xs sm:text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('formulas')}
          className={`py-2.5 px-3.5 rounded-t-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'formulas'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Barèmes Urbains & Majorations ({formulas.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bus')}
          className={`py-2.5 px-3.5 rounded-t-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'bus'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Bus className="w-4 h-4" />
          <span>Corridors Bus FEC ({busRules.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('promotions')}
          className={`py-2.5 px-3.5 rounded-t-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'promotions'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Codes Promo & Remises ({promotions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('simulator')}
          className={`py-2.5 px-3.5 rounded-t-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'simulator'
              ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 border-t-2 border-amber-500 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Simulateur Tarifaire</span>
        </button>
      </div>

      {/* Skeletons while loading */}
      {loading && formulas.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Active Tab Views */}
      {!loading && (
        <>
          {activeTab === 'formulas' && (
            <FareFormulasManager
              formulas={formulas}
              onFormulaUpdated={() => {
                fetchPricingData();
                showToast('Barème urbain actualisé.');
              }}
            />
          )}

          {activeTab === 'bus' && (
            <BusRulesManager
              busRules={busRules}
              onRuleUpdated={() => {
                fetchPricingData();
                showToast('Tarifs de corridor bus enregistrés.');
              }}
            />
          )}

          {activeTab === 'promotions' && (
            <PromotionsManager
              promotions={promotions}
              onPromotionsUpdated={() => {
                fetchPricingData();
              }}
            />
          )}

          {activeTab === 'simulator' && <PricingSimulatorCard />}
        </>
      )}

      {/* Version History Modal */}
      <PricingVersionHistoryModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        versions={versions}
        onRollbackSuccess={() => {
          fetchPricingData();
          setIsVersionModalOpen(false);
          showToast('Restauration (Rollback) du système tarifaire exécutée avec succès.');
        }}
      />
    </div>
  );
}

