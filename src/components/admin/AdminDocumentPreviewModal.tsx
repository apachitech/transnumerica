'use client';

import React, { useState } from 'react';
import { AdminKycItem, AdminKycDocument } from '@/types';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  ZoomIn,
  Calendar,
  Building,
  Car,
  HardHat,
} from 'lucide-react';

interface AdminDocumentPreviewModalProps {
  item: AdminKycItem | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

export function AdminDocumentPreviewModal({
  item,
  onClose,
  onApprove,
  onReject,
}: AdminDocumentPreviewModalProps) {
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('Document flou ou illisible');

  if (!item) return null;

  const currentDoc: AdminKycDocument | undefined = item.documents[selectedDocIndex];

  const commonRejectionReasons = [
    'Document flou ou illisible',
    'Permis de conduire expiré',
    'Absence de deuxième casque passager conforme',
    'Défaut d\'assurance responsabilité civile valide',
    'Plaque minéralogique non concordante avec la carte grise',
  ];

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    onReject(item.id, rejectionReason);
    onClose();
  };

  const handleConfirmApprove = () => {
    onApprove(item.id);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="admin-document-preview-modal"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent-500 text-neutral-950 font-black flex items-center justify-center text-lg">
              {item.type === 'DRIVER' ? (item.vehicleType === 'MOTO' ? '🏍️' : '🚕') : '🚌'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base text-white leading-tight">
                  {item.applicantName}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-neutral-950 uppercase">
                  {item.type === 'DRIVER' ? item.vehiclePlate : item.companyName}
                </span>
              </div>
              <p className="text-2xs text-neutral-400 font-mono mt-0.5">
                Tél : {item.phone} • Coopérative : {item.cooperative || item.companyName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la prévisualisation"
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Document Tabs Strip */}
        <div className="bg-neutral-100 dark:bg-neutral-800/80 px-4 py-2 border-b border-neutral-200 dark:border-neutral-750 flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider shrink-0 mr-1">
            Pièces fournies ({item.documents.length}) :
          </span>
          {item.documents.map((doc, idx) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => setSelectedDocIndex(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedDocIndex === idx
                  ? 'bg-white dark:bg-neutral-700 text-neutral-950 dark:text-white shadow-xs font-extrabold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{doc.name}</span>
            </button>
          ))}
        </div>

        {/* Document Inspection Canvas */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {currentDoc ? (
            <div className="space-y-4">
              {/* Simulated High-Res Document Preview Card */}
              <div className="relative rounded-2xl bg-neutral-950 text-white p-5 border-2 border-accent-400/80 shadow-md font-mono space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2 text-2xs">
                  <span className="text-accent-400 font-bold uppercase tracking-wider">
                    RÉPUBLIQUE DÉMOCRATIQUE DU CONGO
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold">
                    ✓ NUMÉRISÉ HAUTE RÉSOLUTION
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4 py-1">
                  <div>
                    <span className="text-[10px] text-neutral-400 block uppercase">
                      Intitulé du document
                    </span>
                    <span className="text-sm font-black text-white block">
                      {currentDoc.name}
                    </span>
                    <span className="text-xs text-accent-300 font-bold block mt-1">
                      N° : {currentDoc.documentNumber}
                    </span>
                  </div>

                  <div className="w-16 h-16 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-2xl shrink-0">
                    📜
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-2xs text-neutral-400 pt-2 border-t border-neutral-800">
                  <div>
                    <span className="block">Délivré le :</span>
                    <span className="font-bold text-white">{currentDoc.issuedDate}</span>
                  </div>
                  <div>
                    <span className="block">Validité / Expiration :</span>
                    <span className="font-bold text-emerald-400">
                      {currentDoc.expiryDate || 'Permanent / Valide'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Safety & Compliance Verification Checklist */}
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-2 text-xs">
                <span className="font-extrabold text-neutral-900 dark:text-white block text-2xs uppercase tracking-wider">
                  Contrôles réglementaires obligatoires RDC :
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Identité &amp; Photo biométrique concordante</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Numéro de permis certifié Ministère Transport</span>
                  </div>
                  {item.hasPassengerHelmet !== undefined && (
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Deux casques homologués passager confirmés</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Contrôle technique &amp; Assurance SONAS active</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-neutral-400 text-xs py-8">
              Aucun document sélectionné.
            </p>
          )}

          {/* Rejection Reason Form (if opened) */}
          {showRejectForm && (
            <form
              onSubmit={handleConfirmReject}
              className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 space-y-3 animate-in fade-in"
            >
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-black text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Sélectionnez le motif réglementaire du rejet :</span>
              </div>

              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 bg-white dark:bg-neutral-800 border border-red-300 dark:border-red-700 rounded-xl text-xs font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {commonRejectionReasons.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowRejectForm(false)}
                  className="px-3 py-1.5 text-neutral-600 dark:text-neutral-400 text-xs font-bold hover:underline"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  data-testid="confirm-reject-kyc-btn"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-xs"
                >
                  Confirmer le rejet et notifier le candidat
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions: Approve / Reject */}
        <div className="p-4 sm:p-5 bg-neutral-50 dark:bg-neutral-800/80 border-t border-neutral-200 dark:border-neutral-750 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowRejectForm(!showRejectForm)}
            data-testid="modal-reject-kyc-btn"
            className="min-h-[46px] px-4 py-2 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-900 dark:text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all active:scale-95"
          >
            <XCircle className="w-4 h-4 text-red-500" />
            <span>Rejeter la demande</span>
          </button>

          <button
            type="button"
            onClick={handleConfirmApprove}
            data-testid="modal-approve-kyc-btn"
            className="min-h-[46px] px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-elevation-1 flex items-center gap-2 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approuver &amp; Accorder le Badge Vérifié</span>
          </button>
        </div>
      </div>
    </div>
  );
}

