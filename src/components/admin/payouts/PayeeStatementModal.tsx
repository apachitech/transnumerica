'use client';

import React, { useState, useEffect } from 'react';
import { PayeeAccount, PayeeStatement } from '@/types';
import {
  X,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  Smartphone,
  Building,
} from 'lucide-react';

interface PayeeStatementModalProps {
  payee: PayeeAccount | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PayeeStatementModal({
  payee,
  isOpen,
  onClose,
}: PayeeStatementModalProps) {
  const [statement, setStatement] = useState<PayeeStatement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!payee || !isOpen) return;

    setLoading(true);
    setError(null);

    fetch(`/api/admin/payouts/payees/${payee.id}/statement`)
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Impossible de charger le relevé');
        }
        return res.json();
      })
      .then((data) => setStatement(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [payee, isOpen]);

  if (!isOpen || !payee) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-zinc-800 flex items-start justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{payee.payeeName}</h2>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                  {payee.id}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2">
                <span>{payee.phone}</span>
                <span>•</span>
                <span>{payee.preferredPayoutMethod}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer la modal"
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {loading ? (
            <div className="space-y-4">
              <div className="h-24 bg-zinc-800/40 rounded-xl animate-pulse" />
              <div className="h-48 bg-zinc-800/40 rounded-xl animate-pulse" />
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              {error}
            </div>
          ) : statement ? (
            <>
              {/* Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-zinc-800/50 rounded-xl border border-zinc-800">
                  <span className="text-xs text-zinc-400">Solde Initial</span>
                  <p className="text-sm font-bold text-zinc-200 mt-1">
                    {statement.startingBalanceCdf.toLocaleString('fr-FR')} CDF
                  </p>
                </div>
                <div className="p-3 bg-zinc-800/50 rounded-xl border border-zinc-800">
                  <span className="text-xs text-zinc-400">Revenus Bruts</span>
                  <p className="text-sm font-bold text-emerald-400 mt-1">
                    +{statement.totalGrossRevenueCdf.toLocaleString('fr-FR')} CDF
                  </p>
                </div>
                <div className="p-3 bg-zinc-800/50 rounded-xl border border-zinc-800">
                  <span className="text-xs text-zinc-400">Commissions Prélevées</span>
                  <p className="text-sm font-bold text-amber-400 mt-1">
                    -{statement.totalCommissionDeductedCdf.toLocaleString('fr-FR')} CDF
                  </p>
                </div>
                <div className="p-3 bg-blue-950/20 rounded-xl border border-blue-500/30">
                  <span className="text-xs text-blue-400 font-medium">Solde Actuel Disponible</span>
                  <p className="text-base font-extrabold text-white mt-1">
                    {statement.closingBalanceCdf.toLocaleString('fr-FR')} CDF
                  </p>
                </div>
              </div>

              {/* Transactions Ledger Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Journal des Transactions & Règlements ({statement.transactions.length})
                </h3>

                {statement.transactions.length === 0 ? (
                  <div className="p-8 text-center bg-zinc-950/40 rounded-xl border border-zinc-800">
                    <p className="text-xs text-zinc-500">Aucune transaction enregistrée sur la période.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-800/60 rounded-xl border border-zinc-800 overflow-hidden bg-zinc-950/40">
                    {statement.transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="p-3 sm:p-4 flex items-center justify-between hover:bg-zinc-800/30 transition text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                tx.type === 'ADJUSTMENT'
                                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}
                            >
                              {tx.type}
                            </span>
                            <span className="text-zinc-400 font-mono text-[11px]">{tx.reference}</span>
                          </div>
                          <p className="text-zinc-200">{tx.description}</p>
                          <p className="text-[10px] text-zinc-500">
                            {new Date(tx.date).toLocaleString('fr-FR')}
                          </p>
                        </div>

                        <div className="text-right space-y-0.5">
                          <p
                            className={`font-bold font-mono text-sm ${
                              tx.netCdf >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {tx.netCdf >= 0 ? '+' : ''}
                            {tx.netCdf.toLocaleString('fr-FR')} CDF
                          </p>
                          {tx.grossCdf > 0 && (
                            <p className="text-[10px] text-zinc-500">
                              Brut: {tx.grossCdf.toLocaleString('fr-FR')} • Com: -{tx.commissionCdf.toLocaleString('fr-FR')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            Fermer le relevé
          </button>
        </div>
      </div>
    </div>
  );
}

