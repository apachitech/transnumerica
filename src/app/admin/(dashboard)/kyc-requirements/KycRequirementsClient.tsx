'use client';

import React, { useState, useEffect } from 'react';
import {
  KycRequirementItem,
  KycRequirementVersion,
  KycApplicableProviderType,
  KycImpactAnalysisResult,
  KycComplianceMetrics,
} from '@/types';
import {
  ShieldCheck,
  ShieldAlert,
  Bike,
  Car,
  Bus,
  Users,
  Search,
  Filter,
  Eye,
  Edit3,
  History,
  Send,
  RotateCcw,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  Smartphone,
  Download,
  Upload,
  ChevronRight,
  Info,
  Check,
  X,
  HelpCircle,
  Lock,
} from 'lucide-react';

const CITIES = ['ALL', 'Kinshasa', 'Lubumbashi', 'Kolwezi', 'Matadi', 'Goma'];

export function KycRequirementsClient() {
  const [selectedCity, setSelectedCity] = useState<string>('Kinshasa');
  const [activeTab, setActiveTab] = useState<'MATRIX' | 'VERSIONS' | 'COMPLIANCE' | 'PREVIEW'>('MATRIX');
  const [previewProviderType, setPreviewProviderType] = useState<KycApplicableProviderType>('MOTO');
  
  // Data State
  const [items, setItems] = useState<KycRequirementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState<KycRequirementVersion[]>([]);
  const [impactAnalysis, setImpactAnalysis] = useState<KycImpactAnalysisResult | null>(null);
  const [compliance, setCompliance] = useState<KycComplianceMetrics | null>(null);
  
  // Modals & Drawers
  const [editingItem, setEditingItem] = useState<KycRequirementItem | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishReason, setPublishReason] = useState('');
  const [impactPolicy, setImpactPolicy] = useState<'GRANDFATHER' | 'GRACE_PERIOD' | 'IMMEDIATE_SUSPEND'>('GRACE_PERIOD');
  const [gracePeriodDays, setGracePeriodDays] = useState(21);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadMatrix = async (city = selectedCity) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/kyc-requirements?city=${city}`);
      const data = await res.json();
      if (res.ok && data.items) {
        setItems(data.items);
      }
    } catch (err: any) {
      setErrorMessage('Erreur lors du chargement de la matrice');
    } finally {
      setLoading(false);
    }
  };

  const loadVersions = async () => {
    try {
      const res = await fetch('/api/admin/kyc-requirements/publish');
      const data = await res.json();
      if (res.ok && data.versions) {
        setVersions(data.versions);
      }
    } catch {}
  };

  const loadCompliance = async (city = selectedCity) => {
    try {
      const res = await fetch(`/api/admin/kyc-requirements/compliance?city=${city}`);
      const data = await res.json();
      if (res.ok && data.metrics) {
        setCompliance(data.metrics);
      }
    } catch {}
  };

  useEffect(() => {
    loadMatrix(selectedCity);
    loadVersions();
    loadCompliance(selectedCity);
  }, [selectedCity]);

  // Open impact modal and trigger impact calculation
  const handleOpenPublishModal = async () => {
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/admin/kyc-requirements/impact?city=${selectedCity}`);
      const data = await res.json();
      if (res.ok && data.impact) {
        setImpactAnalysis(data.impact);
        setShowPublishModal(true);
      }
    } catch (err: any) {
      setErrorMessage('Impossible de calculer l’analyse d’impact.');
    }
  };

  // Perform publish
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishReason || publishReason.length < 5) {
      setErrorMessage('Une justification détaillée est obligatoire pour la traçabilité.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/admin/kyc-requirements/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: selectedCity,
          publishReason,
          impactPolicy,
          gracePeriodDays,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la publication');

      showToast(`🎉 Version v${data.version.versionNumber} publiée et déployée en direct !`);
      setShowPublishModal(false);
      setPublishReason('');
      loadMatrix();
      loadVersions();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rollback handler
  const handleRollback = async (verNumber: number) => {
    const reason = window.prompt(`Confirmez le Rollback vers la version v${verNumber} en indiquant le motif :`);
    if (!reason) return;

    try {
      const res = await fetch('/api/admin/kyc-requirements/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetVersionNumber: verNumber, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors du rollback');

      showToast(`Rétablissement de la version v${verNumber} effectué avec succès.`);
      loadMatrix();
      loadVersions();
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    }
  };

  // Reset city override to default
  const handleResetCityOverride = async () => {
    if (!window.confirm(`Voulez-vous réinitialiser toutes les personnalisations de ${selectedCity} vers les valeurs nationales par défaut ?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/kyc-requirements/overrides?city=${selectedCity}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      showToast(`Exigences de ${selectedCity} réinitialisées vers le jeu national.`);
      loadMatrix();
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.labels.fr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-neutral-900 border-2 border-accent-400 text-white shadow-2xl flex items-center gap-2.5 text-xs font-black animate-in slide-in-from-top-3"
        >
          <Sparkles className="w-4 h-4 text-accent-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 sm:p-6 bg-neutral-900 border border-neutral-800 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-accent-500/20 text-accent-300 font-mono text-2xs font-black border border-accent-500/30">
              MODULE SÉCURITÉ CONGOLAISE
            </span>
            <span className="text-2xs text-neutral-400 font-bold">Sans redéploiement • Zéro hardcode</span>
          </div>
          <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight">
            Gestionnaire des Exigences KYC par Ville & Type
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            Configurez dynamiquement les pièces et validations pour Motos Wewa, Taxis et Opérateurs de Navettes.
            Les formulaires d’onboarding et les règles d’examen s’adaptent automatiquement en temps réel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleOpenPublishModal}
            className="px-4 py-2.5 bg-accent-500 hover:bg-accent-400 text-neutral-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-accent-500/20 transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Publier Version</span>
          </button>
        </div>
      </div>

      {/* Main Controls: City Selector & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-800">
        {/* City Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-2xs text-neutral-400 font-bold uppercase mr-1">Ville :</span>
          {CITIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCity(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCity === c
                  ? 'bg-neutral-100 text-neutral-950 shadow font-black'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {c === 'ALL' ? 'Toutes Villes (Défaut)' : c}
            </button>
          ))}
          {selectedCity !== 'ALL' && (
            <button
              type="button"
              onClick={handleResetCityOverride}
              title="Réinitialiser vers les paramètres nationaux par défaut"
              className="px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-amber-400 text-2xs font-bold flex items-center gap-1 transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-2xl border border-neutral-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('MATRIX')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'MATRIX' ? 'bg-neutral-800 text-white font-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Matrice Exigences
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PREVIEW')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'PREVIEW' ? 'bg-neutral-800 text-white font-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Aperçu Chauffeur (360px)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('VERSIONS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'VERSIONS' ? 'bg-neutral-800 text-white font-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Versions & Rollback
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('COMPLIANCE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'COMPLIANCE' ? 'bg-neutral-800 text-white font-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Rapport Conformité
          </button>
        </div>
      </div>

      {/* ---------------- TAB 1: REQUIREMENT MATRIX VIEW ---------------- */}
      {activeTab === 'MATRIX' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par libellé ou code (ex: Carte Rose, Permis)..."
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-accent-500"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white"
            >
              <option value="ALL">Toutes catégories</option>
              <option value="IDENTITY">Identité & Vivacité</option>
              <option value="DRIVING">Permis & Aptitude</option>
              <option value="VEHICLE">Véhicule & Assurance</option>
              <option value="COMPANY">Société & Entreprise</option>
              <option value="FINANCIAL">Paiement & Mobile Money</option>
              <option value="SAFETY">Sécurité & Charte</option>
            </select>
          </div>

          {/* Matrix Table */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 uppercase text-2xs font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Exigence / Document</th>
                    <th className="py-3.5 px-3 text-center">
                      <span className="flex items-center justify-center gap-1">
                        <Bike className="w-3.5 h-3.5 text-accent-400" /> Moto Wewa
                      </span>
                    </th>
                    <th className="py-3.5 px-3 text-center">
                      <span className="flex items-center justify-center gap-1">
                        <Car className="w-3.5 h-3.5 text-blue-400" /> Taxi Auto
                      </span>
                    </th>
                    <th className="py-3.5 px-3 text-center">
                      <span className="flex items-center justify-center gap-1">
                        <Bus className="w-3.5 h-3.5 text-emerald-400" /> Navette (Opérateur)
                      </span>
                    </th>
                    <th className="py-3.5 px-3 text-center">
                      <span className="flex items-center justify-center gap-1">
                        <Users className="w-3.5 h-3.5 text-amber-400" /> Chauffeur Navette
                      </span>
                    </th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80">
                  {filteredItems.map((item) => {
                    const isOverridden = item.isCityOverride;

                    return (
                      <tr key={item.id} className="hover:bg-neutral-850/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-start gap-2">
                            {item.isCoreGuardrail && (
                              <span title="Garde-fou national inviolable">
                                <Lock className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                              </span>
                            )}
                            <div>
                              <strong className="block font-bold text-white text-xs">
                                {item.labels.fr}
                              </strong>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-2xs text-neutral-500">{item.code}</span>
                                {item.isLegalPreLaunchConfirmationNeeded && (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 text-[10px] font-bold border border-amber-500/20">
                                    À valider légalement
                                  </span>
                                )}
                                {isOverridden && (
                                  <span className="px-1.5 py-0.2 rounded bg-accent-500/10 text-accent-300 text-[10px] font-bold border border-accent-500/20">
                                    Spécifique {selectedCity}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* MOTO Cell */}
                        <td className="py-3.5 px-3 text-center">
                          <StatusBadge type={item.applicability.MOTO} />
                        </td>

                        {/* CAR Cell */}
                        <td className="py-3.5 px-3 text-center">
                          <StatusBadge type={item.applicability.CAR} />
                        </td>

                        {/* SHUTTLE OPERATOR Cell */}
                        <td className="py-3.5 px-3 text-center">
                          <StatusBadge type={item.applicability.SHUTTLE_OPERATOR} />
                        </td>

                        {/* SHUTTLE DRIVER Cell */}
                        <td className="py-3.5 px-3 text-center">
                          <StatusBadge type={item.applicability.SHUTTLE_DRIVER} />
                        </td>

                        {/* Action Cell */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setEditingItem(item)}
                            className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-2xs font-bold transition-all"
                          >
                            Éditer règles
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- TAB 2: LIVE ONBOARDING WIZARD PREVIEW (360px FRAME) ---------------- */}
      {activeTab === 'PREVIEW' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-neutral-900 border border-neutral-800 rounded-2xl">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-accent-400" />
              <span className="text-xs font-bold text-white">
                Simulation Live de l’Assistant d’Enrôlement Chauffeur à {selectedCity} (Écran 360px)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold">
              {(['MOTO', 'CAR', 'SHUTTLE_OPERATOR'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setPreviewProviderType(t)}
                  className={`px-3 py-1 rounded-lg text-2xs font-bold transition-all ${
                    previewProviderType === t ? 'bg-accent-500 text-neutral-950 font-black' : 'bg-neutral-800 text-neutral-300'
                  }`}
                >
                  {t === 'MOTO' && 'Moto Wewa'}
                  {t === 'CAR' && 'Taxi Auto'}
                  {t === 'SHUTTLE_OPERATOR' && 'Société Navette'}
                </button>
              ))}
            </div>
          </div>

          {/* 360px Mobile Frame Simulator */}
          <div className="flex justify-center p-4">
            <div className="w-[360px] bg-neutral-950 border-4 border-neutral-800 rounded-[36px] p-4 shadow-2xl space-y-4 text-white">
              {/* Notch */}
              <div className="w-24 h-4 bg-neutral-800 rounded-full mx-auto mb-2" />

              <div className="text-center pb-2 border-b border-neutral-800">
                <span className="text-2xs text-accent-400 font-bold uppercase tracking-wider block">
                  Enrôlement Partenaire • {selectedCity}
                </span>
                <h4 className="text-sm font-black text-white">
                  Pièces Requises ({previewProviderType})
                </h4>
              </div>

              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1 text-xs">
                {items
                  .filter((i) => i.applicability[previewProviderType] !== 'NOT_APPLICABLE' && !i.archived)
                  .map((i) => (
                    <div key={i.id} className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-xs font-bold text-white">{i.labels.fr}</strong>
                        <span
                          className={`text-[10px] font-black px-1.5 py-0.2 rounded ${
                            i.applicability[previewProviderType] === 'MANDATORY'
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          {i.applicability[previewProviderType] === 'MANDATORY' ? 'Obligatoire' : 'Conditionnel'}
                        </span>
                      </div>
                      <p className="text-2xs text-neutral-400">{i.helpTexts.fr}</p>
                      {i.plainFrenchConditionPreview && (
                        <p className="text-2xs text-amber-300/90 italic">ℹ️ {i.plainFrenchConditionPreview}</p>
                      )}
                    </div>
                  ))}
              </div>

              <button
                type="button"
                className="w-full py-2.5 bg-accent-500 text-neutral-950 font-black rounded-xl text-xs shadow-md"
              >
                Continuer l’Enrôlement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- TAB 3: VERSIONS HISTORY & ONE-CLICK ROLLBACK ---------------- */}
      {activeTab === 'VERSIONS' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="text-base font-black text-white">Historique Immuable des Versions KYC</h3>
                <p className="text-xs text-neutral-400">
                  Chaque publication fige un instantané complet vérifié par signature et chaînage dans le journal d'audit.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {versions.map((ver) => (
                <div
                  key={ver.id}
                  className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white font-mono bg-neutral-800 px-2 py-0.5 rounded">
                        v{ver.versionNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-black text-2xs ${
                          ver.status === 'PUBLISHED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {ver.status === 'PUBLISHED' ? 'Actuelle en Ligne' : ver.status}
                      </span>
                      <span className="text-neutral-400 text-2xs font-mono">
                        {new Date(ver.createdAt).toLocaleDateString('fr-CD')}
                      </span>
                    </div>
                    <p className="text-neutral-300 font-medium">{ver.publishReason}</p>
                    <span className="text-2xs text-neutral-500 block">
                      Auteur : {ver.publishedBy} {ver.publishedByEmail ? `(${ver.publishedByEmail})` : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {ver.status !== 'PUBLISHED' && (
                      <button
                        type="button"
                        onClick={() => handleRollback(ver.versionNumber)}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-neutral-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restaurer v{ver.versionNumber}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- TAB 4: COMPLIANCE METRICS ---------------- */}
      {activeTab === 'COMPLIANCE' && compliance && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl">
              <span className="text-2xs text-neutral-400 uppercase font-bold block">Prestataires Actifs</span>
              <strong className="text-xl font-black text-white">{compliance.totalProviders}</strong>
            </div>
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl">
              <span className="text-2xs text-emerald-400 uppercase font-bold block">Conformes & Agréés</span>
              <strong className="text-xl font-black text-emerald-400">{compliance.compliantApprovedCount}</strong>
            </div>
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl">
              <span className="text-2xs text-amber-400 uppercase font-bold block">Expirant sous 30 Jours</span>
              <strong className="text-xl font-black text-amber-400">{compliance.expiringIn30DaysCount}</strong>
            </div>
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl">
              <span className="text-2xs text-neutral-400 uppercase font-bold block">Temps Moyen d'Examen SLA</span>
              <strong className="text-xl font-black text-accent-400">{compliance.averageReviewTimeHours} h</strong>
            </div>
          </div>

          <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Principaux Motifs de Rejet Dossier à {selectedCity}
            </h4>
            <div className="space-y-2 text-xs">
              {compliance.topRejectionReasons.map((r, i) => (
                <div key={i} className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between">
                  <span className="text-neutral-300 font-medium">{r.reason}</span>
                  <span className="font-bold text-amber-400">{r.count} dossiers</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- ITEM EDITOR SIDE DRAWER ---------------- */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-neutral-900 border-l border-neutral-800 h-full overflow-y-auto p-5 sm:p-6 space-y-5 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <span className="font-mono text-2xs text-accent-400 font-black">{editingItem.code}</span>
                <h3 className="text-base font-black text-white">{editingItem.labels.fr}</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick applicability toggles */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-neutral-300 block">Applicabilité par Type de Transporteur</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(['MOTO', 'CAR', 'SHUTTLE_OPERATOR', 'SHUTTLE_DRIVER'] as const).map((t) => (
                  <div key={t} className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-1">
                    <span className="font-bold text-neutral-300 block text-2xs uppercase">
                      {t === 'MOTO' && 'Moto Wewa'}
                      {t === 'CAR' && 'Taxi Auto'}
                      {t === 'SHUTTLE_OPERATOR' && 'Opérateur Navette'}
                      {t === 'SHUTTLE_DRIVER' && 'Chauffeur Navette'}
                    </span>
                    <select
                      value={editingItem.applicability[t]}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setEditingItem({
                          ...editingItem,
                          applicability: { ...editingItem.applicability, [t]: val },
                        });
                      }}
                      className="w-full px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-xs text-white"
                    >
                      <option value="MANDATORY">Obligatoire</option>
                      <option value="CONDITIONAL">Conditionnel</option>
                      <option value="OPTIONAL">Optionnel</option>
                      <option value="NOT_APPLICABLE">Non applicable</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Conditional Rule Builder */}
            <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-300">Règle Conditionnelle (Visuelle)</span>
                <span className="text-2xs text-accent-400 font-bold">No-Code</span>
              </div>
              <p className="text-2xs text-neutral-400 leading-relaxed">
                Aperçu clair en français :
              </p>
              <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-amber-300 font-mono">
                {editingItem.plainFrenchConditionPreview || 'Aucune condition spécifique définie.'}
              </div>
            </div>

            {/* Validation Rules */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-neutral-300 block">Règles d'Expiration & Rappels SMS</span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-2xs text-neutral-400 mb-1">Validité minimale soumission</label>
                  <input
                    type="number"
                    value={editingItem.validityRules.minRemainingDaysAtSubmission}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        validityRules: {
                          ...editingItem.validityRules,
                          minRemainingDaysAtSubmission: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-2xs text-neutral-400 mb-1">Conséquence expiration</label>
                  <select
                    value={editingItem.validityRules.expiryConsequence}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        validityRules: {
                          ...editingItem.validityRules,
                          expiryConsequence: e.target.value as any,
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                  >
                    <option value="WARN_ONLY">Avertissement simple</option>
                    <option value="BLOCK_TRIPS">Bloquer nouvelles courses</option>
                    <option value="AUTO_SUSPEND">Suspension automatique</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-neutral-800 flex gap-2">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/admin/kyc-requirements/${editingItem.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        ...editingItem,
                        reason: 'Mise à jour des critères par l’administrateur',
                      }),
                    });
                    if (res.ok) {
                      showToast('Critères enregistrés dans le brouillon.');
                      setEditingItem(null);
                      loadMatrix();
                    } else {
                      const err = await res.json();
                      alert(err.error || 'Erreur');
                    }
                  } catch (e: any) {
                    alert(e.message);
                  }
                }}
                className="flex-1 py-3 bg-accent-500 hover:bg-accent-400 text-neutral-950 font-black rounded-xl text-xs transition-all shadow-md"
              >
                Enregistrer les Modifications
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- TWO-STEP PUBLISH & IMPACT MODAL ---------------- */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-5 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-accent-400" />
                <h3 className="text-base font-black text-white">Publication Officielle des Exigences KYC</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Impact Analysis Summary Box */}
            {impactAnalysis && (
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 font-bold uppercase text-2xs">Analyse d’Impact Automatique</span>
                  <span className="text-accent-400 font-bold">Ville : {selectedCity}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-2xs">
                  <div>Chauffeurs actifs analysés : <strong>{impactAnalysis.totalActiveProvidersChecked}</strong></div>
                  <div>Comptes impactés : <strong className="text-amber-400">{impactAnalysis.affectedProvidersCount}</strong></div>
                </div>
              </div>
            )}

            <form onSubmit={handlePublish} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-bold mb-1.5">
                  Politique de transition pour les prestataires actuellement approuvés
                </label>
                <select
                  value={impactPolicy}
                  onChange={(e) => setImpactPolicy(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                >
                  <option value="GRACE_PERIOD">Délai de grâce avec rappel SMS/WhatsApp (Recommandé)</option>
                  <option value="GRANDFATHER">Clause du grand-père (Maintien des droits acquis)</option>
                  <option value="IMMEDIATE_SUSPEND">Suspension immédiate jusqu’à nouvelle soumission</option>
                </select>
              </div>

              {impactPolicy === 'GRACE_PERIOD' && (
                <div>
                  <label className="block text-neutral-300 font-bold mb-1.5">Durée du délai de grâce (Jours)</label>
                  <input
                    type="number"
                    value={gracePeriodDays}
                    onChange={(e) => setGracePeriodDays(parseInt(e.target.value) || 21)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-neutral-300 font-bold mb-1.5">
                  Motif obligatoire pour le journal d'audit append-only
                </label>
                <textarea
                  rows={3}
                  required
                  value={publishReason}
                  onChange={(e) => setPublishReason(e.target.value)}
                  placeholder="Ex: Homologation des directives de l'Hôtel de Ville de Kinshasa et renforcement du contrôle des permis de conduire."
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-accent-500"
                />
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-2xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="pt-3 border-t border-neutral-800 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold rounded-xl text-xs transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-accent-500 hover:bg-accent-400 text-neutral-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-accent-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Publication en cours...' : 'Confirmer & Publier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ type }: { type: string }) {
  if (type === 'MANDATORY') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
        <Check className="w-2.5 h-2.5" /> Obligatoire
      </span>
    );
  }
  if (type === 'CONDITIONAL') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
        Conditionnel
      </span>
    );
  }
  if (type === 'OPTIONAL') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-neutral-800 text-neutral-400">
        Optionnel
      </span>
    );
  }
  return <span className="text-neutral-600 text-[10px]">—</span>;
}

