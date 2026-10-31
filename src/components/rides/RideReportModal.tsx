'use client';

import React, { useState } from 'react';
import { AlertCircle, X, CheckCircle2, MessageSquare, Phone, Package, ShieldCheck } from 'lucide-react';
import { Ride } from '@/types';

interface RideReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  ride: Ride;
}

const REPORT_CATEGORIES = [
  { id: 'lost_item', label: 'Objet oublié à bord', icon: Package },
  { id: 'behavior', label: 'Comportement ou sécurité', icon: ShieldCheck },
  { id: 'fare_dispute', label: 'Litige sur le tarif payé', icon: AlertCircle },
  { id: 'route', label: 'Problème d\'itinéraire', icon: AlertCircle },
  { id: 'other', label: 'Autre question ou réclamation', icon: MessageSquare },
];

export function RideReportModal({ isOpen, onClose, ride }: RideReportModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('lost_item');
  const [description, setDescription] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const whatsappSupportUrl = `https://wa.me/243810000000?text=${encodeURIComponent(
    `🚨 *Signalement Transnumerica Course ${ride.id}*\n` +
      `Chauffeur : ${ride.driver.name} (${ride.driver.vehiclePlate})\n` +
      `Catégorie : ${selectedCategory}\n` +
      `Détail : ${description || 'Demande d\'assistance passager'}\n` +
      `Passager : ${ride.request.passengerName} (${ride.request.passengerPhone})`
  )}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4"
    >
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-in fade-in slide-in-from-bottom-6">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <h3 id="report-modal-title" className="font-extrabold text-sm text-neutral-900 dark:text-white">
              Signaler un problème sur cette course
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="font-extrabold text-sm text-neutral-900 dark:text-white">
              Signalement enregistré avec succès !
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Notre équipe support a reçu les informations de votre course auprès de{' '}
              <strong>{ride.driver.name}</strong>. Nous vous recontacterons sous 30 minutes.
            </p>
            <div className="pt-2">
              <a
                href={whatsappSupportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Suivre sur WhatsApp support</span>
              </a>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 mt-2 block mx-auto"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Type d&apos;incident :
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {REPORT_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full p-2.5 rounded-xl text-xs font-semibold border flex items-center gap-2.5 transition-all text-left ${
                        selectedCategory === cat.id
                          ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/40 text-primary-900 dark:text-primary-200'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0 text-primary-500" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Précisions supplémentaires :
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez l'incident ou l'objet oublié (marque, couleur...)"
                rows={3}
                className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>

            <div className="pt-1 space-y-2">
              <button
                type="submit"
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs rounded-xl shadow-md min-h-[46px]"
              >
                Envoyer le signalement
              </button>

              <a
                href="tel:+243810000000"
                className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 text-primary-500" />
                <span>Assistance d&apos;urgence (+243 810 000 000)</span>
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

