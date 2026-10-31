'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bike,
  Car,
  Bus,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Camera,
  Upload,
  ShieldCheck,
  ShieldAlert,
  FileText,
  User,
  CreditCard,
  Check,
  RefreshCw,
  Eye,
  Info,
} from 'lucide-react';
import { ProviderAccount, ProviderType, ProviderVerificationStatus } from '@/types';

export default function DriverOnboardingPage() {
  const router = useRouter();
  const [provider, setProvider] = useState<ProviderAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form step
  const [step, setStep] = useState<number>(1);
  const totalSteps = 5;

  // Form State
  const [providerType, setProviderType] = useState<ProviderType>('MOTO');
  const [city, setCity] = useState('Kinshasa');
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('1994-06-15');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [residentialAddress, setResidentialAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Company Profile (for SHUTTLE)
  const [companyName, setCompanyName] = useState('');
  const [rccm, setRccm] = useState('');
  const [idNat, setIdNat] = useState('');
  const [nif, setNif] = useState('');
  const [transportLic, setTransportLic] = useState('');
  const [repName, setRepName] = useState('');
  const [repPhone, setRepPhone] = useState('');

  // Documents State
  const [idNumber, setIdNumber] = useState('');
  const [idExpiry, setIdExpiry] = useState('2028-12-31');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('2028-05-20');
  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const [livenessPassed, setLivenessPassed] = useState(false);

  // Vehicle
  const [plate, setPlate] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [year, setYear] = useState('2022');
  const [seats, setSeats] = useState(1);
  const [hasHelmet, setHasHelmet] = useState(true);
  const [hasAc, setHasAc] = useState(false);

  // Payout
  const [payoutType, setPayoutType] = useState<'MOBILE_MONEY' | 'BANK'>('MOBILE_MONEY');
  const [payoutProvider, setPayoutProvider] = useState<'MPESA' | 'AIRTEL' | 'ORANGE' | 'AFRICELL' | 'RAWBANK'>('MPESA');
  const [payoutNumber, setPayoutNumber] = useState('');
  const [payoutName, setPayoutName] = useState('');

  // Consent
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [safetyCodeAccepted, setSafetyCodeAccepted] = useState(false);
  const [dataConsentAccepted, setDataConsentAccepted] = useState(false);

  // Fetch active session or draft
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/driver/onboarding');
        if (!res.ok) {
          // If not authenticated or draft, redirect to login
          if (res.status === 401 || res.status === 404) {
            router.push('/driver/login');
            return;
          }
        }
        const data = await res.json();
        if (data.provider) {
          const p: ProviderAccount = data.provider;
          setProvider(p);
          setProviderType(p.providerType);
          setCity(p.city);

          if (p.individualProfile) {
            setFullName(p.individualProfile.fullName || '');
            setBirthDate(p.individualProfile.birthDate || '1994-06-15');
            setGender(p.individualProfile.gender || 'MALE');
            setResidentialAddress(p.individualProfile.residentialAddress || '');
            setLandmark(p.individualProfile.landmark || '');
            setEmergencyName(p.individualProfile.emergencyContactName || '');
            setEmergencyPhone(p.individualProfile.emergencyContactPhone || '');
            setHasHelmet(p.individualProfile.hasPassengerHelmet ?? true);
          }

          if (p.companyProfile) {
            setCompanyName(p.companyProfile.companyName || '');
            setRccm(p.companyProfile.rccm || '');
            setIdNat(p.companyProfile.idNat || '');
            setNif(p.companyProfile.nif || '');
            setTransportLic(p.companyProfile.transportLicenseNumber || '');
            setRepName(p.companyProfile.legalRepName || '');
            setRepPhone(p.companyProfile.legalRepPhone || '');
          }

          if (p.vehicles && p.vehicles.length > 0) {
            const v = p.vehicles[0];
            setPlate(v.plate);
            setMake(v.make);
            setModel(v.model);
            setColor(v.color);
            setYear(v.year?.toString() || '2022');
            setSeats(v.capacitySeats);
            setHasAc(v.hasAc || false);
          }

          if (p.payoutAccounts && p.payoutAccounts.length > 0) {
            const pay = p.payoutAccounts[0];
            setPayoutType(pay.type);
            setPayoutProvider(pay.provider as any);
            setPayoutNumber(pay.accountNumber);
            setPayoutName(pay.accountName);
          }
        }
      } catch (err) {
        console.error('Erreur chargement:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  // Autosave draft handler
  const saveDraft = async (showToast = true) => {
    setSaving(true);
    setErrorMessage(null);

    try {
      const payload = {
        providerId: provider?.id,
        providerType,
        role: providerType === 'MOTO' ? 'DRIVER_MOTO' : providerType === 'CAR' ? 'DRIVER_CAR' : 'SHUTTLE_OPERATOR',
        city,
        action: 'DRAFT',
        individualProfile: {
          fullName,
          birthDate,
          gender,
          residentialAddress,
          landmark,
          emergencyContactName: emergencyName,
          emergencyContactPhone: emergencyPhone,
          hasPassengerHelmet: hasHelmet,
        },
        companyProfile:
          providerType === 'SHUTTLE'
            ? {
                companyName,
                rccm,
                idNat,
                nif,
                transportLicenseNumber: transportLic,
                legalRepName: repName,
                legalRepPhone: repPhone,
                city,
              }
            : undefined,
        vehicle: {
          type: providerType === 'MOTO' ? 'MOTO' : providerType === 'CAR' ? 'CAR' : 'MINIBUS',
          plate: plate || 'KN-TEMP-01',
          make,
          model,
          color,
          year: parseInt(year) || 2022,
          capacitySeats: providerType === 'MOTO' ? 1 : seats,
          hasAc,
          carteRoseNumber: 'CR-TEMP',
          isOwner: true,
        },
        payout: {
          type: payoutType,
          provider: payoutProvider,
          accountNumber: payoutNumber || '+243810001001',
          accountName: payoutName || fullName,
        },
        consent: {
          termsAccepted,
          safetyCodeAccepted,
          dataConsentAccepted,
        },
      };

      const res = await fetch('/api/driver/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la sauvegarde');

      setProvider(data.provider);
      if (showToast) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Final submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted || !safetyCodeAccepted || !dataConsentAccepted) {
      setErrorMessage('Vous devez accepter les conditions, le code de conduite et le traitement des données.');
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      const payload = {
        providerId: provider?.id,
        providerType,
        role: providerType === 'MOTO' ? 'DRIVER_MOTO' : providerType === 'CAR' ? 'DRIVER_CAR' : 'SHUTTLE_OPERATOR',
        city,
        action: 'SUBMIT',
        individualProfile: {
          fullName,
          birthDate,
          gender,
          residentialAddress,
          landmark,
          emergencyContactName: emergencyName,
          emergencyContactPhone: emergencyPhone,
          hasPassengerHelmet: hasHelmet,
        },
        companyProfile:
          providerType === 'SHUTTLE'
            ? {
                companyName,
                rccm,
                idNat,
                nif,
                transportLicenseNumber: transportLic,
                legalRepName: repName,
                legalRepPhone: repPhone,
                city,
              }
            : undefined,
        vehicle: {
          type: providerType === 'MOTO' ? 'MOTO' : providerType === 'CAR' ? 'CAR' : 'MINIBUS',
          plate,
          make,
          model,
          color,
          year: parseInt(year) || 2022,
          capacitySeats: providerType === 'MOTO' ? 1 : seats,
          hasAc,
          carteRoseNumber: 'CR-OFFICIEL',
          isOwner: true,
        },
        payout: {
          type: payoutType,
          provider: payoutProvider,
          accountNumber: payoutNumber,
          accountName: payoutName || fullName,
        },
        consent: {
          termsAccepted,
          safetyCodeAccepted,
          dataConsentAccepted,
        },
      };

      const res = await fetch('/api/driver/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la soumission');

      setProvider(data.provider);
      setStep(6); // Step 6 = Status display screen
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Perform liveness check mock
  const triggerLivenessCheck = () => {
    setSelfieCaptured(false);
    setLivenessPassed(false);
    setTimeout(() => {
      setSelfieCaptured(true);
      setTimeout(() => {
        setLivenessPassed(true);
      }, 700);
    }, 800);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 text-white">
        <RefreshCw className="w-8 h-8 text-accent-500 animate-spin mb-4" />
        <p className="text-sm text-neutral-400">Chargement de votre dossier KYC...</p>
      </div>
    );
  }

  // If provider is already in a non-draft status or on step 6, show status dashboard
  const isStatusScreen =
    step === 6 ||
    (provider && ['SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED', 'INFO_REQUIRED'].includes(provider.status));

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center p-3 sm:p-6 pb-20">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Top Bar with Autosave & City */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-accent-500/20 text-accent-300 font-bold border border-accent-500/30">
              {providerType === 'MOTO' && 'Moto Wewa'}
              {providerType === 'CAR' && 'Taxi Auto'}
              {providerType === 'SHUTTLE' && 'Opérateur Navette'}
            </span>
            <span className="text-neutral-400 font-medium">Ville : {city}</span>
          </div>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                <Check className="w-3.5 h-3.5" /> Enregistré
              </span>
            )}
            <button
              type="button"
              onClick={() => saveDraft(true)}
              disabled={saving}
              className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-bold transition-all disabled:opacity-50"
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="block font-bold mb-0.5">Erreur de validation</strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* STEP STATUS TRACKER (When submitted, in review, approved or rejected) */}
        {isStatusScreen ? (
          <div className="space-y-6 text-center py-4">
            {/* Status Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-neutral-950 border border-neutral-800 shadow-xl">
              {provider?.status === 'APPROVED' && <CheckCircle2 className="w-10 h-10 text-emerald-400" />}
              {provider?.status === 'IN_REVIEW' && <Clock className="w-10 h-10 text-amber-400" />}
              {provider?.status === 'INFO_REQUIRED' && <Info className="w-10 h-10 text-cyan-400" />}
              {provider?.status === 'REJECTED' && <AlertCircle className="w-10 h-10 text-red-400" />}
              {provider?.status === 'SUSPENDED' && <ShieldAlert className="w-10 h-10 text-red-500" />}
              {(!provider || provider.status === 'DRAFT') && <FileText className="w-10 h-10 text-accent-400" />}
            </div>

            <div>
              <span className="text-2xs font-bold uppercase tracking-widest text-neutral-500 block mb-1">
                Statut du Dossier KYC
              </span>
              <h2 className="text-2xl font-black text-white">
                {provider?.status === 'APPROVED' && 'Dossier Approuvé — Vous pouvez rouler !'}
                {provider?.status === 'IN_REVIEW' && 'Dossier en Cours de Révision Administrative'}
                {provider?.status === 'INFO_REQUIRED' && 'Informations Complémentaires Requises'}
                {provider?.status === 'REJECTED' && 'Dossier Non Conforme'}
                {provider?.status === 'SUSPENDED' && 'Compte Prestataire Suspendu'}
                {(!provider || provider.status === 'DRAFT') && 'Dossier en Brouillon'}
              </h2>
            </div>

            {/* Explanation box */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 text-left text-xs space-y-3">
              {provider?.status === 'APPROVED' && (
                <p className="text-emerald-300 leading-relaxed font-medium">
                  Votre identité, votre permis et les pièces de votre véhicule ont été validés par l’administration
                  Transnumerica. Vous êtes habilité(e) à prendre des courses en ligne.
                </p>
              )}
              {provider?.status === 'IN_REVIEW' && (
                <div className="text-neutral-300 space-y-2">
                  <p className="leading-relaxed">
                    Votre dossier a été transmis à la cellule de vérification de {city}. Nos agents vérifient
                    actuellement la netteté des pièces et la validité auprès des services de transport.
                  </p>
                  <p className="text-amber-400 font-semibold">
                    Délai SLA garanti : Réponse sous 24h ouvrées. Vous recevrez une confirmation par SMS.
                  </p>
                </div>
              )}
              {provider?.status === 'INFO_REQUIRED' && (
                <div className="text-cyan-300 space-y-2">
                  <strong className="block font-bold">Consignes de l’administrateur :</strong>
                  <p className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800 text-cyan-200">
                    {provider.missingInfoNotes || 'Veuillez téléverser une photo plus nette de votre carte rose.'}
                  </p>
                </div>
              )}
              {provider?.status === 'REJECTED' && (
                <div className="text-red-300 space-y-2">
                  <strong className="block font-bold">Motif du rejet :</strong>
                  <p className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-200">
                    {provider.rejectionReason || 'Documents illisibles ou incompatibles avec la législation RDC.'}
                  </p>
                </div>
              )}
              {provider?.status === 'SUSPENDED' && (
                <div className="text-red-400 space-y-2">
                  <strong className="block font-bold">Raison de la suspension :</strong>
                  <p className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-200">
                    {provider.suspensionReason || 'Expiration d’un document obligatoire.'}
                  </p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {provider?.status === 'APPROVED' ? (
                <button
                  type="button"
                  onClick={() => router.push('/driver')}
                  className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Ouvrir mon Cockpit de Courses</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-sm transition-all"
                >
                  Mettre à jour ou corriger mes pièces
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ONBOARDING WIZARD STEPS */
          <div>
            {/* Step Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-400 mb-2">
                <span>Étape {step} sur {totalSteps}</span>
                <span>
                  {step === 1 && 'Identité du Prestataire'}
                  {step === 2 && 'Documents Officiels & Vivacité'}
                  {step === 3 && 'Véhicule & Sécurité'}
                  {step === 4 && 'Paiements Mobile Money'}
                  {step === 5 && 'Charte & Consentement'}
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-500 transition-all duration-300"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* STEP 1: IDENTITÉ */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-base font-black text-white">
                  {providerType === 'SHUTTLE' ? 'Identité de l’Entreprise de Transport' : 'Identité Personnelle du Chauffeur'}
                </h3>

                {providerType === 'SHUTTLE' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Raison sociale (Nom de la société / coopérative)
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Ex: Kinshasa Express Trans SARL"
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-300 mb-1">Numéro RCCM</label>
                        <input
                          type="text"
                          value={rccm}
                          onChange={(e) => setRccm(e.target.value)}
                          placeholder="CD/KIN/RCCM/..."
                          className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-neutral-300 mb-1">Identification Nat. (ID NAT)</label>
                        <input
                          type="text"
                          value={idNat}
                          onChange={(e) => setIdNat(e.target.value)}
                          placeholder="01-83-..."
                          className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-neutral-300 mb-1">Numéro NIF (Impôt)</label>
                        <input
                          type="text"
                          value={nif}
                          onChange={(e) => setNif(e.target.value)}
                          placeholder="A193..."
                          className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Nom complet du Gérant ou Représentant Légal
                      </label>
                      <input
                        type="text"
                        value={repName}
                        onChange={(e) => setRepName(e.target.value)}
                        placeholder="Nom, Post-nom et Prénom"
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Nom complet (tel que sur la pièce d’identité)
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ex: Dieudonné Mwamba Kankonde"
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-300 mb-1">Date de naissance</label>
                        <input
                          type="date"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-neutral-300 mb-1">Genre</label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value as any)}
                          className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white"
                        >
                          <option value="MALE">Homme</option>
                          <option value="FEMALE">Femme</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">Adresse résidentielle</label>
                      <input
                        type="text"
                        value={residentialAddress}
                        onChange={(e) => setResidentialAddress(e.target.value)}
                        placeholder="Avenue, Numéro, Quartier et Commune"
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">Point de repère connu</label>
                      <input
                        type="text"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        placeholder="Ex: Près du Rond-point Victoire, en face de l’église"
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-300 mb-1">Contact d’urgence (Nom)</label>
                        <input
                          type="text"
                          value={emergencyName}
                          onChange={(e) => setEmergencyName(e.target.value)}
                          placeholder="Parent, conjoint ou proche"
                          className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-neutral-300 mb-1">Contact d’urgence (Téléphone)</label>
                        <input
                          type="tel"
                          value={emergencyPhone}
                          onChange={(e) => setEmergencyPhone(e.target.value)}
                          placeholder="+243..."
                          className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: DOCUMENTS ET VIVACITÉ */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-base font-black text-white">Pièces d'Identité & Selfie de Vivacité</h3>
                <p className="text-xs text-neutral-400">
                  Les photos sont traitées avec compression locale sur votre téléphone pour économiser vos méga-octets.
                </p>

                <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-neutral-200">
                      1. Carte d’électeur CENI ou Passeport
                    </span>
                    <span className="text-2xs text-accent-400 font-bold">Obligatoire</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder="Numéro de la pièce (ex: KIN-8829...)"
                      className="px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => alert('Photo recto/verso enregistrée avec succès.')}
                        className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" /> Téléverser photos
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-neutral-200">
                      2. Permis de Conduire ({providerType === 'MOTO' ? 'Catégorie A' : 'Catégorie B'})
                    </span>
                    <span className="text-2xs text-accent-400 font-bold">Obligatoire</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="Numéro de permis (ex: PC-88219)"
                      className="px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() => alert('Permis numérisé avec succès.')}
                      className="py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" /> Photo Permis
                    </button>
                  </div>
                </div>

                {/* Live Selfie Liveness Check */}
                <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-neutral-200">
                      3. Contrôle de Vivacité (Selfie en direct)
                    </span>
                    {livenessPassed ? (
                      <span className="text-2xs text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Vivacité validée
                      </span>
                    ) : (
                      <span className="text-2xs text-amber-400 font-bold">Requis</span>
                    )}
                  </div>
                  <p className="text-2xs text-neutral-400">
                    Regardez la caméra, clignez des yeux et tournez légèrement la tête pour certifier que vous êtes bien le titulaire.
                  </p>
                  <button
                    type="button"
                    onClick={triggerLivenessCheck}
                    className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      livenessPassed
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-accent-500 hover:bg-accent-400 text-neutral-950'
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    <span>{livenessPassed ? 'Selfie de vivacité conforme' : 'Lancer le test de vivacité (Caméra)'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: VÉHICULE & SÉCURITÉ */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-base font-black text-white">Véhicule & Équipements de Sécurité</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Plaque d’immatriculation officielle RDC
                    </label>
                    <input
                      type="text"
                      value={plate}
                      onChange={(e) => setPlate(e.target.value.toUpperCase())}
                      placeholder="Ex: KN-8812-BB"
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Marque du véhicule</label>
                    <input
                      type="text"
                      value={make}
                      onChange={(e) => setMake(e.target.value)}
                      placeholder={providerType === 'MOTO' ? 'Bajaj, Haojue, TVS' : 'Toyota, Mercedes'}
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Modèle</label>
                    <input
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder={providerType === 'MOTO' ? 'Boxer 150' : 'Corolla, Fielder'}
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Couleur</label>
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="Rouge, Noir, Jaune..."
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Année</label>
                    <input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="2022"
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white"
                    />
                  </div>
                </div>

                {/* Specific provider safety rules */}
                {providerType === 'MOTO' && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3">
                    <strong className="block text-xs font-bold text-amber-300">
                      Règles de sécurité strictes Moto Wewa
                    </strong>
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs text-neutral-300">
                      <input
                        type="checkbox"
                        checked={hasHelmet}
                        onChange={(e) => setHasHelmet(e.target.checked)}
                        className="mt-0.5 rounded text-accent-500 focus:ring-0"
                      />
                      <span>
                        J'atteste disposer en permanence d'un <strong>casque propre et homologué</strong> pour mon passager, et respecter la règle absolue de <strong>1 seul passager par course</strong>.
                      </span>
                    </label>
                  </div>
                )}

                {providerType === 'CAR' && (
                  <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-3">
                    <strong className="block text-xs font-bold text-neutral-200">Options de Confort Taxi</strong>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-neutral-400 mb-1">Nombre de places passagers</label>
                        <select
                          value={seats}
                          onChange={(e) => setSeats(parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white"
                        >
                          <option value={4}>4 places assises</option>
                          <option value={6}>6 places (Break/Minivan)</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2 pt-5">
                        <input
                          type="checkbox"
                          checked={hasAc}
                          onChange={(e) => setHasAc(e.target.checked)}
                          id="ac-toggle"
                          className="rounded text-accent-500"
                        />
                        <label htmlFor="ac-toggle" className="text-neutral-300 font-semibold cursor-pointer">
                          Climatisation fonctionnelle (Air conditionné)
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: PAIEMENT MOBILE MONEY */}
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-base font-black text-white">Coordonnées de Retrait Mobile Money</h3>
                <p className="text-xs text-neutral-400">
                  Les retraits de vos gains sont instantanés et doivent obligatoirement être au même nom que votre pièce d'identité (contrôle de concordance).
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['MPESA', 'AIRTEL', 'ORANGE', 'AFRICELL'] as const).map((prov) => (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => setPayoutProvider(prov)}
                      className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                        payoutProvider === prov
                          ? 'bg-accent-500/20 text-accent-300 border-accent-500'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {prov === 'MPESA' && 'M-Pesa'}
                      {prov === 'AIRTEL' && 'Airtel Money'}
                      {prov === 'ORANGE' && 'Orange Money'}
                      {prov === 'AFRICELL' && 'Africell Money'}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Numéro de compte Mobile Money
                  </label>
                  <input
                    type="tel"
                    value={payoutNumber}
                    onChange={(e) => setPayoutNumber(e.target.value)}
                    placeholder="+243810001001"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Nom du titulaire du compte Mobile Money
                  </label>
                  <input
                    type="text"
                    value={payoutName}
                    onChange={(e) => setPayoutName(e.target.value)}
                    placeholder="Nom tel qu'enregistré auprès de l'opérateur GSM"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white"
                  />
                  <p className="text-2xs text-neutral-500 mt-1">
                    Une vérification automatique bloquera les virements si le nom diffère de votre pièce d'identité.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 5: CHARTE & CONSENTEMENT */}
            {step === 5 && (
              <div className="space-y-4">
                <h3 className="text-base font-black text-white">Charte d’Engagement & Protection des Données</h3>

                <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-3 text-xs">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 rounded text-accent-500"
                    />
                    <span className="text-neutral-300">
                      J’accepte les <strong>Conditions Générales d’Utilisation Partenaires</strong> Transnumerica (Commission équitable de 10%, sans frais fixes cachés).
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={safetyCodeAccepted}
                      onChange={(e) => setSafetyCodeAccepted(e.target.checked)}
                      className="mt-0.5 rounded text-accent-500"
                    />
                    <span className="text-neutral-300">
                      Je m’engage à respecter scrupuleusement le <strong>Code de Bonne Conduite Routière & Sécurité</strong> (tolérance zéro alcool, respect du code de la route congolais et courtoisie).
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dataConsentAccepted}
                      onChange={(e) => setDataConsentAccepted(e.target.checked)}
                      className="mt-0.5 rounded text-accent-500"
                    />
                    <span className="text-neutral-300">
                      Je consens au traitement et au chiffrement de mes documents officiels dans le strict cadre de la vérification administrative légale en RD Congo.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-neutral-800 mt-8">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Précédent
                </button>
              ) : (
                <div />
              )}

              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={async () => {
                    await saveDraft(false);
                    setStep(step + 1);
                  }}
                  className="px-6 py-2.5 bg-accent-500 hover:bg-accent-400 text-neutral-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-accent-500/20"
                >
                  <span>Suivant</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving || !termsAccepted || !safetyCodeAccepted || !dataConsentAccepted}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-lg disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Soumettre mon dossier KYC</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

