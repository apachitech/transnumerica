'use client';

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { PaymentReceipt } from '@/types';
import { AccountProfileCard } from '@/components/account/AccountProfileCard';
import {
  ProfileHeaderSkeleton,
  TripCardsSkeleton,
  PlacesSkeleton,
  PaymentsSkeleton,
} from '@/components/account/AccountSkeletons';

const AccountTripHistory = dynamic(
  () => import('@/components/account/AccountTripHistory').then((m) => m.AccountTripHistory),
  { loading: () => <TripCardsSkeleton /> }
);
const AccountSavedPlaces = dynamic(
  () => import('@/components/account/AccountSavedPlaces').then((m) => m.AccountSavedPlaces),
  { loading: () => <PlacesSkeleton /> }
);
const AccountPaymentMethods = dynamic(
  () => import('@/components/account/AccountPaymentMethods').then((m) => m.AccountPaymentMethods),
  { loading: () => <PaymentsSkeleton /> }
);
const AccountReceipts = dynamic(
  () => import('@/components/account/AccountReceipts').then((m) => m.AccountReceipts)
);
const AccountPreferences = dynamic(
  () => import('@/components/account/AccountPreferences').then((m) => m.AccountPreferences)
);
const ReceiptModal = dynamic(
  () => import('@/components/account/ReceiptModal').then((m) => m.ReceiptModal),
  { ssr: false }
);
import {
  User,
  Ticket,
  MapPin,
  CreditCard,
  FileText,
  Settings,
  ShieldCheck,
  LogIn,
  RotateCw,
} from 'lucide-react';

type AccountTab = 'PROFILE' | 'TRIPS' | 'PLACES' | 'PAYMENTS' | 'RECEIPTS' | 'SETTINGS';

function AccountContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, openAuthWithNotice, currentUser } = useApp();

  const tabParam = searchParams.get('tab')?.toUpperCase();
  const initialTab: AccountTab =
    tabParam === 'TRIPS'
      ? 'TRIPS'
      : tabParam === 'PLACES'
      ? 'PLACES'
      : tabParam === 'PAYMENTS'
      ? 'PAYMENTS'
      : tabParam === 'RECEIPTS'
      ? 'RECEIPTS'
      : tabParam === 'SETTINGS'
      ? 'SETTINGS'
      : 'PROFILE';

  const [activeTab, setActiveTab] = useState<AccountTab>(initialTab);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);

  // Initial skeleton loading simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (tab: AccountTab) => {
    setActiveTab(tab);
    const param = tab === 'PROFILE' ? '' : `?tab=${tab.toLowerCase()}`;
    router.replace(`/account${param}`, { scroll: false });
  };

  const tabs = [
    { id: 'PROFILE' as AccountTab, label: 'Profil', icon: User },
    { id: 'TRIPS' as AccountTab, label: 'Trajets', icon: Ticket },
    { id: 'PLACES' as AccountTab, label: 'Adresses', icon: MapPin },
    { id: 'PAYMENTS' as AccountTab, label: 'Paiements', icon: CreditCard },
    { id: 'RECEIPTS' as AccountTab, label: 'Reçus', icon: FileText },
    { id: 'SETTINGS' as AccountTab, label: 'Paramètres', icon: Settings },
  ];

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-5 animate-in fade-in">
        <div className="w-16 h-16 rounded-3xl bg-primary-100 text-primary-900 dark:bg-primary-950/60 dark:text-accent-300 mx-auto flex items-center justify-center text-2xl shadow-sm">
          <User className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
            Mon Espace Voyageur
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-sm mx-auto">
            Connectez-vous pour retrouver vos billets électroniques scannables, vos adresses favorites, vos reçus et vos numéros Mobile Money enregistrés.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => openAuthWithNotice('Connectez-vous pour accéder à votre espace compte')}
            className="w-full min-h-[48px] py-3.5 px-6 bg-primary-900 hover:bg-primary-950 dark:bg-primary-500 dark:hover:bg-primary-400 text-white dark:text-neutral-950 font-black text-xs sm:text-sm rounded-2xl shadow-elevation-2 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>Se connecter avec mon numéro</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 pb-24 sm:pb-12 space-y-6">
      {/* Page Title & Skeleton Reload simulation trigger */}
      <div className="flex items-center justify-between border-b border-neutral-200/90 dark:border-neutral-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <span>Espace Compte &amp; Mobilité</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-accent-100 dark:bg-accent-950 text-neutral-950 dark:text-accent-300">
              RDC
            </span>
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-medium">
            Gérez vos réservations, adresses, moyens de paiement et paramètres
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 350);
          }}
          title="Actualiser les données"
          className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-accent-500' : ''}`} />
        </button>
      </div>

      {/* Primary Account Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs font-bold">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl whitespace-nowrap transition-all duration-150 shrink-0 ${
                isActive
                  ? 'bg-primary-900 dark:bg-primary-500 text-white dark:text-neutral-950 font-black shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-750'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content with Skeletons */}
      <div className="space-y-6">
        {/* TAB 1: PROFILE & OVERVIEW */}
        {activeTab === 'PROFILE' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {loading ? <ProfileHeaderSkeleton /> : <AccountProfileCard />}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-neutral-900 dark:text-white">
                  Dernières Réservations
                </h3>
                <button
                  type="button"
                  onClick={() => handleTabChange('TRIPS')}
                  className="text-xs font-bold text-accent-700 dark:text-accent-400 hover:underline"
                >
                  Voir tout l&apos;historique →
                </button>
              </div>

              {loading ? (
                <TripCardsSkeleton />
              ) : (
                <AccountTripHistory onViewReceipt={(r) => setSelectedReceipt(r)} />
              )}
            </div>
          </div>
        )}

        {/* TAB 2: TRIPS & BOOKING HISTORY */}
        {activeTab === 'TRIPS' && (
          <div className="animate-in fade-in duration-150">
            {loading ? (
              <TripCardsSkeleton />
            ) : (
              <AccountTripHistory onViewReceipt={(r) => setSelectedReceipt(r)} />
            )}
          </div>
        )}

        {/* TAB 3: SAVED PLACES */}
        {activeTab === 'PLACES' && (
          <div className="animate-in fade-in duration-150">
            {loading ? <PlacesSkeleton /> : <AccountSavedPlaces />}
          </div>
        )}

        {/* TAB 4: SAVED PAYMENT NUMBERS */}
        {activeTab === 'PAYMENTS' && (
          <div className="animate-in fade-in duration-150">
            {loading ? <PaymentsSkeleton /> : <AccountPaymentMethods />}
          </div>
        )}

        {/* TAB 5: RECEIPTS */}
        {activeTab === 'RECEIPTS' && (
          <div className="animate-in fade-in duration-150">
            {loading ? (
              <TripCardsSkeleton />
            ) : (
              <AccountReceipts onViewReceipt={(r) => setSelectedReceipt(r)} />
            )}
          </div>
        )}

        {/* TAB 6: SETTINGS & PREFERENCES */}
        {activeTab === 'SETTINGS' && (
          <div className="animate-in fade-in duration-150">
            <AccountPreferences />
          </div>
        )}
      </div>

      {/* Official Receipt Modal */}
      <ReceiptModal
        receipt={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
}

export function AccountPageClient() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <ProfileHeaderSkeleton />
          <TripCardsSkeleton />
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}

