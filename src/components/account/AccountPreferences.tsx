'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { Language, ThemeMode, Currency, UserRole, NotificationPreferences } from '@/types';
import {
  Globe,
  Moon,
  Sun,
  Coins,
  Wifi,
  Bell,
  HelpCircle,
  LogOut,
  Users,
  Shield,
  Smartphone,
  MessageSquare,
  Check,
} from 'lucide-react';

const DEFAULT_NOTIFS: NotificationPreferences = {
  smsBoardingReminders: true,
  whatsappTripAlerts: true,
  paymentReceiptsSms: true,
  promotionsDiscounts: false,
};

export function AccountPreferences() {
  const {
    language,
    setLanguage,
    theme,
    setTheme,
    currency,
    setCurrency,
    dataSaver,
    setDataSaver,
    currentUser,
    switchRole,
    logout,
    setShowHelpCenterModal,
  } = useApp();

  const [notifs, setNotifs] = useState<NotificationPreferences>(DEFAULT_NOTIFS);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('tn_notif_prefs');
      if (stored) {
        setNotifs(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const toggleNotif = (key: keyof NotificationPreferences) => {
    const updated = {
      ...notifs,
      [key]: !notifs[key],
    };
    setNotifs(updated);
    try {
      localStorage.setItem('tn_notif_prefs', JSON.stringify(updated));
    } catch {}
  };

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'fr', label: 'Français (RDC)', flag: '🇨🇩' },
    { code: 'ln', label: 'Lingála', flag: '🇨🇩' },
    { code: 'sw', label: 'Kiswahili', flag: '🇨🇩' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Language & Display Settings */}
      <div className="bg-white dark:bg-neutral-850 border border-neutral-200/90 dark:border-neutral-750 rounded-3xl p-5 sm:p-6 shadow-elevation-1 space-y-5">
        <h3 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-accent-500" />
          <span>Langue &amp; Affichage</span>
        </h3>

        {/* Language selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
            Langue de l&apos;application
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {languages.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLanguage(l.code)}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                  language === l.code
                    ? 'bg-primary-900 dark:bg-primary-500 text-white dark:text-neutral-950 border-primary-900 dark:border-primary-500 shadow-sm'
                    : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                </span>
                {language === l.code && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>

        {/* Theme mode */}
        <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
            Thème visuel
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                theme === 'light'
                  ? 'bg-primary-900 dark:bg-primary-500 text-white dark:text-neutral-950 border-primary-900 dark:border-primary-500 shadow-sm'
                  : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Clair</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                theme === 'dark'
                  ? 'bg-primary-900 dark:bg-primary-500 text-white dark:text-neutral-950 border-primary-900 dark:border-primary-500 shadow-sm'
                  : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
              }`}
            >
              <Moon className="w-4 h-4 text-accent-400" />
              <span>Sombre</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                theme === 'system'
                  ? 'bg-primary-900 dark:bg-primary-500 text-white dark:text-neutral-950 border-primary-900 dark:border-primary-500 shadow-sm'
                  : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
              }`}
            >
              <span>Auto (Système)</span>
            </button>
          </div>
        </div>

        {/* Currency & Data Saver */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          {/* Currency Toggle */}
          <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-xs text-neutral-900 dark:text-white block">
                Devise préférée
              </span>
              <span className="text-[11px] text-neutral-400">
                Affichage en Francs ou Dollars
              </span>
            </div>

            <div className="flex items-center gap-1 bg-neutral-200 dark:bg-neutral-700 p-1 rounded-xl text-xs font-black">
              <button
                type="button"
                onClick={() => setCurrency('CDF')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  currency === 'CDF'
                    ? 'bg-accent-500 text-neutral-950 shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                CDF
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  currency === 'USD'
                    ? 'bg-accent-500 text-neutral-950 shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                USD
              </button>
            </div>
          </div>

          {/* Data Saver Mode */}
          <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-xs text-neutral-900 dark:text-white block">
                Économie de données (2G/3G)
              </span>
              <span className="text-[11px] text-neutral-400">
                Allège le chargement sur réseau faible
              </span>
            </div>

            <button
              type="button"
              onClick={() => setDataSaver((prev) => !prev)}
              aria-pressed={dataSaver}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                dataSaver ? 'bg-emerald-600' : 'bg-neutral-300 dark:bg-neutral-600'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  dataSaver ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Notification Preferences */}
      <div className="bg-white dark:bg-neutral-850 border border-neutral-200/90 dark:border-neutral-750 rounded-3xl p-5 sm:p-6 shadow-elevation-1 space-y-4">
        <h3 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-accent-500" />
          <span>Préférences de Notification</span>
        </h3>

        <div className="space-y-3 text-xs">
          {/* SMS Reminder */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60">
            <div className="space-y-0.5">
              <span className="font-bold text-neutral-900 dark:text-white block">
                Rappels d&apos;embarquement par SMS
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">
                Recevez un SMS gratuit 1 heure avant le départ du bus
              </span>
            </div>
            <button
              type="button"
              onClick={() => toggleNotif('smsBoardingReminders')}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                notifs.smsBoardingReminders ? 'bg-emerald-600' : 'bg-neutral-300 dark:bg-neutral-600'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  notifs.smsBoardingReminders ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* WhatsApp Alert */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60">
            <div className="space-y-0.5">
              <span className="font-bold text-neutral-900 dark:text-white block">
                Suivi de course en direct sur WhatsApp
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">
                Partage automatique de l&apos;avancée du chauffeur et du code PIN
              </span>
            </div>
            <button
              type="button"
              onClick={() => toggleNotif('whatsappTripAlerts')}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                notifs.whatsappTripAlerts ? 'bg-emerald-600' : 'bg-neutral-300 dark:bg-neutral-600'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  notifs.whatsappTripAlerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Receipts via SMS */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60">
            <div className="space-y-0.5">
              <span className="font-bold text-neutral-900 dark:text-white block">
                Confirmation de paiement instantanée par SMS
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">
                Réception de la référence de paiement dès validation USSD
              </span>
            </div>
            <button
              type="button"
              onClick={() => toggleNotif('paymentReceiptsSms')}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                notifs.paymentReceiptsSms ? 'bg-emerald-600' : 'bg-neutral-300 dark:bg-neutral-600'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  notifs.paymentReceiptsSms ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Role Switcher & Help */}
      <div className="bg-white dark:bg-neutral-850 border border-neutral-200/90 dark:border-neutral-750 rounded-3xl p-5 sm:p-6 shadow-elevation-1 space-y-4">
        <h3 className="text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-accent-500" />
          <span>Espace &amp; Assistance</span>
        </h3>

        {/* Role switcher */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
            Basculer d&apos;espace de démonstration :
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {(['PASSENGER', 'DRIVER'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => switchRole(r)}
                className={`p-3 rounded-xl border font-bold text-left transition-all flex items-center justify-between ${
                  currentUser.role === r
                    ? 'bg-accent-50 dark:bg-accent-950/60 border-accent-500 text-neutral-950 dark:text-accent-300 shadow-sm'
                    : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                }`}
              >
                <span>
                  {r === 'PASSENGER'
                    ? '👤 Passager'
                    : '🏍️ Chauffeur Partenaire'}
                </span>
                {currentUser.role === r && <Check className="w-4 h-4 text-accent-600" />}
              </button>
            ))}
          </div>
        </div>

        {/* Help Center Trigger */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowHelpCenterModal(true)}
            className="w-full sm:w-auto px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-800 dark:text-neutral-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-accent-500" />
            <span>Centre d&apos;Aide &amp; Sécurité</span>
          </button>

          {/* Logout button */}
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full sm:w-auto px-4 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Se déconnecter</span>
          </button>
        </div>
      </div>

      {/* Logout confirmation dialog */}
      {showLogoutConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300 mx-auto flex items-center justify-center">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="font-extrabold text-base text-neutral-900 dark:text-white">
                Voulez-vous vous déconnecter ?
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Vos billets enregistrés resteront accessibles sur cet appareil en mode hors-ligne.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-bold rounded-xl"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-md"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

