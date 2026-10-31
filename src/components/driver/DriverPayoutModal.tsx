'use client';

import React, { useState } from 'react';
import { Currency, PaymentProviderId } from '@/types';
import { formatCurrency } from '@/lib/currency';
import {
  X,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Clock,
  Building2,
} from 'lucide-react';

interface DriverPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableAmountMinor: number;
  currency: Currency;
  driverPhone: string;
  onSuccess: (provider: string, amountMinor: number) => void;
}

export function DriverPayoutModal({
  isOpen,
  onClose,
  availableAmountMinor,
  currency,
  driverPhone,
  onSuccess,
}: DriverPayoutModalProps) {
  const [provider, setProvider] = useState<PaymentProviderId>('MPESA');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [txRef, setTxRef] = useState('');

  if (!isOpen) return null;

  const providers = [
    { id: 'MPESA' as PaymentProviderId, name: 'Vodacom M-Pesa', color: 'border-red-500' },
    { id: 'AIRTEL' as PaymentProviderId, name: 'Airtel Money', color: 'border-red-600' },
    { id: 'ORANGE' as PaymentProviderId, name: 'Orange Money', color: 'border-orange-500' },
  ];

  const handleConfirmPayout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
      const generatedRef = `TX-WDR-${Math.floor(100000 + Math.random() * 900000)}`;
      setTxRef(generatedRef);
      onSuccess(provider, availableAmountMinor);
    }, 1200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="driver-payout-modal"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-accent-500 text-neutral-950 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-neutral-900 dark:text-white">
                Retrait Immédiat des Gains
              </h3>
              <p className="text-2xs text-neutral-400">
                Paiement instantané Mobile Money sans frais
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isComplete ? (
          <div className="space-y-4">
            {/* Amount card */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-center space-y-1">
              <span className="text-2xs font-bold text-neutral-400 uppercase tracking-wider">
                Montant net transféré
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {formatCurrency(availableAmountMinor, currency)}
              </div>
              <span className="text-2xs text-neutral-500 font-medium block">
                Frais Transnumerica : 0 CDF (Pris en charge)
              </span>
            </div>

            {/* Provider selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
                Recevoir sur votre compte Mobile Money :
              </label>
              <div className="grid grid-cols-3 gap-2">
                {providers.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProvider(p.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all text-xs font-black flex flex-col items-center gap-1 ${
                      provider === p.id
                        ? 'bg-accent-50 dark:bg-accent-950/80 border-accent-500 text-neutral-950 dark:text-accent-300 ring-2 ring-accent-400/30'
                        : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-accent-500" />
                    <span className="truncate text-[11px]">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Target phone */}
            <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-500">Numéro enregistré :</span>
              <span className="font-mono font-black text-neutral-900 dark:text-white">
                {driverPhone}
              </span>
            </div>

            {/* Submit Payout Button */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleConfirmPayout}
              data-testid="confirm-driver-payout-btn"
              className="w-full min-h-[52px] bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-elevation-2 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {isProcessing ? (
                <>
                  <Clock className="w-4 h-4 animate-spin text-white" />
                  <span>Traitement USSD en cours...</span>
                </>
              ) : (
                <>
                  <span>Transférer {formatCurrency(availableAmountMinor, currency)}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        ) : (
          /* Success confirmation */
          <div className="space-y-4 text-center py-3 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 mx-auto flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="font-black text-base text-neutral-900 dark:text-white">
                Virement Effectué avec Succès !
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Les fonds ont été déposés sur votre compte Mobile Money. Vous allez recevoir la notification SMS de l&apos;opérateur sous quelques instants.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-mono">
              <span className="text-neutral-400 block text-2xs">RÉFÉRENCE USSD :</span>
              <span className="font-black text-neutral-900 dark:text-white text-sm">{txRef}</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-black text-xs rounded-xl transition-all"
            >
              Fermer et retourner au tableau de bord
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

