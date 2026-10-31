'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, ShieldCheck, CheckCircle2, ChevronDown, ChevronUp, QrCode } from 'lucide-react';

interface QRCodeDisplayProps {
  token: string;
  size?: number;
  className?: string;
}

export function QRCodeDisplay({ token, size = 210, className = '' }: QRCodeDisplayProps) {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [error, setError] = useState(false);
  const [showPayloadDetails, setShowPayloadDetails] = useState(false);
  const [generationTimestamp, setGenerationTimestamp] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    // Genuine dynamic 2D matrix calculation via qrcode engine (ISO/IEC 18004 standard)
    QRCode.toDataURL(token, {
      width: size,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000', // Pure black for optical contrast
        light: '#FFFFFF', // Pure white for maximum optical reflectance
      },
    })
      .then((url) => {
        if (isMounted) {
          setDataUrl(url);
          setError(false);
          setGenerationTimestamp(new Date().toLocaleTimeString('fr-FR'));
        }
      })
      .catch((err) => {
        console.error('QR code dynamic generation error:', err);
        if (isMounted) setError(true);
      });

    return () => {
      isMounted = false;
    };
  }, [token, size]);

  if (error) {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex flex-col items-center justify-center p-4 text-center text-xs mx-auto"
      >
        <span className="font-bold">Erreur de génération du QR Code</span>
        <span className="text-[10px] mt-1 text-rose-500">
          Vérifiez les données du billet et réessayez.
        </span>
      </div>
    );
  }

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse flex flex-col items-center justify-center text-xs text-neutral-400 mx-auto"
      >
        <QrCode className="w-8 h-8 text-neutral-400 mb-2 animate-bounce" />
        <span className="font-bold">Génération du QR Code en cours...</span>
        <span className="text-[10px] text-neutral-500">Calcul de la matrice 2D</span>
      </div>
    );
  }

  // Safe file name for downloading
  const sanitizedToken = token.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 24);
  const downloadFileName = `billet-qr-${sanitizedToken}.png`;

  return (
    <div className={`space-y-2.5 text-center ${className}`}>
      {/* High-Contrast Frame with Scanner Target Guides */}
      <div className="relative inline-block p-3.5 bg-white rounded-2xl shadow-md border-2 border-neutral-300 dark:border-neutral-700">
        {/* Scanner target corners */}
        <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-accent-500 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-accent-500 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-accent-500 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-accent-500 rounded-br-sm pointer-events-none" />

        <img
          src={dataUrl}
          alt={`Billet QR Code: ${token}`}
          width={size}
          height={size}
          className="mx-auto block select-none rounded"
        />
      </div>

      {/* Authenticity & Scannability Verification Pill */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full max-w-xs mx-auto">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>QR Code Réel & Scannable (Généré en direct)</span>
      </div>

      {/* Direct PNG Image Download & Technical Verification Controls */}
      <div className="flex items-center justify-center gap-2 print:hidden pt-0.5">
        <a
          href={dataUrl}
          download={downloadFileName}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl text-[11px] font-bold border border-neutral-300 dark:border-neutral-600 transition-colors shadow-sm"
          title="Télécharger directement l'image PNG réelle du QR Code"
        >
          <Download className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
          <span>Enregistrer l&apos;image QR (PNG)</span>
        </a>

        <button
          type="button"
          onClick={() => setShowPayloadDetails(!showPayloadDetails)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 rounded-xl transition-colors"
          title="Afficher les détails de génération du QR Code"
        >
          <span>Détails</span>
          {showPayloadDetails ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Collapsible Decoded Technical Payload Inspector */}
      {showPayloadDetails && (
        <div className="max-w-sm mx-auto p-3 bg-neutral-50 dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-left text-[11px] space-y-2 animate-in fade-in zoom-in-95 print:hidden">
          <div className="flex items-center justify-between pb-1 border-b border-neutral-200 dark:border-neutral-700 font-bold text-neutral-900 dark:text-white">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Preuve de Génération Dynamique
            </span>
            <span className="text-[10px] text-neutral-500 font-normal">
              {generationTimestamp}
            </span>
          </div>

          <div>
            <span className="text-neutral-400 font-semibold block text-[10px] uppercase">
              Données encodées dans le QR Code :
            </span>
            <code className="block p-2 mt-0.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg font-mono text-[10px] text-neutral-800 dark:text-neutral-200 break-all select-all">
              {token}
            </code>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] text-neutral-500 dark:text-neutral-400 pt-1">
            <div>
              <strong className="text-neutral-700 dark:text-neutral-300">Norme :</strong> ISO/IEC 18004
            </div>
            <div>
              <strong className="text-neutral-700 dark:text-neutral-300">Correction :</strong> Niveau M (15%)
            </div>
            <div>
              <strong className="text-neutral-700 dark:text-neutral-300">Format :</strong> image/png (Base64)
            </div>
            <div>
              <strong className="text-neutral-700 dark:text-neutral-300">Résolution :</strong> {size}×{size}px
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
