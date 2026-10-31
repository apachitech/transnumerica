'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AdminSession, AdminPermission } from '@/types';
import { hasPermission, isSuperAdmin } from '@/lib/security/roles-permissions';
import {
  LayoutDashboard,
  Ticket,
  ShieldCheck,
  Building2,
  AlertCircle,
  History,
  Users,
  Coins,
  DollarSign,
  TrendingUp,
  Settings,
  LogOut,
  Clock,
  Search,
  Menu,
  X,
  Bell,
  Command,
  Route,
  ChevronRight,
  Flame,
  Compass,
  Radio,
  Package,
  LifeBuoy,
  FileText,
  BookOpen,
  Download,
} from 'lucide-react';
import { CommandPalette } from './CommandPalette';
import { AdminAttentionInbox } from './AdminAttentionInbox';
import { AdminBreadcrumbs } from './AdminBreadcrumbs';

interface Props {
  session: AdminSession;
  children: React.ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: AdminPermission;
  exact?: boolean;
  badge?: string | null;
  badgeColor?: string;
  superAdminOnly?: boolean;
}

interface NavSection {
  group: string;
  items: NavItem[];
}

export function AdminDashboardLayoutClient({ session, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(30 * 60);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAttentionInboxOpen, setIsAttentionInboxOpen] = useState(false);
  const [attentionCount, setAttentionCount] = useState(3);

  // Session idle countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/not-found');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch attention count
  useEffect(() => {
    const fetchAttention = async () => {
      try {
        const res = await fetch('/api/admin/attention');
        if (res.ok) {
          const data = await res.json();
          setAttentionCount(data.totalCount || 0);
        }
      } catch {
        // Ignored
      }
    };
    fetchAttention();
  }, []);

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/not-found');
    router.refresh();
  };

  // 7 Grouped Navigation Sections required
  const navSections: NavSection[] = [
    {
      group: 'Personnes',
      items: [
        {
          href: '/admin/users',
          label: 'Utilisateurs & Rôles',
          icon: Users,
          permission: 'users.read',
        },
        {
          href: '/admin/drivers',
          label: 'Vérification Chauffeurs KYC',
          icon: ShieldCheck,
          permission: 'drivers.verify',
          badge: '2',
          badgeColor: 'bg-amber-500 text-neutral-950',
        },
      ],
    },
    {
      group: 'Transport',
      items: [
        {
          href: '/admin/catalog',
          label: 'Catalogue & Réseau',
          icon: Compass,
          permission: 'catalog.read',
          badge: 'Nouveau',
          badgeColor: 'bg-emerald-500/80 text-white',
        },
        {
          href: '/admin/corridors',
          label: 'Lignes & Corridors',
          icon: Route,
          permission: 'corridors.read',
          badge: '7',
          badgeColor: 'bg-blue-500/80 text-white',
        },
        {
          href: '/admin/operators',
          label: 'Opérateurs de Transport',
          icon: Building2,
          permission: 'operators.read',
        },
      ],
    },
    {
      group: 'Opérations',
      items: [
        {
          href: '/admin/rides',
          label: 'Opérations Courses & Sécurité',
          icon: Radio,
          permission: 'rides.read',
          badge: 'SOS',
          badgeColor: 'bg-red-500 text-white animate-pulse',
        },
        {
          href: '/admin/deliveries',
          label: 'Livraisons & Colis Express',
          icon: Package,
          permission: 'deliveries.read',
          badge: 'Actif',
          badgeColor: 'bg-emerald-500/80 text-white',
        },
        {
          href: '/admin/bookings',
          label: 'Réservations & Billetterie',
          icon: Ticket,
          permission: 'bookings.read',
          badge: '2 840',
        },
        {
          href: '/admin/support',
          label: 'Support Client & Litiges',
          icon: LifeBuoy,
          permission: 'support.read',
          badge: 'SLA',
          badgeColor: 'bg-red-500 text-white',
        },
        {
          href: '/admin/notifications',
          label: 'Notifications & Diffusions',
          icon: Bell,
          permission: 'notifications.read',
          badge: 'SMS',
          badgeColor: 'bg-blue-500 text-white',
        },
      ],
    },
    {
      group: 'Finances',
      items: [
        {
          href: '/admin/payments',
          label: 'Paiements & Remboursements',
          icon: DollarSign,
          permission: 'payments.read',
        },
        {
          href: '/admin/payouts',
          label: 'Commissions & Versements',
          icon: Coins,
          permission: 'payouts.read',
        },
      ],
    },
    {
      group: 'Contenu',
      items: [
        {
          href: '/admin/pricing',
          label: 'Tarification & Règles',
          icon: Coins,
          permission: 'pricing.read',
        },
        {
          href: '/admin/cms',
          label: 'Gestion de Contenu (CMS)',
          icon: FileText,
          permission: 'cms.read',
          badge: 'Multilingue',
          badgeColor: 'bg-emerald-500/80 text-white',
        },
      ],
    },
    {
      group: 'Paramètres',
      items: [
        {
          href: '/admin/toggles',
          label: 'Villes & Services (Toggles)',
          icon: Building2,
          permission: 'services.read',
        },
        {
          href: '/admin/settings',
          label: 'Paramètres & Sessions',
          icon: Settings,
          permission: 'settings.read',
        },
      ],
    },
    {
      group: 'Analyses',
      items: [
        {
          href: '/admin',
          label: 'Vue d’ensemble',
          icon: LayoutDashboard,
          permission: 'analytics.read',
          exact: true,
        },
        {
          href: '/admin/analytics',
          label: 'Analytique Mobilité',
          icon: TrendingUp,
          permission: 'analytics.read',
        },
        {
          href: '/admin/audit',
          label: 'Journal d’Audit Immuable',
          icon: History,
          permission: 'audit.read',
          superAdminOnly: true,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#071321] text-white flex flex-col antialiased">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-[#0A1A2E]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-testid="admin-layout-mobile-menu-btn"
            onClick={() => setSidebarOpenMobile(!sidebarOpenMobile)}
            className="md:hidden p-2 rounded-xl bg-white/10 text-white hover:bg-white/15"
            aria-label="Ouvrir le menu de navigation administration"
          >
            {sidebarOpenMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/admin" className="flex items-center gap-2 font-black text-sm tracking-tight text-white">
            <span className="w-7 h-7 rounded-lg bg-amber-500 text-neutral-950 flex items-center justify-center font-black text-xs">
              TN
            </span>
            <span className="hidden sm:inline">Transnumerica Admin Console</span>
          </Link>
        </div>

        {/* Global Search Bar (opens Command Palette) */}
        <div className="flex-1 max-w-md mx-2 sm:mx-4">
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(true)}
            data-testid="admin-global-search-btn"
            className="w-full flex items-center justify-between px-3 py-1.5 bg-[#081524] hover:bg-[#0c1e34] border border-white/15 hover:border-amber-400/50 rounded-xl text-xs text-neutral-300 transition-colors"
          >
            <span className="flex items-center gap-2 truncate">
              <Search className="w-4 h-4 text-neutral-300 shrink-0" />
              <span className="hidden md:inline truncate">Rechercher réservation, chauffeur, ligne...</span>
              <span className="md:hidden text-2xs truncate text-neutral-300">Rechercher...</span>
            </span>
            <span className="hidden sm:flex items-center gap-1 shrink-0">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-2xs font-mono text-neutral-300 border border-white/10">
                Ctrl+K
              </kbd>
            </span>
          </button>
        </div>

        {/* Admin Session & Status Indicators */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Needs Attention Inbox Bell */}
          <button
            type="button"
            onClick={() => setIsAttentionInboxOpen(true)}
            data-testid="admin-attention-inbox-btn"
            className="relative p-2 rounded-xl bg-[#081524] hover:bg-[#0e223a] border border-white/15 text-neutral-200 transition-colors"
            title="Boîte des urgences et dossiers en attente"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            {attentionCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white font-black text-2xs flex items-center justify-center border-2 border-[#0A1A2E] animate-pulse">
                {attentionCount}
              </span>
            )}
          </button>

          {/* Idle Timeout Badge */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-neutral-300 text-2xs font-mono border border-white/15"
            title="Délai d'inactivité avant déconnexion automatique"
          >
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Session : {formatCountdown(timeLeftSeconds)}</span>
          </div>

          {/* Recognized Admin IP Badge */}
          <div
            className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-300 text-2xs font-mono border border-emerald-500/40"
            title="Adresse IP Administrateur Reconnue & Sécurisée"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>IP: {session.ipAddress || '192.168.43.221'}</span>
          </div>

          {/* Download Confidential Admin Manual */}
          <a
            href="/api/admin/guide/download"
            download="TRANSNUMERICA_MANUEL_ADMINISTRATION.pdf"
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all shadow-sm shrink-0"
            title="Télécharger le Manuel Officiel d'Exploitation & d'Administration (Confidentiel PDF)"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Manuel Admin (PDF)</span>
            <Download className="w-3 h-3 text-amber-300" />
          </a>

          {/* Role Badge */}
          <div
            className={`px-2.5 py-1 rounded-full text-2xs font-black uppercase tracking-wider border flex items-center gap-1 ${
              session.role === 'SUPER_ADMIN'
                ? 'bg-purple-950/70 border-purple-500/50 text-purple-300'
                : 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>{session.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}</span>
          </div>

          {/* User Name & Logout */}
          <div className="flex items-center gap-2">
            <span className="hidden md:inline text-xs font-bold text-neutral-200 truncate max-w-[140px]">
              {session.name}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800/40 text-red-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="Déconnexion sécurisée"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">Quitter</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-[#0A1A2E] border-r border-white/10 p-4 space-y-6 overflow-y-auto transition-transform duration-200 ease-in-out ${
            sidebarOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          {navSections.map((section, idx) => {
            const visibleItems = section.items.filter((item) => {
              if (item.superAdminOnly && !isSuperAdmin(session.role)) return false;
              return hasPermission(session.role, item.permission, session.permissions);
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-1.5">
                <div className="text-2xs font-black uppercase tracking-wider text-neutral-400 px-3">
                  {section.group}
                </div>
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const isActive = item.exact
                      ? pathname === item.href
                      : pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpenMobile(false)}
                        data-testid={`admin-nav-${item.href.replace('/admin', '') || 'overview'}`}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all min-h-[38px] ${
                          isActive
                            ? 'bg-amber-500 text-neutral-950 font-black shadow-md'
                            : 'text-neutral-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-neutral-950' : 'text-amber-400'}`} />
                          <span>{item.label}</span>
                        </span>
                        {item.badge && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-2xs font-extrabold ${
                              isActive
                                ? 'bg-neutral-950 text-amber-300'
                                : item.badgeColor || 'bg-white/15 text-white'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Confidential Admin Manual Download in Sidebar */}
          <div className="pt-3 pb-2 border-t border-white/10 mt-4">
            <a
              href="/api/admin/guide/download"
              download="TRANSNUMERICA_MANUEL_ADMINISTRATION.pdf"
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all min-h-[40px] shadow-sm"
              title="Manuel d'Exploitation & d'Administration (Confidentiel PDF)"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">Manuel Exploitation (PDF)</span>
              </span>
              <Download className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            </a>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-5">
          {/* Breadcrumbs */}
          <div className="pb-1">
            <AdminBreadcrumbs />
          </div>

          {children}
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      {/* Needs Attention Inbox Drawer */}
      <AdminAttentionInbox
        isOpen={isAttentionInboxOpen}
        onClose={() => setIsAttentionInboxOpen(false)}
      />
    </div>
  );
}
