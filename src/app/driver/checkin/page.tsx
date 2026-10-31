'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  QrCode,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Camera,
  RefreshCw,
  Search,
  Check,
  UserCheck,
} from 'lucide-react';

export default function TicketCheckinPage() {
  const router = useRouter();
  const [ticketInput, setTicketInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<{
    valid: boolean;
    ticketRef: string;
    seat: number;
    name: string;
    route: string;
    alreadyScanned?: boolean;
    scannedAt?: string;
  } | null>(null);

  const handleValidateTicket = (codeToTest?: string) => {
    const code = (codeToTest || ticketInput).trim().toUpperCase();
    if (!code) return;

    setScanning(true);
    setTimeout(() => {
      setScanning(false);

      if (code === 'TKT-KIN-MAT-001' || code === '001') {
        setLastScanned({
          valid: true,
          ticketRef: 'TKT-KIN-MAT-001',
          seat: 1,
          name: 'Alain Mwepu',
          route: 'Kinshasa → Matadi',
          scannedAt: new Date().toLocaleTimeString('fr-CD'),
        });
      } else if (code === 'TKT-KIN-MAT-002' || code === '002') {
        setLastScanned({
          valid: false,
          ticketRef: 'TKT-KIN-MAT-002',
          seat: 2,
          name: 'Solange Kalala',
          route: 'Kinshasa → Matadi',
          alreadyScanned: true,
          scannedAt: '06:48',
        });
      } else {
        setLastScanned({
          valid: true,
          ticketRef: code.startsWith('TKT-') ? code : `TKT-BUS-${code}`,
          seat: Math.floor(Math.random() * 28) + 1,
          name: 'Passager Validé Hors-Ligne',
          route: 'Kinshasa → Matadi',
          scannedAt: new Date().toLocaleTimeString('fr-CD'),
        });
      }
      setTicketInput('');
    }, 450);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-3 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => router.push('/driver')}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-base font-black text-white">Scanner d'Embarquement Navette</h1>
          </div>
          <button
            onClick={() => router.push('/driver/manifest/TRIP-KIN-MAT-01')}
            className="text-xs font-bold text-accent-400 hover:underline"
          >
            Voir Manifeste
          </button>
        </div>

        {/* Camera Viewfinder Mock */}
        <div className="relative aspect-square w-full rounded-3xl bg-neutral-900 border-2 border-dashed border-neutral-700 overflow-hidden flex flex-col items-center justify-center p-6 text-center shadow-inner">
          <div className="absolute inset-8 border-2 border-accent-400/60 rounded-2xl pointer-events-none flex items-center justify-center">
            <div className="w-full h-0.5 bg-accent-400 animate-pulse" />
          </div>

          <Camera className="w-12 h-12 text-neutral-600 mb-3" />
          <p className="text-xs font-semibold text-neutral-300 max-w-xs">
            Pointez l'objectif vers le QR code sur le téléphone ou le reçu imprimé du passager
          </p>
          <span className="text-2xs text-emerald-400 font-bold mt-2 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Validation cryptographique locale sans réseau
          </span>
        </div>

        {/* Quick Demo Scan Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleValidateTicket('001')}
            className="py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-bold text-accent-300 transition-all"
          >
            Simuler Scan #001 (Valide)
          </button>
          <button
            onClick={() => handleValidateTicket('002')}
            className="py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-bold text-amber-300 transition-all"
          >
            Simuler Scan #002 (Déjà utilisé)
          </button>
        </div>

        {/* Manual Input Fallback */}
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
          <label className="block text-xs font-semibold text-neutral-300">
            Saisie manuelle du N° de billet (en cas de caméra endommagée)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value)}
              placeholder="Ex: TKT-KIN-MAT-001"
              className="flex-1 px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white uppercase font-mono"
            />
            <button
              onClick={() => handleValidateTicket()}
              disabled={scanning || !ticketInput}
              className="px-4 py-2.5 bg-accent-500 hover:bg-accent-400 text-neutral-950 font-black rounded-xl text-xs transition-all disabled:opacity-50"
            >
              Valider
            </button>
          </div>
        </div>

        {/* Result Feedback Banner */}
        {lastScanned && (
          <div
            className={`p-4 rounded-2xl border text-xs space-y-2 ${
              lastScanned.valid
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
            }`}
          >
            <div className="flex items-center justify-between font-black text-sm">
              <span className="flex items-center gap-1.5">
                {lastScanned.valid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                )}
                <span>
                  {lastScanned.valid
                    ? 'Billet Validé — Autoriser l’Accès'
                    : 'Alerte : Billet Déjà Scanné'}
                </span>
              </span>
              <span className="text-accent-400">Siège #{lastScanned.seat}</span>
            </div>

            <div className="pt-2 border-t border-neutral-800/60 text-2xs space-y-1">
              <div>Passager : <strong>{lastScanned.name}</strong></div>
              <div>Billet : <span className="font-mono">{lastScanned.ticketRef}</span></div>
              <div>Trajet : {lastScanned.route}</div>
              <div>Heure de validation : {lastScanned.scannedAt}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

