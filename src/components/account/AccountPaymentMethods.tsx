'use client';

import React, { useState, useEffect } from 'react';
import { SavedPaymentMethod, PaymentProviderId } from '@/types';
import { AccountEmptyState } from './AccountEmptyState';
import {
  CreditCard,
  Smartphone,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Star,
  X,
  Lock,
} from 'lucide-react';

const DEFAULT_PAYMENTS: SavedPaymentMethod[] = [
  {
    id: 'pay-mpesa-1',
    type: 'MOMO',
    provider: 'MPESA',
    providerName: 'Vodacom M-Pesa',
    phoneOrNumber: '081 234 5678',
    holderName: 'Patrick Mwamba',
    isDefault: true,
  },
  {
    id: 'pay-airtel-2',
    type: 'MOMO',
    provider: 'AIRTEL',
    providerName: 'Airtel Money',
    phoneOrNumber: '099 876 5432',
    holderName: 'Patrick Mwamba',
    isDefault: false,
  },
  {
    id: 'pay-orange-3',
    type: 'MOMO',
    provider: 'ORANGE',
    providerName: 'Orange Money',
    phoneOrNumber: '089 555 1234',
    holderName: 'Patrick Mwamba',
    isDefault: false,
  },
  {
    id: 'pay-card-4',
    type: 'CARD',
    provider: 'VISA',
    providerName: 'Carte Visa Rawbank',
    phoneOrNumber: '•••• 4242',
    holderName: 'PATRICK MWAMBA',
    isDefault: false,
  },
];

export function AccountPaymentMethods() {
  const [payments, setPayments] = useState<SavedPaymentMethod[]>(DEFAULT_PAYMENTS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [provider, setProvider] = useState<PaymentProviderId>('MPESA');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [holderName, setHolderName] = useState('Patrick Mwamba');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('tn_saved_payments');
      if (stored) {
        setPayments(JSON.parse(stored));
      } else {
        setPayments(DEFAULT_PAYMENTS);
        localStorage.setItem('tn_saved_payments', JSON.stringify(DEFAULT_PAYMENTS));
      }
    } catch {
      setPayments(DEFAULT_PAYMENTS);
    }
  }, []);

  const savePaymentsToStorage = (updated: SavedPaymentMethod[]) => {
    setPayments(updated);
    try {
      localStorage.setItem('tn_saved_payments', JSON.stringify(updated));
    } catch {}
  };

  const handleSetDefault = (id: string) => {
    const updated = payments.map((p) => ({
      ...p,
      isDefault: p.id === id,
    }));
    savePaymentsToStorage(updated);
  };

  const handleDeletePayment = (id: string) => {
    savePaymentsToStorage(payments.filter((p) => p.id !== id));
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    const providerNames: Record<PaymentProviderId, string> = {
      MPESA: 'Vodacom M-Pesa',
      AIRTEL: 'Airtel Money',
      ORANGE: 'Orange Money',
      AFRICELL: 'Africell Money',
      VISA: 'Carte Bancaire Visa',
      MASTERCARD: 'Carte Bancaire Mastercard',
    };

    const isCard = provider === 'VISA' || provider === 'MASTERCARD';

    const newPayment: SavedPaymentMethod = {
      id: `pay-${Date.now()}`,
      type: isCard ? 'CARD' : 'MOMO',
      provider,
      providerName: providerNames[provider],
      phoneOrNumber: phoneNumber.trim(),
      holderName: holderName.trim() || 'Patrick Mwamba',
      isDefault: payments.length === 0,
    };

    savePaymentsToStorage([...payments, newPayment]);
    setPhoneNumber('');
    setShowAddModal(false);
  };

  const getProviderBrand = (providerId: PaymentProviderId) => {
    switch (providerId) {
      case 'MPESA':
        return {
          logo: '🔴',
          bgClass: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800',
          badgeColor: 'text-red-700 dark:text-red-300',
        };
      case 'AIRTEL':
        return {
          logo: '🔴',
          bgClass: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
          badgeColor: 'text-rose-700 dark:text-rose-300',
        };
      case 'ORANGE':
        return {
          logo: '🟠',
          bgClass: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800',
          badgeColor: 'text-orange-700 dark:text-orange-300',
        };
      case 'AFRICELL':
        return {
          logo: '🟣',
          bgClass: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
          badgeColor: 'text-purple-700 dark:text-purple-300',
        };
      default:
        return {
          logo: '💳',
          bgClass: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
          badgeColor: 'text-blue-700 dark:text-blue-300',
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-neutral-900 dark:text-white">
            Moyens de Paiement Enregistrés
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Comptes Mobile Money &amp; cartes bancaires sécurisés pour vos réservations
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 bg-primary-900 hover:bg-primary-950 dark:bg-primary-500 text-white dark:text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter</span>
        </button>
      </div>

      {payments.length === 0 ? (
        <AccountEmptyState
          icon={Smartphone}
          title="Aucun moyen de paiement enregistré"
          description="Ajoutez votre numéro M-Pesa, Airtel, Orange ou Africell pour payer vos billets en 1 clic."
          actionText="Ajouter un compte Mobile Money"
          onActionClick={() => setShowAddModal(true)}
        />
      ) : (
        <div className="space-y-3">
          {payments.map((p) => {
            const brand = getProviderBrand(p.provider);

            return (
              <div
                key={p.id}
                className={`bg-white dark:bg-neutral-850 border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-3 ${
                  p.isDefault
                    ? 'border-accent-500 dark:border-accent-400 ring-2 ring-accent-500/20'
                    : 'border-neutral-200/90 dark:border-neutral-750'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 border ${brand.bgClass}`}>
                    {brand.logo}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-neutral-900 dark:text-white">
                        {p.providerName}
                      </span>
                      {p.isDefault && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-accent-100 dark:bg-accent-950 text-neutral-950 dark:text-accent-300 font-extrabold text-[10px]">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>Par défaut</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-mono">
                      <span>{p.phoneOrNumber}</span>
                      <span>•</span>
                      <span className="font-sans font-medium">{p.holderName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!p.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(p.id)}
                      className="px-2.5 py-1 text-[11px] font-bold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                      Définir par défaut
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeletePayment(p.id)}
                    aria-label={`Supprimer ${p.providerName}`}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Trust & BCC Guarantee note */}
      <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200 dark:border-neutral-750 flex items-start gap-2.5 text-xs">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Paiements protégés selon les normes de la <strong>Banque Centrale du Congo (BCC)</strong>. Chaque transaction Mobile Money est confirmée par invite USSD sur votre téléphone. Transnumerica ne conserve jamais votre code secret PIN.
        </p>
      </div>

      {/* Add Payment Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-payment-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <h3 id="add-payment-title" className="font-extrabold text-sm text-neutral-900 dark:text-white">
                Ajouter un moyen de paiement
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPayment} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Opérateur ou type de carte *
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as PaymentProviderId)}
                  className="w-full min-h-[44px] px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent-400"
                >
                  <option value="MPESA">Vodacom M-Pesa (081, 082, 083)</option>
                  <option value="AIRTEL">Airtel Money (097, 098, 099)</option>
                  <option value="ORANGE">Orange Money (084, 085, 089)</option>
                  <option value="AFRICELL">Africell Money (090, 091)</option>
                  <option value="VISA">Carte Bancaire Visa</option>
                  <option value="MASTERCARD">Carte Bancaire Mastercard</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  {provider === 'VISA' || provider === 'MASTERCARD'
                    ? 'Numéro de carte (16 chiffres) *'
                    : 'Numéro de téléphone Mobile Money *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    provider === 'VISA' || provider === 'MASTERCARD'
                      ? '4242 •••• •••• 4242'
                      : '081 234 5678'
                  }
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-accent-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Nom du titulaire *
                </label>
                <input
                  type="text"
                  required
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent-400"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary-900 hover:bg-primary-950 dark:bg-primary-500 text-white dark:text-neutral-950 font-black rounded-xl shadow-md"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
