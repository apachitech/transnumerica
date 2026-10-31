'use client';

import React, { useState } from 'react';
import { Driver, DriverKycDocument, VehicleType } from '@/types';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  AlertTriangle,
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  HardHat,
  Car,
  Bike,
  Calendar,
  Lock,
  Plus,
  ArrowRight,
  Info,
} from 'lucide-react';

interface DriverKycTabProps {
  driver: Driver;
  vehicleType: VehicleType;
  kycStatus: 'VERIFIED' | 'PENDING' | 'UNVERIFIED' | 'REJECTED';
  documents: DriverKycDocument[];
  onUploadDocument: (doc: Omit<DriverKycDocument, 'id' | 'verified'>) => void;
  onSimulateAdminApproval: () => void;
  onSimulateAdminReject: (reason: string) => void;
}

export function DriverKycTab({
  driver,
  vehicleType,
  kycStatus,
  documents,
  onUploadDocument,
  onSimulateAdminApproval,
  onSimulateAdminReject,
}: DriverKycTabProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docType, setDocType] = useState<DriverKycDocument['type']>('LICENSE');
  const [docName, setDocName] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [issuedDate, setIssuedDate] = useState('2025-01-15');
  const [expiryDate, setExpiryDate] = useState('2027-01-15');

  // Specific document requirements checklist based on vehicleType
  const requiredSpecs = [
    {
      id: 'NATIONAL_ID',
      label: "Pièce d'Identité (CENI / Passeport)",
      category: 'IDENTITÉ',
      description: "Carte d'électeur congolaise ou passeport biométrique valide",
      appliesTo: 'BOTH',
    },
    {
      id: 'LICENSE',
      label: vehicleType === 'MOTO' ? 'Permis de Conduire (Catégorie A - Moto)' : 'Permis de Conduire (Catégorie B - Automobile)',
      category: 'APTITUDE',
      description: vehicleType === 'MOTO' ? "Permis moto officiel délivré par le Ministère des Transports" : "Permis de conduire automobile B pour transport urbain",
      appliesTo: 'BOTH',
    },
    {
      id: 'VEHICLE_REG',
      label: vehicleType === 'MOTO' ? 'Volet Jaune / Carte Rose Moto' : 'Carte Rose Automobile',
      category: 'TITRE',
      description: "Preuve de propriété ou contrat de mise à disposition de l'engin",
      appliesTo: 'BOTH',
    },
    {
      id: 'INSURANCE',
      label: vehicleType === 'MOTO' ? 'Police d’Assurance Mototaxi' : 'Assurance Automobile Responsabilité Civile',
      category: 'SÉCURITÉ',
      description: "Couverture valide délivrée par la SONAS, Rawsur ou Activa RDC",
      appliesTo: 'BOTH',
    },
    ...(vehicleType === 'MOTO'
      ? [
          {
            id: 'HELMET_DECLARATION',
            label: 'Attestation 2 Casques de Protection',
            category: 'ÉQUIPEMENT MOTO',
            description: 'Engagement de mise à disposition d’un casque propre et homologué au passager Wewa',
            appliesTo: 'MOTO',
          },
        ]
      : [
          {
            id: 'TECHNICAL_INSPECTION',
            label: 'Certificat de Contrôle Technique Auto',
            category: 'CONTRÔLE AUTO',
            description: 'Visite technique automobile périodique valide (CNPR / Ministère)',
            appliesTo: 'CAR',
          },
        ]),
    {
      id: 'DRIVER_PHOTO',
      label: 'Photo Portrait / Selfie Chauffeur',
      category: 'IDENTITÉ',
      description: 'Photo de face sur fond neutre sans lunettes de soleil pour le badge client',
      appliesTo: 'BOTH',
    },
  ];

  const verifiedCount = documents.filter((d) => d.verified).length;
  const totalRequired = requiredSpecs.length;
  const progressPercent = Math.min(100, Math.round((verifiedCount / totalRequired) * 100));

  const handleOpenUpload = (defaultType?: DriverKycDocument['type']) => {
    if (defaultType) {
      setDocType(defaultType);
      if (defaultType === 'LICENSE') {
        setDocName(vehicleType === 'MOTO' ? 'Permis de conduire Catégorie A' : 'Permis de conduire Catégorie B');
      } else if (defaultType === 'VEHICLE_REG') {
        setDocName(vehicleType === 'MOTO' ? 'Volet jaune motocyclette' : 'Carte rose automobile');
      } else if (defaultType === 'INSURANCE') {
        setDocName('Police d’assurance RDC');
      } else if (defaultType === 'TECHNICAL_INSPECTION') {
        setDocName('Certificat de contrôle technique');
      } else if (defaultType === 'NATIONAL_ID') {
        setDocName("Carte d'électeur CENI");
      }
    } else {
      setDocName("Pièce justificative");
    }
    setDocNumber(`CD-${Math.floor(100000 + Math.random() * 900000)}`);
    setShowUploadModal(true);
  };

  const handleSaveDoc = (e: React.FormEvent) => {
    e.preventDefault();
    onUploadDocument({
      name: docName || 'Document KYC',
      type: docType,
      documentNumber: docNumber,
      issuedDate,
      expiryDate,
      fileKey: `kyc/${driver.id}/${docType.toLowerCase()}-${Date.now()}.pdf`,
    });
    setShowUploadModal(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. KYC Overall Status Banner */}
      <div
        className={`p-4 sm:p-5 rounded-3xl border shadow-elevation-1 transition-all ${
          kycStatus === 'VERIFIED'
            ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
            : kycStatus === 'PENDING'
            ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-950 dark:text-blue-100'
            : kycStatus === 'REJECTED'
            ? 'bg-red-50/90 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-950 dark:text-red-100'
            : 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                kycStatus === 'VERIFIED'
                  ? 'bg-emerald-500 text-white'
                  : kycStatus === 'PENDING'
                  ? 'bg-blue-500 text-white animate-pulse'
                  : kycStatus === 'REJECTED'
                  ? 'bg-red-500 text-white'
                  : 'bg-amber-500 text-neutral-950'
              }`}
            >
              {kycStatus === 'VERIFIED' ? (
                <ShieldCheck className="w-5 h-5" />
              ) : kycStatus === 'PENDING' ? (
                <Clock className="w-5 h-5" />
              ) : kycStatus === 'REJECTED' ? (
                <XCircle className="w-5 h-5" />
              ) : (
                <ShieldAlert className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-sm sm:text-base leading-tight">
                  {kycStatus === 'VERIFIED'
                    ? 'Dossier KYC Vérifié & Conforme'
                    : kycStatus === 'PENDING'
                    ? 'Dossier KYC En Cours d’Examen'
                    : kycStatus === 'REJECTED'
                    ? 'Dossier KYC Rejeté — Actions Requises'
                    : 'Dossier KYC Incomplet — Documents Requis'}
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border bg-white/70 dark:bg-black/30">
                  {vehicleType === 'MOTO' ? '🏍️ Profil Moto Wewa' : '🚗 Profil Voiture Taxi'}
                </span>
              </div>

              <p className="text-xs mt-1 leading-relaxed opacity-90">
                {kycStatus === 'VERIFIED'
                  ? 'Vos pièces officielles sont validées. Vous êtes autorisé à activer votre radar et recevoir des courses en RDC.'
                  : kycStatus === 'PENDING'
                  ? 'Vos pièces ont été reçues. Notre équipe de conformité à Kinshasa procède à la vérification sous 2 heures ouvrées.'
                  : kycStatus === 'REJECTED'
                  ? 'Une ou plusieurs pièces comportent des anomalies (illisibilité ou date expirée). Veuillez soumettre de nouveaux scans.'
                  : 'Conformément à la réglementation sur le transport rémunéré en RDC, vous devez téléverser vos documents avant de pouvoir passer en ligne.'}
              </p>
            </div>
          </div>

          {/* Quick Upload Button */}
          <button
            type="button"
            onClick={() => handleOpenUpload()}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all shrink-0"
          >
            <Upload className="w-4 h-4" />
            <span>Ajouter une pièce</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 pt-3 border-t border-current/10">
          <div className="flex items-center justify-between text-2xs font-extrabold mb-1.5">
            <span>Complétude du dossier : {progressPercent}%</span>
            <span>{verifiedCount} sur {totalRequired} exigences satisfaites</span>
          </div>
          <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                kycStatus === 'VERIFIED' ? 'bg-emerald-500' : 'bg-accent-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Specific Requirements for Active Vehicle Type (Moto vs Car) */}
      <div className="bg-white dark:bg-neutral-850 rounded-3xl border border-neutral-200/90 dark:border-neutral-750 p-4 sm:p-6 shadow-elevation-1 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-750 pb-3">
          <div>
            <h3 className="font-black text-sm sm:text-base text-neutral-900 dark:text-white flex items-center gap-2">
              {vehicleType === 'MOTO' ? (
                <Bike className="w-4 h-4 text-amber-500" />
              ) : (
                <Car className="w-4 h-4 text-blue-500" />
              )}
              <span>
                Exigences Spécifiques : {vehicleType === 'MOTO' ? 'Mototaxi Wewa (2 Roues)' : 'Voiture Taxi Urbain (4 Roues)'}
              </span>
            </h3>
            <p className="text-2xs sm:text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {vehicleType === 'MOTO'
                ? 'Réglementation stricte sur le port obligatoire de 2 casques (conducteur + client) et permis A'
                : 'Réglementation sur le contrôle technique semestriel, permis B et assurance transport de personnes'}
            </p>
          </div>

          {/* Quick Simulation controls for testing */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onSimulateAdminApproval}
              className="text-2xs font-extrabold px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200 transition-colors"
              title="Tester : valider administrativement le KYC pour débloquer le radar"
            >
              Simuler Validation Admin
            </button>
            <button
              type="button"
              onClick={() => onSimulateAdminReject('Permis illisible')}
              className="text-2xs font-extrabold px-2.5 py-1 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700 hover:bg-red-200 transition-colors"
              title="Tester : rejeter pour motif administratif"
            >
              Simuler Rejet
            </button>
          </div>
        </div>

        {/* Checklist of required items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {requiredSpecs.map((spec) => {
            const existingDoc = documents.find((d) => {
              if (spec.id === 'HELMET_DECLARATION') return d.type === 'TECHNICAL_INSPECTION' || d.name.toLowerCase().includes('casque');
              return d.type === spec.id;
            });
            const isDocVerified = existingDoc?.verified;

            return (
              <div
                key={spec.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  isDocVerified
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                    : existingDoc
                    ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/60'
                    : 'bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700'
                }`}
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-3xs font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-neutral-200/80 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
                      {spec.category}
                    </span>
                    {spec.appliesTo === 'MOTO' && (
                      <span className="text-3xs font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                        Moto Uniquement
                      </span>
                    )}
                    {spec.appliesTo === 'CAR' && (
                      <span className="text-3xs font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 border border-blue-300">
                        Voiture Uniquement
                      </span>
                    )}
                  </div>

                  <h4 className="font-extrabold text-xs text-neutral-900 dark:text-white leading-tight">
                    {spec.label}
                  </h4>
                  <p className="text-2xs text-neutral-500 dark:text-neutral-400 leading-normal">
                    {spec.description}
                  </p>

                  {existingDoc ? (
                    <div className="pt-1 flex items-center gap-2 text-2xs font-mono font-bold text-neutral-700 dark:text-neutral-300">
                      <span>N° : {existingDoc.documentNumber}</span>
                      {existingDoc.expiryDate && (
                        <span>• Expire le {existingDoc.expiryDate}</span>
                      )}
                    </div>
                  ) : null}
                </div>

                <div className="shrink-0 flex flex-col items-end gap-1.5">
                  {isDocVerified ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>Validé</span>
                    </span>
                  ) : existingDoc ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-black bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300">
                      <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <span>En examen</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenUpload(spec.id as DriverKycDocument['type'])}
                      className="px-2.5 py-1 rounded-xl bg-primary-900 hover:bg-primary-950 text-white dark:bg-primary-500 dark:hover:bg-primary-400 dark:text-neutral-950 font-black text-2xs flex items-center gap-1 active:scale-95 transition-all shadow-xs"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Fournir</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Upload & Submit Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-850 rounded-3xl border border-neutral-200 dark:border-neutral-750 shadow-2xl p-5 sm:p-6 space-y-4 max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-750 pb-3">
              <div>
                <h3 className="font-black text-base text-neutral-900 dark:text-white">
                  Téléverser une pièce justificative
                </h3>
                <p className="text-2xs text-neutral-500 dark:text-neutral-400">
                  Transnumerica RDC • Stockage sécurisé et chiffré à Kinshasa
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDoc} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Type de Document *
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as DriverKycDocument['type'])}
                  className="w-full min-h-[44px] px-3 bg-neutral-50 dark:bg-neutral-750 border border-neutral-200 dark:border-neutral-700 rounded-xl font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="NATIONAL_ID">Pièce d'Identité (CENI / Passeport)</option>
                  <option value="LICENSE">
                    {vehicleType === 'MOTO' ? 'Permis de Conduire Catégorie A (Moto)' : 'Permis de Conduire Catégorie B (Auto)'}
                  </option>
                  <option value="VEHICLE_REG">
                    {vehicleType === 'MOTO' ? 'Volet Jaune / Carte Rose Moto' : 'Carte Rose Automobile'}
                  </option>
                  <option value="INSURANCE">Police d'Assurance Transport</option>
                  <option value="TECHNICAL_INSPECTION">
                    {vehicleType === 'MOTO' ? 'Déclaration 2 Casques Certifiés' : 'Contrôle Technique Périodique Automobile'}
                  </option>
                  <option value="DRIVER_PHOTO">Photo Portrait Selfie</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Intitulé du document *
                </label>
                <input
                  type="text"
                  required
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="Ex: Permis de conduire national"
                  className="w-full min-h-[44px] px-3 bg-neutral-50 dark:bg-neutral-750 border border-neutral-200 dark:border-neutral-700 rounded-xl font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Numéro officiel de la pièce *
                </label>
                <input
                  type="text"
                  required
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  placeholder="Ex: KN-82910-2024"
                  className="w-full min-h-[44px] px-3 font-mono font-bold bg-neutral-50 dark:bg-neutral-750 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Date de délivrance
                  </label>
                  <input
                    type="date"
                    value={issuedDate}
                    onChange={(e) => setIssuedDate(e.target.value)}
                    className="w-full min-h-[44px] px-3 bg-neutral-50 dark:bg-neutral-750 border border-neutral-200 dark:border-neutral-700 rounded-xl font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Date d’expiration
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full min-h-[44px] px-3 bg-neutral-50 dark:bg-neutral-750 border border-neutral-200 dark:border-neutral-700 rounded-xl font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                  />
                </div>
              </div>

              {/* Simulated file upload dropzone */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-center space-y-1.5 cursor-pointer hover:border-accent-500 transition-colors">
                <Upload className="w-6 h-6 text-neutral-400 mx-auto" />
                <span className="font-bold text-xs text-neutral-800 dark:text-neutral-200 block">
                  Cliquez pour charger la photo ou le scan (JPG, PNG, PDF)
                </span>
                <span className="text-3xs text-neutral-500 dark:text-neutral-400 block">
                  Photo nette recto/verso, max 10 Mo
                </span>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 min-h-[44px] rounded-xl border border-neutral-200 dark:border-neutral-700 font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] rounded-xl bg-primary-900 hover:bg-primary-950 text-white dark:bg-primary-500 dark:hover:bg-primary-400 dark:text-neutral-950 font-black shadow-sm flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enregistrer la pièce</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

