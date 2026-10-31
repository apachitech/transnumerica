'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import {
  AdminDashboardTab,
  AdminKycItem,
  AdminAuditLogEntry,
  AdminDisputeItem,
} from '@/types';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminKpiCards } from '@/components/admin/AdminKpiCards';
import { AdminBookingsTable } from '@/components/admin/AdminBookingsTable';
import dynamic from 'next/dynamic';

const AdminCharts = dynamic(() => import('@/components/admin/AdminCharts').then((m) => m.AdminCharts));
const AdminVerificationQueue = dynamic(() => import('@/components/admin/AdminVerificationQueue').then((m) => m.AdminVerificationQueue));
const AdminCityServiceToggles = dynamic(() => import('@/components/admin/AdminCityServiceToggles').then((m) => m.AdminCityServiceToggles));
const AdminDisputeManagement = dynamic(() => import('@/components/admin/AdminDisputeManagement').then((m) => m.AdminDisputeManagement));
import {
  Menu,
  Bell,
  ShieldCheck,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';

const INITIAL_KYC_QUEUE: AdminKycItem[] = [
  {
    id: 'kyc-1',
    applicantName: 'Honoré Kabeya',
    phone: '+243819876543',
    type: 'DRIVER',
    vehicleType: 'MOTO',
    vehicleModel: 'Haojue 125cc Rouge',
    vehiclePlate: 'KN 3301 MT',
    cooperative: 'COWEMOTO Lemba',
    documents: [
      {
        id: 'doc-1',
        name: 'Permis de Conduire (Catégorie A Moto)',
        type: 'LICENSE',
        documentNumber: 'CD-PERMIS-2024-88491',
        issuedDate: '14 Janvier 2024',
        expiryDate: '14 Janvier 2029',
        previewUrl: '/documents/permis-moto.png',
        verified: true,
      },
      {
        id: 'doc-2',
        name: 'Carte d\'Électeur / ID Biométrique RDC',
        type: 'NATIONAL_ID',
        documentNumber: 'ID-NAT-09-381-4920',
        issuedDate: '10 Mars 2023',
        previewUrl: '/documents/carte-id.png',
        verified: true,
      },
      {
        id: 'doc-3',
        name: 'Certificat d\'Immatriculation (Carte Rose)',
        type: 'VEHICLE_REG',
        documentNumber: 'DGI-CR-849201',
        issuedDate: '22 Février 2024',
        previewUrl: '/documents/carte-rose.png',
        verified: true,
      },
    ],
    hasPassengerHelmet: true,
    appliedAt: '28 Octobre 2026',
    status: 'PENDING',
  },
  {
    id: 'kyc-2',
    applicantName: 'Séraphin Ngoy',
    phone: '+243991122334',
    type: 'DRIVER',
    vehicleType: 'CAR',
    vehicleModel: 'Toyota Corolla Ketch Blanc',
    vehiclePlate: 'KN 7741 BG',
    cooperative: 'Association des Taxis Jaunes de Kinshasa',
    documents: [
      {
        id: 'doc-4',
        name: 'Permis de Conduire (Catégorie B Transport Public)',
        type: 'LICENSE',
        documentNumber: 'CD-PERMIS-2023-10928',
        issuedDate: '05 Août 2023',
        expiryDate: '05 Août 2028',
        previewUrl: '/documents/permis-auto.png',
        verified: true,
      },
      {
        id: 'doc-5',
        name: 'Police d\'Assurance RC SONAS',
        type: 'INSURANCE',
        documentNumber: 'SONAS-RC-AUTO-49201L',
        issuedDate: '01 Janvier 2026',
        expiryDate: '31 Décembre 2026',
        previewUrl: '/documents/sonas-assurance.png',
        verified: true,
      },
      {
        id: 'doc-6',
        name: 'Certificat de Contrôle Technique Automobile',
        type: 'TECHNICAL_INSPECTION',
        documentNumber: 'CT-KIN-2026-0941',
        issuedDate: '15 Septembre 2026',
        expiryDate: '15 Septembre 2027',
        previewUrl: '/documents/controle-technique.png',
        verified: true,
      },
    ],
    hasPassengerHelmet: false,
    appliedAt: '28 Octobre 2026',
    status: 'PENDING',
  },
  {
    id: 'kyc-3',
    applicantName: 'Transport Confort Fleuve Congo SARL',
    phone: '+243818899000',
    type: 'OPERATOR',
    companyName: 'Fleuve Congo Express VIP',
    documents: [
      {
        id: 'doc-7',
        name: 'Licence d\'Exploitation Ministère des Transports RDC',
        type: 'MINISTRY_PERMIT',
        documentNumber: 'MIN-TRANS-2025-LIC-0042',
        issuedDate: '12 Novembre 2025',
        expiryDate: '12 Novembre 2030',
        previewUrl: '/documents/licence-ministere.png',
        verified: true,
      },
      {
        id: 'doc-8',
        name: 'Assurance Rawsur Flotte Voyageurs',
        type: 'INSURANCE',
        documentNumber: 'RAWSUR-FLOTTE-BUS-8891',
        issuedDate: '01 Février 2026',
        expiryDate: '01 Février 2027',
        previewUrl: '/documents/rawsur-bus.png',
        verified: true,
      },
    ],
    appliedAt: '27 Octobre 2026',
    status: 'PENDING',
  },
];

const INITIAL_AUDIT_LOG: AdminAuditLogEntry[] = [
  {
    id: 'aud-1',
    timestamp: '29 Oct 2026 • 19:45:12',
    adminUser: 'Admin_Kasavubu',
    action: 'Mise à jour tarif nocturne',
    target: 'Kinshasa (taxi)',
    previousState: 'Majoration 15%',
    newState: 'Majoration 20%',
    reason: 'Ajustement carburant et circulation nocturne prolongée.',
  },
  {
    id: 'aud-2',
    timestamp: '29 Oct 2026 • 16:30:00',
    adminUser: 'Admin_Kasavubu',
    action: 'Suspension de service',
    target: 'Kolwezi (moto)',
    previousState: 'Actif',
    newState: 'Suspendu',
    reason: 'Arrêté municipal n° 2026/04 restreignant les mototaxis.',
  },
  {
    id: 'aud-3',
    timestamp: '28 Oct 2026 • 11:15:22',
    adminUser: 'Admin_Kasavubu',
    action: 'Validation KYC Chauffeur',
    target: 'Dany "Wewa Rapide" Kazadi (KN 1192 MT)',
    previousState: 'En attente',
    newState: 'Certifié Vérifié',
    reason: 'Dossier complet, 2 casques passager conformes.',
  },
];

const INITIAL_DISPUTES: AdminDisputeItem[] = [
  {
    id: 'disp-1',
    ticketNumber: 'DISP-2026-0849',
    passengerName: 'Patrick Mwamba',
    passengerPhone: '+243812345678',
    driverOrOperatorName: 'Junior Ilunga (KN 4402 MT)',
    serviceType: 'MOTO',
    tripRef: 'TN-RIDE-44109',
    category: 'OVERCHARGE',
    title: 'Surfacturation lors d\'une coupure réseau USSD',
    description: 'Le montant de 3 000 CDF a été débité deux fois sur le portefeuille Vodacom M-Pesa suite à un délai de confirmation.',
    amountInDisputeMinor: 300000,
    currency: 'CDF',
    priority: 'URGENT',
    status: 'OPEN',
    createdAt: '29 Oct 2026 • 11:35',
  },
  {
    id: 'disp-2',
    ticketNumber: 'DISP-2026-0842',
    passengerName: 'Nathalie Kabila',
    passengerPhone: '+243997766554',
    driverOrOperatorName: 'Matadi Express VIP',
    serviceType: 'BUS',
    tripRef: 'TN-BUS-849204',
    category: 'DELAY_REFUND',
    title: 'Retard départ autocar de plus de 2 heures',
    description: 'Le départ initialement prévu à 06h30 est parti à 08h45 pour panne mécanique. Demande d\'application de la garantie ponctualité 50%.',
    amountInDisputeMinor: 1750000,
    currency: 'CDF',
    priority: 'MEDIUM',
    status: 'INVESTIGATING',
    createdAt: '29 Oct 2026 • 09:15',
  },
  {
    id: 'disp-3',
    ticketNumber: 'DISP-2026-0830',
    passengerName: 'Christian Luvambo',
    passengerPhone: '+243825556677',
    driverOrOperatorName: 'Papitcho Kalonji (KN 8291 BG)',
    serviceType: 'TAXI',
    tripRef: 'TN-TAXI-55102',
    category: 'LOST_ITEM',
    title: 'Sacoche avec documents administratifs oubliée sur la banquette',
    description: 'Sacoche marron contenant des papiers d\'affaires laissée lors du trajet Bandalungwa vers Aéroport.',
    amountInDisputeMinor: 0,
    currency: 'CDF',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    createdAt: '28 Oct 2026 • 14:20',
    resolutionNote: 'Objet restitué en mains propres au passager à l\'agence Aéroport N\'djili.',
  },
];

export function AdminPageClient() {
  const { currency, t } = useApp();

  const [activeTab, setActiveTab] = useState<AdminDashboardTab>('OVERVIEW');
  const [operatorMode, setOperatorMode] = useState<'SUPER_ADMIN' | 'OPERATOR_BUS'>('SUPER_ADMIN');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isCollapsedDesktop, setIsCollapsedDesktop] = useState(false);

  // Data states
  const [kycQueue, setKycQueue] = useState<AdminKycItem[]>(INITIAL_KYC_QUEUE);
  const [auditLog, setAuditLog] = useState<AdminAuditLogEntry[]>(INITIAL_AUDIT_LOG);
  const [disputes, setDisputes] = useState<AdminDisputeItem[]>(INITIAL_DISPUTES);
  const [isRefreshingKpis, setIsRefreshingKpis] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('À l\'instant');
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 3500);
  };

  // KPI refresh simulation
  const handleRefreshKpis = () => {
    setIsRefreshingKpis(true);
    setTimeout(() => {
      setIsRefreshingKpis(false);
      setLastUpdated(new Date().toLocaleTimeString('fr-CD', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      showToast('✓ Données opérationnelles synchronisées en direct.');
    }, 600);
  };

  // KYC actions
  const handleApproveKyc = (id: string) => {
    const item = kycQueue.find((k) => k.id === id);
    setKycQueue((prev) => prev.filter((k) => k.id !== id));

    if (item) {
      setAuditLog((prev) => [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('fr-CD', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          adminUser: 'Admin_Kasavubu',
          action: `Validation KYC & Octroi Badge Vérifié`,
          target: `${item.applicantName} (${item.vehiclePlate || item.companyName})`,
          previousState: 'En attente',
          newState: 'Certifié Vérifié',
          reason: 'Vérification complète des pièces réglementaires et des critères de conformité.',
        },
        ...prev,
      ]);
    }
    showToast(`✓ Candidat ${item?.applicantName} validé avec succès ! Badge vérifié accordé.`);
  };

  const handleRejectKyc = (id: string, reason: string) => {
    const item = kycQueue.find((k) => k.id === id);
    setKycQueue((prev) => prev.filter((k) => k.id !== id));

    if (item) {
      setAuditLog((prev) => [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('fr-CD', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          adminUser: 'Admin_Kasavubu',
          action: `Rejet dossier KYC`,
          target: `${item.applicantName} (${item.vehiclePlate || item.companyName})`,
          previousState: 'En attente',
          newState: 'Rejeté',
          reason,
        },
        ...prev,
      ]);
    }
    showToast(`Dossier rejeté pour motif réglementaire : "${reason}".`);
  };

  // Audit log addition
  const handleAddAuditEntry = (entry: Omit<AdminAuditLogEntry, 'id'>) => {
    setAuditLog((prev) => [{ ...entry, id: `aud-${Date.now()}` }, ...prev]);
    showToast(`✓ Action enregistrée au journal d'audit : ${entry.action}`);
  };

  // Dispute actions
  const handleResolveDispute = (id: string, resolutionNote: string) => {
    setDisputes((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'RESOLVED', resolutionNote } : d))
    );
    showToast('✓ Litige résolu et clôturé.');
  };

  const handleRefundDispute = (id: string) => {
    setDisputes((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'RESOLVED',
              resolutionNote: 'Remboursement direct Mobile Money M-Pesa effectué avec succès.',
            }
          : d
      )
    );
    showToast('✓ Remboursement Mobile Money validé et crédité au passager.');
  };

  const openDisputesCount = disputes.filter((d) => d.status === 'OPEN' || d.status === 'INVESTIGATING').length;

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 flex flex-col md:flex-row">
      {/* 1. Collapsible Sidebar (Drawer on Mobile, Crisp Rail/Panel on Desktop) */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpenMobile={isMobileNavOpen}
        onToggleMobile={() => setIsMobileNavOpen(!isMobileNavOpen)}
        isCollapsedDesktop={isCollapsedDesktop}
        onToggleCollapseDesktop={() => setIsCollapsedDesktop(!isCollapsedDesktop)}
        kycPendingCount={kycQueue.length}
        openDisputesCount={openDisputesCount}
        operatorMode={operatorMode}
        onToggleOperatorMode={setOperatorMode}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar Header */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-neutral-850/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Hamburger button on Mobile */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              data-testid="admin-mobile-menu-btn"
              className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 md:hidden"
              aria-label="Ouvrir le menu d'administration"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="font-black text-sm sm:text-lg text-neutral-900 dark:text-white leading-tight flex items-center gap-2">
                <span>
                  {operatorMode === 'SUPER_ADMIN'
                    ? 'Superviseur Mobilité RDC'
                    : 'Tableau de Bord Transporteur Partenaire'}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Conforme Ministère RDC</span>
                </span>
              </h1>
              <p className="text-2xs text-neutral-400 hidden sm:block">
                Contrôle des flux interurbains &amp; urbains, audit des agréments et régulation tarifaire
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => showToast('🔔 Aucune alerte critique non acquittée.')}
              className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
              title="Centre d'alertes administratives"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Floating Notification Toast */}
        {notificationToast && (
          <div
            role="status"
            className="fixed top-16 right-4 z-50 p-3.5 rounded-2xl bg-neutral-900 text-white dark:bg-neutral-800 border-2 border-accent-400 shadow-2xl flex items-center gap-2 text-xs sm:text-sm font-black animate-in slide-in-from-top-2"
          >
            <CheckCircle2 className="w-4 h-4 text-accent-400 shrink-0" />
            <span>{notificationToast}</span>
          </div>
        )}

        {/* Main Content Workspace */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto">
          {/* TAB 1: OVERVIEW (KPIs + Accessible Charts + Snapshot) */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* KPI Cards */}
              <AdminKpiCards
                currency={currency}
                isRefreshing={isRefreshingKpis}
                onRefresh={handleRefreshKpis}
                lastUpdated={lastUpdated}
              />

              {/* Accessible Charts */}
              <AdminCharts currency={currency} />

              {/* Quick Bookings Table View */}
              <AdminBookingsTable currency={currency} />
            </div>
          )}

          {/* TAB 2: BOOKINGS (Full Filterable/Sortable Table + CSV Export) */}
          {activeTab === 'BOOKINGS' && (
            <div className="animate-in fade-in duration-150">
              <AdminBookingsTable currency={currency} />
            </div>
          )}

          {/* TAB 3: VERIFICATION QUEUE (KYC & Operator Licenses Review) */}
          {activeTab === 'VERIFICATION' && (
            <div className="animate-in fade-in duration-150">
              <AdminVerificationQueue
                queue={kycQueue}
                onApprove={handleApproveKyc}
                onReject={handleRejectKyc}
              />
            </div>
          )}

          {/* TAB 4: CITY & SERVICE CONFIG TOGGLES */}
          {activeTab === 'CITY_SERVICES' && (
            <div className="animate-in fade-in duration-150">
              <AdminCityServiceToggles
                auditLog={auditLog}
                onAddAuditEntry={handleAddAuditEntry}
              />
            </div>
          )}

          {/* TAB 5: DISPUTE MANAGEMENT */}
          {activeTab === 'DISPUTES' && (
            <div className="animate-in fade-in duration-150">
              <AdminDisputeManagement
                disputes={disputes}
                currency={currency}
                onResolveDispute={handleResolveDispute}
                onRefundDispute={handleRefundDispute}
              />
            </div>
          )}

          {/* TAB 6: AUDIT TRAIL LOG */}
          {activeTab === 'AUDIT_LOG' && (
            <div className="animate-in fade-in duration-150">
              <div
                data-testid="admin-full-audit-log-page"
                className="bg-white dark:bg-neutral-850 border border-neutral-200/90 dark:border-neutral-750 rounded-3xl p-4 sm:p-6 shadow-elevation-1 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
                      <span>Grand Livre d&apos;Audit Réglementaire ({auditLog.length} actions)</span>
                    </h3>
                    <p className="text-2xs text-neutral-400 font-medium">
                      Historique complet et infalsifiable des décisions administratives RDC
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-extrabold border-b border-neutral-200 dark:border-neutral-800">
                        <th scope="col" className="p-3">Horodatage</th>
                        <th scope="col" className="p-3">Administrateur</th>
                        <th scope="col" className="p-3">Action &amp; Cible</th>
                        <th scope="col" className="p-3 text-center">Transition</th>
                        <th scope="col" className="p-3">Motif &amp; Justification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-medium">
                      {auditLog.map((log) => (
                        <tr key={log.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                          <td className="p-3 whitespace-nowrap font-mono text-neutral-500">
                            {log.timestamp}
                          </td>
                          <td className="p-3 whitespace-nowrap font-extrabold text-neutral-900 dark:text-white">
                            {log.adminUser}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="font-bold text-neutral-900 dark:text-white block">
                              {log.action}
                            </span>
                            <span className="text-[10px] text-neutral-400">{log.target}</span>
                          </td>
                          <td className="p-3 text-center whitespace-nowrap font-mono text-[11px]">
                            <span className="text-neutral-400">{log.previousState}</span>
                            <span> ➔ </span>
                            <span className="text-accent-600 dark:text-accent-400 font-bold">{log.newState}</span>
                          </td>
                          <td className="p-3 text-neutral-600 dark:text-neutral-300 text-xs">
                            {log.reason}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
