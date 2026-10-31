'use client';

import React, { useState } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Lock,
  Maximize2,
  FileText,
} from 'lucide-react';
import { DriverKycDocument } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  document: DriverKycDocument | null;
  driverName?: string;
}

export function DocumentZoomModal({ isOpen, onClose, document, driverName }: Props) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);

  if (!isOpen || !document) return null;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 250));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 75));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoomLevel(100);
    setRotation(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-3xl bg-[#0A1624] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-start justify-between bg-[#0D1E32]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xs font-mono text-neutral-400">
                Pièce #{document.documentNumber}
              </span>
              <span className="px-2 py-0.5 rounded text-3xs font-black uppercase bg-white/10 text-neutral-300">
                {document.type}
              </span>
              {document.verified && (
                <span className="px-2 py-0.5 rounded text-3xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  Vérifié
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-white">{document.name}</h3>
            {driverName && (
              <p className="text-2xs text-neutral-400">
                Titulaire : <strong className="text-white">{driverName}</strong>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 75}
                title="Dézoomer"
                className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-300 disabled:opacity-40"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-2xs font-mono text-neutral-300 px-1">{zoomLevel}%</span>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 250}
                title="Zoomer"
                className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-300 disabled:opacity-40"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleRotate}
                title="Pivoter 90°"
                className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-300"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Expiry Alerts & Reminder Banner */}
        {document.isExpired ? (
          <div className="p-3 px-5 bg-rose-950/60 border-b border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>Document expiré :</strong> La date limite de validité (
              {document.expiryDate}) est dépassée. Ce document n’est plus conforme à la réglementation RDC.
            </span>
          </div>
        ) : document.isExpiringSoon ? (
          <div className="p-3 px-5 bg-amber-950/60 border-b border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Rappel d’expiration imminente :</strong> Expire le{' '}
              {document.expiryDate} (dans moins de 30 jours). Un rappel automatique sera adressé au chauffeur.
            </span>
          </div>
        ) : null}

        {/* Zoomable Image / Document Area */}
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-neutral-950 min-h-[340px] relative select-none">
          {/* Security Watermark */}
          <div className="absolute top-3 left-4 text-3xs font-mono text-neutral-500 flex items-center gap-1.5 opacity-60 pointer-events-none">
            <Lock className="w-3 h-3 text-amber-400" />
            <span>LIEN SIGNÉ ÉPHÉMÈRE • TRANSNUMERICA RDC • USAGE ADMINISTRATIF STRICT</span>
          </div>

          <div
            style={{
              transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
              transition: 'transform 0.15s ease-out',
            }}
            className="max-w-full max-h-full flex flex-col items-center justify-center p-4"
          >
            {/* Visual Simulated Document Card with Official Styling */}
            <div className="w-full max-w-[360px] sm:max-w-[460px] bg-gradient-to-br from-[#132A45] to-[#0A1624] border-2 border-amber-400/30 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 text-neutral-200">
              <div className="flex items-start justify-between border-b border-white/10 pb-3">
                <div>
                  <div className="text-3xs uppercase tracking-widest text-amber-400 font-black">
                    RÉPUBLIQUE DÉMOCRATIQUE DU CONGO
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">{document.name}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300">
                  <FileText className="w-5 h-5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-2xs">
                <div>
                  <span className="text-neutral-400 block text-3xs uppercase">Numéro officiel :</span>
                  <span className="font-mono font-bold text-white text-xs">
                    {document.documentNumber}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-3xs uppercase">Délivré le :</span>
                  <span className="font-mono text-neutral-300">{document.issuedDate}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-3xs uppercase">Date d’expiration :</span>
                  <span
                    className={`font-mono font-bold ${
                      document.isExpired
                        ? 'text-rose-400'
                        : document.isExpiringSoon
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {document.expiryDate || 'Validité permanente'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-3xs uppercase">Statut contrôle :</span>
                  <span className="font-bold text-neutral-200">
                    {document.verified ? 'Certifié conforme' : 'En attente d’approbation'}
                  </span>
                </div>
              </div>

              {document.rejectionReason && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-3xs">
                  <strong>Rejet antérieur :</strong> {document.rejectionReason}
                </div>
              )}

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-3xs text-neutral-400 font-mono">
                <span>Régulation Ministère des Transports RDC</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-[#0D1E32] border-t border-white/10 flex items-center justify-between text-xs">
          <div className="text-2xs text-neutral-400 font-mono flex items-center gap-2">
            <span>Signature cryptographique validée</span>
            <span>•</span>
            <button
              type="button"
              onClick={handleReset}
              className="text-amber-400 hover:text-amber-300 underline font-bold"
            >
              Réinitialiser zoom (100%)
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
          >
            Fermer l’aperçu
          </button>
        </div>
      </div>
    </div>
  );
}

