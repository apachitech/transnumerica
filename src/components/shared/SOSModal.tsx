'use client';

import React, { useState } from 'react';
import { AlertTriangle, Phone, ShieldAlert, Share2, X, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/lib/store';

export function SOSModal({
  isOpen,
  onClose,
  currentLandmark = 'Kinshasa, RD Congo',
}: {
  isOpen: boolean;
  onClose: () => void;
  currentLandmark?: string;
}) {
  const { t } = useApp();
  const [alertTriggered, setAlertTriggered] = useState(false);

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleTriggerSOS = () => {
    setAlertTriggered(true);
    // In production, posts to backend /api/safety/sos
  };

  const whatsappEmergencyUrl = `https://wa.me/243810000000?text=${encodeURIComponent(
    `🚨 [URGENCE TRANSNUMERICA SOS] Alerte déclenchée par un passager.\nPosition approximative : ${currentLandmark}\nHeure : ${new Date().toLocaleTimeString(
      'fr-CD'
    )}`
  )}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sos-title"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-5 shadow-2xl border-2 border-red-500 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-red-100 dark:border-red-950">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-black text-lg">
            <ShieldAlert className="w-6 h-6 animate-pulse" aria-hidden="true" />
            <h2 id="sos-title" className="text-base font-black">Assistance d&apos;Urgence SOS</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la boîte de dialogue SOS"
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!alertTriggered ? (
          <>
            <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl text-red-800 dark:text-red-300 text-xs leading-relaxed">
              <p className="font-semibold mb-1">
                Alerte de sécurité et géolocalisation d&apos;urgence
              </p>
              En appuyant sur le bouton ci-dessous, une alerte prioritaire sera envoyée à l&apos;équipe de sécurité Transnumerica et aux services de secours locaux avec votre position : <strong>{currentLandmark}</strong>.
            </div>

            <div className="space-y-2.5">
              <button
                onClick={handleTriggerSOS}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-base rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-transform"
              >
                <AlertTriangle className="w-5 h-5" />
                DÉCLENCHER L&apos;ALERTE SOS
              </button>

              <a
                href={whatsappEmergencyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 text-center"
              >
                <Share2 className="w-4 h-4" />
                Alerter l&apos;équipe sur WhatsApp
              </a>

              <a
                href="tel:112"
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 text-center"
              >
                <Phone className="w-4 h-4" />
                Appeler le Numéro d&apos;Urgence (112)
              </a>
            </div>
          </>
        ) : (
          <div className="py-4 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-red-500 mx-auto animate-bounce" />
            <h4 className="font-bold text-base text-slate-900 dark:text-white">
              Alerte SOS Déclenchée
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              L&apos;équipe d&apos;intervention Transnumerica a reçu votre signalement avec vos coordonnées à <strong>{currentLandmark}</strong>. Gardez votre téléphone à portée.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg"
            >
              Fermer la fenêtre
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
