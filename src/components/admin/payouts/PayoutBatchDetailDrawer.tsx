'use client';

import React from 'react';
import {
  PayoutBatch,
  PayoutLineItem,
} from '@/types';
import {
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building,
  Smartphone,
  Ban,
  ArrowUpRight,
  UserCheck,
} from 'lucide-react';

interface PayoutBatchDetailDrawerProps {
  batch: PayoutBatch | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (batch: PayoutBatch) => void;
  onExecute: (batch: PayoutBatch) => void;
  onToggleHold: (batch: PayoutBatch) => void;
  onExportCsv: (batchId: string) => void;
}

export function PayoutBatchDetailDrawer({
  batch,
  isOpen,
  onClose,
  onApprove,
  onExecute,
  onToggleHold,
  onExportCsv,
}: PayoutBatchDetailDrawerProps) {
  if (!isOpen || !batch) return null;

  const getStatusBadge = (status: PayoutBatch['status']) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Réglé / Décaissé
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <ShieldCheck className="w-3.5 h-3.5" /> Approuvé (Prêt pour exécution)
          </span>
        );
      case 'NEEDS_SECOND_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" /> En attente du 2nd visa superviseur
          </span>
        );
      case 'PENDING_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Clock className="w-3.5 h-3.5" /> En attente d'approbation
          </span>
        );
      case 'ON_HOLD':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-3.5 h-3.5" /> Bloqué (Enquête/Litige)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-700 text-zinc-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-2xl bg-zinc-900 border-l border-zinc-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 sm:p-6 border-b border-zinc-800 flex items-start justify-between bg-zinc-950/60">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                {batch.id}
              </span>
              {getStatusBadge(batch.status)}
            </div>
            <h2 className="text-lg font-bold text-white mt-2">{batch.title}</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Période du{' '}
              <span className="text-zinc-300">
                {new Date(batch.periodStart).toLocaleDateString('fr-FR')}
              </span>{' '}
              au{' '}
              <span className="text-zinc-300">
                {new Date(batch.periodEnd).toLocaleDateString('fr-FR')}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer le tiroir"
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Financial summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-zinc-800/60 rounded-xl border border-zinc-700/50">
              <p className="text-xs text-zinc-400">Revenu Brut</p>
              <p className="text-sm sm:text-base font-bold text-white mt-1">
                {batch.totalGrossRevenueCdf.toLocaleString('fr-FR')} CDF
              </p>
            </div>
            <div className="p-3 bg-zinc-800/60 rounded-xl border border-zinc-700/50">
              <p className="text-xs text-zinc-400">Commission Retenue</p>
              <p className="text-sm sm:text-base font-bold text-amber-400 mt-1">
                -{batch.totalCommissionCdf.toLocaleString('fr-FR')} CDF
              </p>
            </div>
            <div className="p-3 bg-zinc-800/60 rounded-xl border border-zinc-700/50">
              <p className="text-xs text-zinc-400">Ajustements</p>
              <p className="text-sm sm:text-base font-bold text-blue-400 mt-1">
                {batch.totalAdjustmentsCdf >= 0 ? '+' : ''}
                {batch.totalAdjustmentsCdf.toLocaleString('fr-FR')} CDF
              </p>
            </div>
            <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-500/30">
              <p className="text-xs text-emerald-400 font-medium">Net à Décaisser</p>
              <p className="text-sm sm:text-base font-extrabold text-emerald-300 mt-1">
                {batch.totalNetPayoutCdf.toLocaleString('fr-FR')} CDF
              </p>
            </div>
          </div>

          {/* Hold Notice if on hold */}
          {batch.status === 'ON_HOLD' && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-rose-300">Lot de paiement sous blocage conservatoire</h4>
                <p className="text-xs text-rose-200/80 mt-1">{batch.holdReason || 'Aucun motif renseigné'}</p>
              </div>
            </div>
          )}

          {/* Approvals Chain */}
          <div className="p-4 rounded-xl bg-zinc-800/40 border border-zinc-800 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
              <span>Chaîne d'approbation et contrôle</span>
              {batch.requiresDualApproval && (
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full normal-case font-normal">
                  Seuil double visa activé ({batch.dualApprovalThresholdCdf.toLocaleString('fr-FR')} CDF)
                </span>
              )}
            </h3>

            <div className="space-y-2 text-xs">
              {/* First Approval */}
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    batch.firstApproval
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-zinc-200">1ère Approbation (Opérationnelle)</p>
                    {batch.firstApproval && (
                      <span className="text-[10px] text-zinc-400">
                        {new Date(batch.firstApproval.approvedAt).toLocaleString('fr-FR')}
                      </span>
                    )}
                  </div>
                  {batch.firstApproval ? (
                    <p className="text-zinc-400 mt-0.5">
                      Par <span className="text-zinc-300 font-medium">{batch.firstApproval.approvedBy}</span>
                      {batch.firstApproval.notes && ` — « ${batch.firstApproval.notes} »`}
                    </p>
                  ) : (
                    <p className="text-zinc-500 mt-0.5">En attente de validation</p>
                  )}
                </div>
              </div>

              {/* Second Approval */}
              {batch.requiresDualApproval && (
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      batch.secondApproval
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-zinc-200">2nde Approbation (Superviseur Distinct)</p>
                      {batch.secondApproval && (
                        <span className="text-[10px] text-zinc-400">
                          {new Date(batch.secondApproval.approvedAt).toLocaleString('fr-FR')}
                        </span>
                      )}
                    </div>
                    {batch.secondApproval ? (
                      <p className="text-zinc-400 mt-0.5">
                        Par <span className="text-zinc-300 font-medium">{batch.secondApproval.approvedBy}</span>
                        {batch.secondApproval.notes && ` — « ${batch.secondApproval.notes} »`}
                      </p>
                    ) : (
                      <p className="text-amber-400/80 mt-0.5">
                        Requis car montant ≥ {batch.dualApprovalThresholdCdf.toLocaleString('fr-FR')} CDF
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Execution details */}
          {batch.paymentExecution && (
            <div className="p-4 rounded-xl bg-zinc-800/40 border border-zinc-800 space-y-2">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Exécution Financière
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mt-2">
                <div>
                  <span className="text-zinc-500">Fournisseur de décaissement :</span>
                  <p className="text-zinc-200 font-semibold mt-0.5">
                    {batch.paymentExecution.payoutProvider}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-500">Référence de transaction :</span>
                  <p className="font-mono text-emerald-400 font-bold mt-0.5">
                    {batch.paymentExecution.referenceNumber}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-500">Exécuté par :</span>
                  <p className="text-zinc-300 mt-0.5">{batch.paymentExecution.executedBy}</p>
                </div>
                <div>
                  <span className="text-zinc-500">Date d'exécution :</span>
                  <p className="text-zinc-300 mt-0.5">
                    {new Date(batch.paymentExecution.executedAt).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Line items list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Lignes de règlement ({batch.items.length})
              </h3>
              <button
                onClick={() => onExportCsv(batch.id)}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Exporter CSV
              </button>
            </div>

            <div className="space-y-2">
              {batch.items.map((item: PayoutLineItem) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-zinc-800/30 border border-zinc-800 hover:border-zinc-700 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{item.payeeName}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            item.payeeType === 'OPERATOR'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {item.payeeType === 'OPERATOR' ? 'Opérateur' : 'Chauffeur'}
                        </span>
                        <span className="text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                          {item.service}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1.5">
                        {item.payoutMethod.includes('MONEY') || item.payoutMethod === 'MPESA' ? (
                          <Smartphone className="w-3 h-3 text-zinc-500" />
                        ) : (
                          <Building className="w-3 h-3 text-zinc-500" />
                        )}
                        <span>{item.destinationAccount}</span>
                        <span className="text-zinc-600">•</span>
                        <span>{item.tripCount} courses</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-400">
                        {item.netPayoutCdf.toLocaleString('fr-FR')} CDF
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        Brut: {item.grossRevenueCdf.toLocaleString('fr-FR')} • Com: {item.commissionCdf.toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  {item.disbursementRef && (
                    <div className="mt-2 pt-2 border-t border-zinc-800/50 flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500">Réf décaissement :</span>
                      <span className="font-mono text-zinc-300">{item.disbursementRef}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-zinc-800 bg-zinc-950/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onExportCsv(batch.id)}
              className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Exporter CSV
            </button>
            {batch.status !== 'PAID' && (
              <button
                onClick={() => onToggleHold(batch)}
                className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                  batch.status === 'ON_HOLD'
                    ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                    : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                }`}
              >
                {batch.status === 'ON_HOLD' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Lever le blocage
                  </>
                ) : (
                  <>
                    <Ban className="w-4 h-4" /> Mettre en suspens
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {(batch.status === 'PENDING_APPROVAL' || batch.status === 'NEEDS_SECOND_APPROVAL') && (
              <button
                onClick={() => onApprove(batch)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-blue-600/20"
              >
                <ShieldCheck className="w-4 h-4" />
                {batch.status === 'NEEDS_SECOND_APPROVAL'
                  ? 'Approuver (2nd Visa)'
                  : 'Approuver le lot'}
              </button>
            )}

            {batch.status === 'APPROVED' && (
              <button
                onClick={() => onExecute(batch)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/20"
              >
                <ArrowUpRight className="w-4 h-4" /> Décaisser / Marquer payé
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

