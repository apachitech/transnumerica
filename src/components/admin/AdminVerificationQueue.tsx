'use client';

import React, { useState } from 'react';
import { AdminKycItem } from '@/types';
import { AdminDocumentPreviewModal } from './AdminDocumentPreviewModal';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Clock,
  Car,
  Bike,
  Bus,
  HardHat,
  Search,
} from 'lucide-react';

interface AdminVerificationQueueProps {
  queue: AdminKycItem[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

export function AdminVerificationQueue({
  queue,
  onApprove,
  onReject,
}: AdminVerificationQueueProps) {
  const [selectedItem, setSelectedItem] = useState<AdminKycItem | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'DRIVER' | 'OPERATOR'>('ALL');

  const filteredQueue = queue.filter((item) => {
    if (filterType === 'ALL') return true;
    return item.type === filterType;
  });

  return (
    <div
      data-testid="admin-verification-queue-section"
      className="bg-white dark:bg-neutral-850 border border-neutral-200/90 dark:border-neutral-750 rounded-3xl p-4 sm:p-6 shadow-elevation-1 space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-accent-500" />
            <span>File d&apos;Attente des Vérifications &amp; KYC ({filteredQueue.length})</span>
          </h3>
          <p className="text-2xs text-neutral-400 font-medium">
            Examen des pièces officielles (Permis, Assurances, Licences, Casques passagers)
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-bold">
          {(['ALL', 'DRIVER', 'OPERATOR'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-center transition-all ${
                filterType === t
                  ? 'bg-white dark:bg-neutral-700 text-neutral-950 dark:text-white shadow-2xs font-extrabold'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              {t === 'ALL' ? 'Tous' : t === 'DRIVER' ? 'Chauffeurs' : 'Transporteurs Bus'}
            </button>
          ))}
        </div>
      </div>

      {/* Candidates List */}
      {filteredQueue.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 text-neutral-400 text-xs space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <p className="font-bold text-neutral-700 dark:text-neutral-300">
            Toutes les demandes de vérification KYC ont été traitées avec succès.
          </p>
          <span className="text-[11px] block">
            Les nouvelles demandes de chauffeurs et d&apos;opérateurs apparaîtront ici automatiquement.
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQueue.map((item) => (
            <div
              key={item.id}
              data-testid={`kyc-card-${item.id}`}
              className="bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header identity */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-sm shrink-0">
                      {item.type === 'DRIVER' ? (item.vehicleType === 'MOTO' ? '🏍️' : '🚕') : '🚌'}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-neutral-900 dark:text-white">
                        {item.applicantName}
                      </h4>
                      <span className="text-2xs text-neutral-400 font-mono">{item.phone}</span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-lg bg-amber-400 text-neutral-950 font-black text-2xs font-mono uppercase tracking-wider">
                    {item.vehiclePlate || item.companyName}
                  </span>
                </div>

                {/* Details badge */}
                <div className="p-3 bg-white dark:bg-neutral-800 rounded-xl text-xs space-y-1.5 border border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300 font-semibold">
                    <span>Véhicule :</span>
                    <span className="font-bold text-neutral-900 dark:text-white">
                      {item.vehicleModel || 'Flotte d\'autocars VIP'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300 font-semibold">
                    <span>Affiliation :</span>
                    <span className="font-bold text-neutral-900 dark:text-white truncate max-w-[200px]">
                      {item.cooperative || item.companyName}
                    </span>
                  </div>

                  {item.hasPassengerHelmet !== undefined && (
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold pt-1 border-t border-neutral-100 dark:border-neutral-750 text-[11px]">
                      <HardHat className="w-3.5 h-3.5" />
                      <span>Deux casques homologués passager confirmés</span>
                    </div>
                  )}
                </div>

                {/* Documents submitted */}
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider block">
                    Pièces justificatives ({item.documents.length}) :
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.documents.map((doc) => (
                      <span
                        key={doc.id}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-200/80 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3 text-neutral-500" />
                        <span>{doc.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Preview modal, Approve, Reject */}
              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  data-testid={`preview-docs-btn-${item.id}`}
                  className="px-3 py-2 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-650 text-neutral-900 dark:text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Eye className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
                  <span>Examiner le dossier</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onApprove(item.id)}
                    data-testid={`quick-approve-btn-${item.id}`}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center gap-1 shadow-xs transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Valider</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    data-testid={`quick-reject-btn-${item.id}`}
                    className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 text-neutral-700 dark:text-neutral-300 font-bold text-xs rounded-xl transition-all active:scale-95"
                  >
                    Rejeter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Preview Modal */}
      <AdminDocumentPreviewModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onApprove={onApprove}
        onReject={onReject}
      />
    </div>
  );
}

