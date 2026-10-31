'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import {
  ShieldCheck,
  Edit3,
  Calendar,
  Phone,
  Mail,
  Award,
  Sparkles,
  Check,
  X,
  UserCheck,
  BookOpen,
  Download,
} from 'lucide-react';

export function AccountProfileCard() {
  const { currentUser, setCurrentUser } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [email, setEmail] = useState('patrick.mwamba@gmail.com');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentUser({
      ...currentUser,
      name: name.trim(),
      phone: phone.trim(),
    });
    try {
      localStorage.setItem(
        'tn_user',
        JSON.stringify({ ...currentUser, name: name.trim(), phone: phone.trim() })
      );
    } catch {}

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsEditing(false);
    }, 800);
  };

  return (
    <>
      <div className="bg-white dark:bg-neutral-850 border border-neutral-200/90 dark:border-neutral-750 rounded-3xl p-5 sm:p-6 shadow-elevation-1 space-y-5">
        {/* Top Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            {/* Avatar with Verified Ring */}
            <div className="relative">
              <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-gradient-to-tr from-amber-400 via-amber-300 to-primary-600 p-0.5 shadow-md">
                <div className="w-full h-full rounded-full bg-neutral-900 text-amber-300 flex items-center justify-center font-black text-xl sm:text-2xl">
                  {currentUser.name
                    ? currentUser.name
                        .split(' ')
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join('')
                    : 'PM'}
                </div>
              </div>
              <span
                title="Identité vérifiée Transnumerica RDC"
                className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 shadow-md border-2 border-white dark:border-neutral-850"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Name, Badges & Contact */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white">
                  {currentUser.name}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-black border border-emerald-300 dark:border-emerald-800">
                  <UserCheck className="w-3 h-3" />
                  <span>Passager Vérifié</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{currentUser.phone}</span>
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{email}</span>
                </span>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[11px] text-neutral-400">
                <Calendar className="w-3 h-3 text-amber-500" />
                <span>Membre actif depuis Octobre 2024 • Kinshasa</span>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-800 dark:text-neutral-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors active:scale-95 shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5 text-neutral-500" />
            <span>Modifier</span>
          </button>
        </div>

        {/* Congolese Mobility Stats Bar */}
        <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl text-center">
            <span className="text-base sm:text-lg font-black text-neutral-900 dark:text-white block font-mono">
              14
            </span>
            <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-tight">
              Voyages réalisés
            </span>
          </div>

          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl text-center">
            <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 block font-mono">
              45 000 CDF
            </span>
            <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-tight">
              Économisés
            </span>
          </div>

          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl text-center">
            <span className="text-base sm:text-lg font-black text-amber-800 dark:text-amber-400 block font-mono">
              98%
            </span>
            <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-tight">
              Ponctualité
            </span>
          </div>
        </div>

        {/* Guide Book Download Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 border border-sky-200 dark:border-sky-900/60 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-neutral-900 dark:text-white">
                Guide Officiel d'Utilisation (Livre PDF)
              </h4>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-300">
                Manuel illustré complet : bus, courses moto, tickets QR et paiements Mobile Money en RDC.
              </p>
            </div>
          </div>
          <a
            href="/api/guide/download"
            download="TRANSNUMERICA_GUIDE_UTILISATEUR.pdf"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs rounded-xl shadow-sm transition-all shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Télécharger le Guide PDF</span>
          </a>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-profile-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <h3 id="edit-profile-title" className="font-extrabold text-sm text-neutral-900 dark:text-white">
                Modifier mon profil
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Nom et Prénom *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-accent-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Numéro de téléphone portable *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-accent-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Adresse e-mail (reçus fiscaux)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-accent-400"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savedSuccess}
                  className="flex-1 py-3 bg-primary-900 hover:bg-primary-950 dark:bg-primary-500 text-white dark:text-neutral-950 font-black rounded-xl shadow-md flex items-center justify-center gap-1.5"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Enregistré !</span>
                    </>
                  ) : (
                    <span>Enregistrer</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

