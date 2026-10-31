'use client';

import React, { useState } from 'react';
import {
  AdminPaymentOrder,
} from '@/types';
import {
  X,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Receipt,
  RotateCcw,
  Banknote,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
} from 'lucide-react';

interface PaymentDetailDrawerProps {
  payment: AdminPaymentOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onSyncStatus: (id: string) => Promise<void>;
  onOpenRefund: (payment: AdminPaymentOrder) => void;
  onOpenCashConfirm: (payment: AdminPaymentOrder) => void;
  onMarkReconciled: (payment: AdminPaymentOrder) => Promise<void>;
  onRetryPayment: (payment: AdminPaymentOrder) => Promise<void>;
}

export function PaymentDetailDrawer({
  payment,
  isOpen,
  onClose,
  onSyncStatus,
  onOpenRefund,
  onOpenCashConfirm,
  onMarkReconciled,
  onRetryPayment,
}: PaymentDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'webhooks' | 'refunds'>('details');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  if (!isOpen || !payment) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      await onSyncStatus(payment.id);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleReconcile = async () => {
    try {
      setIsReconciling(true);
      await onMarkReconciled(payment);
    } finally {
      setIsReconciling(false);
    }
  };

  const handleRetry = async () => {
    try {
      setIsRetrying(true);
      await onRetryPayment(payment);
    } finally {
      setIsRetrying(false);
    }
  };

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case 'MPESA':
        return <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 font-bold px-2 py-0.5 rounded text-xs">M-Pesa (Vodacom)</span>;
      case 'AIRTEL_MONEY':
        return <span className="bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 font-bold px-2 py-0.5 rounded text-xs">Airtel Money</span>;
      case 'ORANGE_MONEY':
        return <span className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 font-bold px-2 py-0.5 rounded text-xs">Orange Money</span>;
      case 'AFRICELL_MONEY':
        return <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 font-bold px-2 py-0.5 rounded text-xs">Africell Money</span>;
      case 'CASH':
        return <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 font-bold px-2 py-0.5 rounded text-xs">Espèces (Cash)</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 font-bold px-2 py-0.5 rounded text-xs">{provider}</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SETTLED':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" /> Encaissé
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs font-semibold px-2.5 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5" /> En attente
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 text-xs font-semibold px-2.5 py-1 rounded-full">
            <AlertTriangle className="w-3.5 h-3.5" /> Échec
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-xs font-semibold px-2.5 py-1 rounded-full">
            <RotateCcw className="w-3.5 h-3.5" /> Remboursé
          </span>
        );
      case 'PARTIALLY_REFUNDED':
        return (
          <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 text-xs font-semibold px-2.5 py-1 rounded-full">
            <RotateCcw className="w-3.5 h-3.5" /> Partiellement remboursé
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  const remainingMinor = payment.amountMinor - payment.refundedAmountMinor;

  return (
    <div
      id="payment-drawer"
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end transition-opacity duration-300"
    >
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
        {/* Drawer Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {payment.reference}
              </h2>
              {getStatusBadge(payment.status)}
              {payment.reconciled && (
                <span className="bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Rapproché
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Initié le {new Date(payment.createdAt).toLocaleString('fr-FR')} • Version {payment.version}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer le tiroir"
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 text-sm">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-2 border-b-2 font-medium text-xs sm:text-sm transition-colors ${
              activeTab === 'details'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Détails & Opérateur
          </button>
          <button
            onClick={() => setActiveTab('webhooks')}
            className={`py-3 px-2 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 ${
              activeTab === 'webhooks'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Webhooks & Journal ({payment.webhookEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('refunds')}
            className={`py-3 px-2 border-b-2 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 ${
              activeTab === 'refunds'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Remboursements ({payment.refundHistory.length})
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'details' && (
            <>
              {/* Financial summary banner */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Montant total</div>
                  <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    {(payment.amountMinor / 100).toLocaleString('fr-FR')} {payment.currency}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Montant remboursé</div>
                  <div className="text-lg sm:text-xl font-bold text-rose-600 dark:text-rose-400">
                    {(payment.refundedAmountMinor / 100).toLocaleString('fr-FR')} {payment.currency}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Solde résiduel</div>
                  <div className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {(remainingMinor / 100).toLocaleString('fr-FR')} {payment.currency}
                  </div>
                </div>
              </div>

              {/* Provider and transaction reference section */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Identification & Passerelle
                </h3>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/50">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Fournisseur de paiement</span>
                    <div>{getProviderBadge(payment.provider)}</div>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/50">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Référence opérateur</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                        {payment.providerReference}
                      </span>
                      <button
                        onClick={() => handleCopy(payment.providerReference, 'provRef')}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                        title="Copier la référence"
                      >
                        {copiedKey === 'provRef' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {payment.idempotencyKey && (
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/50">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Clé d’idempotence</span>
                      <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        {payment.idempotencyKey}
                      </span>
                    </div>
                  )}

                  {payment.cashReceiptNumber && (
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/50">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Bordereau / Reçu caisse</span>
                      <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        {payment.cashReceiptNumber}
                      </span>
                    </div>
                  )}

                  {payment.cashCollectedBy && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Agent encaisseur</span>
                      <span className="text-xs font-medium text-slate-900 dark:text-white">
                        {payment.cashCollectedBy}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Raw Provider Status Card */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Statut brut de la passerelle
                  </h3>
                  <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    Interroger la passerelle
                  </button>
                </div>
                <div className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs space-y-2 border border-slate-800 shadow-inner">
                  <div className="flex justify-between items-center text-slate-400 pb-1 border-b border-slate-800 text-[11px]">
                    <span>Dernière vérification:</span>
                    <span>{new Date(payment.rawProviderStatus.lastCheckedAt).toLocaleString('fr-FR')}</span>
                  </div>
                  <div>
                    <span className="text-indigo-300">state:</span> &quot;{payment.rawProviderStatus.state}&quot;
                  </div>
                  <div>
                    <span className="text-indigo-300">code:</span> &quot;{payment.rawProviderStatus.code}&quot;
                  </div>
                  <div>
                    <span className="text-indigo-300">message:</span> &quot;{payment.rawProviderStatus.message}&quot;
                  </div>
                  {payment.rawProviderStatus.networkRef && (
                    <div>
                      <span className="text-indigo-300">networkRef:</span> &quot;{payment.rawProviderStatus.networkRef}&quot;
                    </div>
                  )}
                </div>
              </div>

              {/* Customer & service context */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Client & Prestation
                </h3>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700/60 space-y-3 text-xs">
                  <div className="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-700/50">
                    <span className="text-slate-500 dark:text-slate-400">Client</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{payment.customerName}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-700/50">
                    <span className="text-slate-500 dark:text-slate-400">Téléphone Mobile Money</span>
                    <span className="font-mono font-medium text-slate-900 dark:text-white">{payment.customerPhone}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-700/50">
                    <span className="text-slate-500 dark:text-slate-400">Service Transnumerica</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{payment.serviceType}</span>
                  </div>
                  {payment.operatorName && (
                    <div className="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-700/50">
                      <span className="text-slate-500 dark:text-slate-400">Transporteur / Opérateur</span>
                      <span className="font-medium text-slate-900 dark:text-white">{payment.operatorName}</span>
                    </div>
                  )}
                  {payment.bookingId && (
                    <div className="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-700/50">
                      <span className="text-slate-500 dark:text-slate-400">Réservation Bus liée</span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">{payment.bookingId}</span>
                    </div>
                  )}
                  {payment.rideId && (
                    <div className="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-700/50">
                      <span className="text-slate-500 dark:text-slate-400">Course Taxi/Moto liée</span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">{payment.rideId}</span>
                    </div>
                  )}
                  {payment.deliveryId && (
                    <div className="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-700/50">
                      <span className="text-slate-500 dark:text-slate-400">Livraison Colis liée</span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">{payment.deliveryId}</span>
                    </div>
                  )}
                  {payment.notes && (
                    <div className="pt-1">
                      <span className="text-slate-500 dark:text-slate-400 block mb-1">Notes internes:</span>
                      <p className="italic text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-2 rounded">
                        {payment.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'webhooks' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Historique des notifications & événements
              </h3>
              {payment.webhookEvents.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs">
                  Aucun événement webhook enregistré pour cette transaction.
                </div>
              ) : (
                <div className="space-y-3">
                  {payment.webhookEvents.map((wh) => (
                    <div
                      key={wh.id}
                      className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{wh.eventType}</span>
                        <span className="text-[11px] text-slate-400">{new Date(wh.receivedAt).toLocaleString('fr-FR')}</span>
                      </div>
                      {wh.notes && <p className="text-slate-600 dark:text-slate-300 font-medium">{wh.notes}</p>}
                      <pre className="bg-slate-900 text-slate-200 p-2.5 rounded-lg text-[11px] overflow-x-auto">
                        {JSON.stringify(wh.payload, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'refunds' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Lignes de remboursements
                </h3>
                {remainingMinor > 0 && (payment.status === 'SETTLED' || payment.status === 'PARTIALLY_REFUNDED') && (
                  <button
                    onClick={() => onOpenRefund(payment)}
                    className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Effectuer un remboursement
                  </button>
                )}
              </div>

              {payment.refundHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs">
                  Aucun remboursement enregistré pour ce paiement.
                </div>
              ) : (
                <div className="space-y-3">
                  {payment.refundHistory.map((ref) => (
                    <div
                      key={ref.id}
                      className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-600 dark:text-rose-400">
                          -{(ref.amountMinor / 100).toLocaleString('fr-FR')} {ref.currency}
                        </span>
                        <span className="text-[11px] text-slate-400">{new Date(ref.createdAt).toLocaleString('fr-FR')}</span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 font-medium">Motif : {ref.reason}</p>
                      <div className="text-[11px] text-slate-500 flex justify-between">
                        <span>Validé par: {ref.reauthApprovedBy}</span>
                        {ref.providerRefundRef && <span>Réf: {ref.providerRefundRef}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {!payment.reconciled && (
              <button
                onClick={handleReconcile}
                disabled={isReconciling}
                className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isReconciling ? 'Validation...' : 'Marquer rapproché'}</span>
              </button>
            )}

            {payment.status === 'FAILED' && (
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>{isRetrying ? 'Réessai...' : 'Relancer le paiement'}</span>
              </button>
            )}

            {payment.provider === 'CASH' && payment.status === 'PENDING' && (
              <button
                onClick={() => onOpenCashConfirm(payment)}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Banknote className="w-4 h-4" />
                <span>Encaisser espèces</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {remainingMinor > 0 && (payment.status === 'SETTLED' || payment.status === 'PARTIALLY_REFUNDED') && (
              <button
                onClick={() => onOpenRefund(payment)}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Rembourser</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold rounded-lg transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

