'use client';

import React, { useEffect, useRef } from 'react';
import { PaymentReceipt } from '@/types';
import { formatCurrency } from '@/lib/currency';
import {
  X,
  Printer,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Download,
  Building2,
  Calendar,
  CreditCard,
  Hash,
} from 'lucide-react';

interface ReceiptModalProps {
  receipt: PaymentReceipt | null;
  onClose: () => void;
}

export function ReceiptModal({ receipt, onClose }: ReceiptModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && receipt) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [receipt, onClose]);

  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const whatsappShareText = encodeURIComponent(
    `📄 Reçu officiel Transnumerica RDC\nN°: ${receipt.receiptNumber}\nTrajet: ${receipt.title}\nMontant: ${formatCurrency(receipt.amountMinor, receipt.currency)}\nMode: ${receipt.paymentMethod}\nStatut: PAYÉ & CERTIFIÉ`
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-modal-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Receipt Header (Dark Blue / Gold Transnumerica Brand) */}
        <div className="bg-primary-900 text-white p-5 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le reçu"
            className="absolute top-4 right-4 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-500 text-neutral-950 font-black flex items-center justify-center text-lg shadow-sm">
              TN
            </div>
            <div>
              <h2 id="receipt-modal-title" className="text-base font-black text-white leading-tight">
                Reçu Officiel de Paiement
              </h2>
              <p className="text-2xs text-white/70 font-mono">
                Réf: {receipt.receiptNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Company Stamp / Legal Header */}
          <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3 flex items-start justify-between gap-2">
            <div>
              <span className="font-black text-sm text-neutral-900 dark:text-white block">
                Transnumerica SARL
              </span>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block font-medium">
                Plateforme Numérique de Mobilité en RDC
              </span>
              <span className="text-[9px] text-neutral-400 font-mono block">
                RCCM: CD/KIN/RCCM/24-B-01492 • Id. Nat.: 01-93-N48201L
              </span>
            </div>

            <div className="text-right shrink-0">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px] uppercase">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Réglement Validé</span>
              </span>
            </div>
          </div>

          {/* Transaction Metadata */}
          <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 text-[11px]">
            <div>
              <span className="text-neutral-400 block text-[10px]">Date et Heure</span>
              <span className="font-bold text-neutral-800 dark:text-neutral-200 font-mono">
                {receipt.date}
              </span>
            </div>
            <div className="text-right">
              <span className="text-neutral-400 block text-[10px]">Dossier Voyage</span>
              <span className="font-bold text-primary-900 dark:text-accent-400 font-mono">
                {receipt.bookingRef}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px]">Mode de règlement</span>
              <span className="font-bold text-neutral-800 dark:text-neutral-200">
                {receipt.paymentMethod}
              </span>
            </div>
            <div className="text-right">
              <span className="text-neutral-400 block text-[10px]">Type de service</span>
              <span className="font-bold text-neutral-800 dark:text-neutral-200 uppercase">
                {receipt.serviceType === 'BUS' ? 'Bus Interurbain' : 'Taxi / Wewa'}
              </span>
            </div>
          </div>

          {/* Description & Itemized Price */}
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">
              Prestation facturée :
            </span>

            <div className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-700/80 space-y-2">
              <div className="flex items-center justify-between font-bold text-neutral-900 dark:text-white">
                <span>{receipt.title}</span>
                <span className="font-mono">
                  {formatCurrency(receipt.amountMinor, receipt.currency)}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {receipt.description}
              </p>
            </div>
          </div>

          {/* Calculation & VAT */}
          <div className="space-y-1.5 pt-1 text-[11px]">
            <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
              <span>Montant Hors Taxe (HT)</span>
              <span className="font-mono font-bold">
                {formatCurrency(receipt.amountMinor - receipt.vatAmountMinor, receipt.currency)}
              </span>
            </div>
            <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
              <span>TVA République Démocratique du Congo (16%)</span>
              <span className="font-mono font-bold">
                {formatCurrency(receipt.vatAmountMinor, receipt.currency)}
              </span>
            </div>
            <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
              <span>Frais de transaction Mobile Money</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                0 {receipt.currency} (Inclus / Offerts)
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-700 text-sm font-black text-neutral-900 dark:text-white">
              <span>Total TTC Réglé</span>
              <span className="text-base text-primary-900 dark:text-accent-400 font-mono">
                {formatCurrency(receipt.amountMinor, receipt.currency)}
              </span>
            </div>
          </div>

          {/* Trust stamp */}
          <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[10px] text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Certificat fiscal horodaté électroniquement. Valable pour remboursement d&apos;entreprise ou justificatif comptable.
            </span>
          </div>
        </div>

        {/* Action Controls (Print, WhatsApp Share) */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850 shrink-0 grid grid-cols-2 gap-2 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer / PDF</span>
          </button>

          <a
            href={`https://wa.me/?text=${whatsappShareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all text-center"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}

