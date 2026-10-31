'use client';

import React from 'react';
import { AdminDashboardTab } from '@/types';
import {
  LayoutDashboard,
  Ticket,
  ShieldCheck,
  Building2,
  AlertCircle,
  History,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  Bus,
  RefreshCw,
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: AdminDashboardTab;
  onTabChange: (tab: AdminDashboardTab) => void;
  isOpenMobile: boolean;
  onToggleMobile: () => void;
  isCollapsedDesktop: boolean;
  onToggleCollapseDesktop: () => void;
  kycPendingCount: number;
  openDisputesCount: number;
  operatorMode: 'SUPER_ADMIN' | 'OPERATOR_BUS';
  onToggleOperatorMode: (mode: 'SUPER_ADMIN' | 'OPERATOR_BUS') => void;
}

export function AdminSidebar({
  activeTab,
  onTabChange,
  isOpenMobile,
  onToggleMobile,
  isCollapsedDesktop,
  onToggleCollapseDesktop,
  kycPendingCount,
  openDisputesCount,
  operatorMode,
  onToggleOperatorMode,
}: AdminSidebarProps) {
  const navItems = [
    {
      id: 'OVERVIEW' as AdminDashboardTab,
      label: 'Vue d\'ensemble',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'BOOKINGS' as AdminDashboardTab,
      label: 'Réservations & Courses',
      icon: Ticket,
      badge: '2 840',
    },
    {
      id: 'VERIFICATION' as AdminDashboardTab,
      label: 'Vérification KYC & Licences',
      icon: ShieldCheck,
      badge: kycPendingCount > 0 ? `${kycPendingCount}` : null,
      badgeColor: 'bg-amber-500 text-neutral-950',
    },
    {
      id: 'CITY_SERVICES' as AdminDashboardTab,
      label: 'Villes & Services (Toggles)',
      icon: Building2,
      badge: null,
    },
    {
      id: 'DISPUTES' as AdminDashboardTab,
      label: 'Gestion des Litiges',
      icon: AlertCircle,
      badge: openDisputesCount > 0 ? `${openDisputesCount}` : null,
      badgeColor: 'bg-red-500 text-white',
    },
    {
      id: 'AUDIT_LOG' as AdminDashboardTab,
      label: 'Journal d\'Audit',
      icon: History,
      badge: null,
    },
  ];

  const handleSelectTab = (tab: AdminDashboardTab) => {
    onTabChange(tab);
    if (isOpenMobile) onToggleMobile();
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div
          role="presentation"
          onClick={onToggleMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar Container (Responsive: Mobile Drawer or Desktop Rail/Panel) */}
      <aside
        data-testid="admin-sidebar"
        className={`fixed md:sticky top-0 left-0 z-50 md:z-30 h-screen md:h-[calc(100vh-64px)] bg-neutral-900 text-white border-r border-neutral-800 transition-all duration-300 ease-in-out flex flex-col justify-between shrink-0 ${
          isOpenMobile
            ? 'translate-x-0 w-72 shadow-2xl'
            : '-translate-x-full md:translate-x-0'
        } ${isCollapsedDesktop ? 'md:w-20' : 'md:w-64'}`}
      >
        {/* Top Header / Mode Switcher */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between gap-2">
          {!isCollapsedDesktop ? (
            <div className="space-y-1 overflow-hidden">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-accent-500 text-neutral-950 font-black flex items-center justify-center text-sm shrink-0">
                  TN
                </div>
                <div>
                  <h2 className="font-black text-sm text-white tracking-tight leading-tight truncate">
                    {operatorMode === 'SUPER_ADMIN' ? 'Transnumerica RDC' : 'Matadi Express VIP'}
                  </h2>
                  <span className="text-[10px] text-accent-400 font-extrabold uppercase tracking-wider block">
                    {operatorMode === 'SUPER_ADMIN' ? 'Super Admin' : 'Opérateur Autocar'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-accent-500 text-neutral-950 font-black flex items-center justify-center text-sm mx-auto shrink-0">
              TN
            </div>
          )}

          {/* Close on Mobile / Collapse on Desktop */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={onToggleMobile}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white md:hidden"
              aria-label="Fermer la navigation"
            >
              <X className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={onToggleCollapseDesktop}
              className="hidden md:flex p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title={isCollapsedDesktop ? 'Agrandir le menu' : 'Réduire le menu'}
              aria-label={isCollapsedDesktop ? 'Agrandir le menu' : 'Réduire le menu'}
            >
              {isCollapsedDesktop ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* View / Role Switcher for Admin vs Operator simulation */}
        {!isCollapsedDesktop && (
          <div className="p-3 bg-neutral-950/60 border-b border-neutral-800">
            <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1.5">
              Rôle Actif du Tableau de Bord :
            </label>
            <div className="grid grid-cols-2 gap-1 text-2xs font-extrabold">
              <button
                type="button"
                onClick={() => onToggleOperatorMode('SUPER_ADMIN')}
                className={`py-1.5 px-2 rounded-lg text-center transition-all ${
                  operatorMode === 'SUPER_ADMIN'
                    ? 'bg-accent-500 text-neutral-950 shadow-xs'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
                }`}
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => onToggleOperatorMode('OPERATOR_BUS')}
                className={`py-1.5 px-2 rounded-lg text-center transition-all ${
                  operatorMode === 'OPERATOR_BUS'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
                }`}
              >
                Opérateur Bus
              </button>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto" aria-label="Menu d'administration">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                data-testid={`admin-nav-${item.id.toLowerCase()}`}
                title={isCollapsedDesktop ? item.label : undefined}
                className={`w-full min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all text-left group ${
                  isActive
                    ? 'bg-accent-500 text-neutral-950 font-black shadow-sm'
                    : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-neutral-950' : 'text-neutral-400 group-hover:text-accent-400'
                  }`}
                />
                {!isCollapsedDesktop && (
                  <span className="flex-1 truncate">{item.label}</span>
                )}
                {!isCollapsedDesktop && item.badge && (
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${
                      item.badgeColor || 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System Health / Bottom Status */}
        <div className="p-3 border-t border-neutral-800 text-2xs text-neutral-400">
          {!isCollapsedDesktop ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  API Mobilité RDC
                </span>
                <span className="font-mono text-[10px]">99.98%</span>
              </div>
              <p className="text-[10px] text-neutral-400 font-mono">
                Poste IP : 192.168.43.221 • Wi-Fi Sécurisé
              </p>
            </div>
          ) : (
            <div className="flex justify-center" title="API Mobilité RDC • IP: 192.168.43.221">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

