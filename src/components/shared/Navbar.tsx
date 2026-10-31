'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Currency, Language, UserRole } from '@/types';
import {
  ChevronDown,
  Sun,
  Moon,
  WifiOff,
  Zap,
  Bus,
  Car,
  Package,
  Ticket,
  HelpCircle,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const {
    language,
    setLanguage,
    currency,
    setCurrency,
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    dataSaver,
    setDataSaver,
    selectedCity,
    setSelectedCity,
    t,
    currentUser,
    isAuthenticated,
    logout,
    setShowAuthModal,
    setShowOnboardingModal,
    setShowHelpCenterModal,
    switchRole,
    isOnline,
  } = useApp();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/driver')) {
    return null;
  }

  const cities = [
    { id: 'kinshasa', name: 'Kinshasa' },
    { id: 'matadi', name: 'Matadi' },
    { id: 'lubumbashi', name: 'Lubumbashi' },
    { id: 'kolwezi', name: 'Kolwezi' },
    { id: 'goma', name: 'Goma' },
  ];

  const languages: { code: Language; label: string; short: string; flag: string }[] = [
    { code: 'fr', label: 'Français', short: 'FR', flag: '🇨🇩' },
    { code: 'en', label: 'English', short: 'EN', flag: '🇬🇧' },
    { code: 'ln', label: 'Lingála', short: 'LN', flag: '🇨🇩' },
    { code: 'sw', label: 'Kiswahili', short: 'SW', flag: '🇨🇩' },
  ];

  const navLinks = [
    { href: '/bus', label: 'Bus', icon: <Bus className="w-3.5 h-3.5" /> },
    { href: '/rides', label: 'Taxi & Wewa', icon: <Car className="w-3.5 h-3.5" /> },
    { href: '/delivery', label: 'Livraison', icon: <Package className="w-3.5 h-3.5" /> },
    { href: '/trips', label: 'Mes Billets', icon: <Ticket className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0A2540] dark:bg-[#071322] text-white border-b border-[#143A62] dark:border-[#1E2D48] shadow-elevation-1 transition-colors w-full">
      {/* Offline notice banner */}
      {!isOnline && (
        <div className="bg-amber-500 text-neutral-950 px-3 py-1 text-2xs sm:text-xs font-bold flex items-center justify-center gap-1.5">
          <WifiOff className="w-3.5 h-3.5 animate-pulse" />
          <span>{t.offlineNotice}</span>
        </div>
      )}

      {/* Main header bar: Brand Navy background ensures 100% visibility of the white logo and all links */}
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Left: Brand Logo (Responsive: Clean brand icon on mobile, horizontal logo on tablet/desktop) */}
        <Link
          href="/"
          className="flex items-center shrink-0 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 rounded-lg"
          aria-label="Accueil Transnumerica"
        >
          <img
            src="/images/logo-icon-official.png"
            alt="Transnumerica"
            className="h-7 sm:h-8 w-auto object-contain sm:hidden"
          />
          <img
            src="/images/logo-horizontal-transparent.png"
            alt="Transnumerica"
            className="hidden sm:block h-7 md:h-8 w-auto object-contain transition-transform group-hover:scale-[1.02]"
          />
        </Link>

        {/* Center: Primary Navigation Links (Visible on Tablet & Desktop) */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Navigation principale">
          {navLinks.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-white/15 text-accent-400 shadow-sm'
                    : 'text-white/85 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className={isActive ? 'text-accent-400' : 'text-white/70'}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right controls: Guaranteed 100% visible on 360px, 768px, 1280px */}
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2.5 shrink-0">
          {/* 1. City Selector (keeps 'header select' for E2E tests & screen readers) */}
          <div className="relative flex items-center">
            <label htmlFor="navbar-city-select" className="sr-only">
              Sélectionner la ville
            </label>
            <select
              id="navbar-city-select"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              aria-label="Sélectionner la ville"
              className="bg-white/10 hover:bg-white/15 border border-white/20 text-white text-2xs sm:text-xs font-bold rounded-lg sm:rounded-xl pl-1.5 sm:pl-2.5 pr-4 sm:pr-7 py-1 sm:py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-accent-400 cursor-pointer min-h-[32px] sm:min-h-[40px] max-w-[84px] sm:max-w-none transition-colors"
            >
              {cities.map((c) => (
                <option
                  key={c.id}
                  value={c.id}
                  className="bg-[#0A2540] text-white"
                >
                  📍 {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 text-white/70 absolute right-1 sm:right-2.5 pointer-events-none" />
          </div>

          {/* 2. Currency Switcher (Mobile: Compact Click-to-toggle / Desktop: Segmented) */}
          {/* Mobile compact single toggle button (< 640px) */}
          <button
            type="button"
            onClick={() => setCurrency(currency === 'CDF' ? 'USD' : 'CDF')}
            aria-label={`Devise active: ${currency}. Cliquer pour basculer`}
            title={`Devise active: ${currency}. Cliquer pour basculer`}
            className="sm:hidden px-1.5 py-1 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-2xs font-black text-accent-300 min-h-[32px] flex items-center justify-center shrink-0 transition-colors"
          >
            {currency}
          </button>

          {/* Desktop/Tablet segmented control (>= 640px) */}
          <div className="hidden sm:flex items-center bg-white/10 p-0.5 rounded-xl border border-white/20 text-xs font-bold">
            <button
              type="button"
              onClick={() => setCurrency('CDF')}
              aria-label="Devise CDF"
              className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg transition-all text-2xs sm:text-xs font-black ${
                currency === 'CDF'
                  ? 'bg-accent-500 text-neutral-950 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              CDF
            </button>
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              aria-label="Devise USD"
              className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg transition-all text-2xs sm:text-xs font-black ${
                currency === 'USD'
                  ? 'bg-accent-500 text-neutral-950 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              USD
            </button>
          </div>

          {/* 3. Language Switcher (Visible on ALL devices) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              aria-expanded={langMenuOpen}
              aria-haspopup="true"
              aria-label={`Langue : ${language.toUpperCase()} - Changer de langue`}
              className="bg-white/10 hover:bg-white/15 border border-white/20 text-white text-2xs sm:text-xs font-black rounded-lg sm:rounded-xl px-1.5 sm:px-2.5 py-1 sm:py-2 flex items-center gap-1 cursor-pointer min-h-[32px] sm:min-h-[40px] uppercase transition-colors"
            >
              <span>{language.toUpperCase()}</span>
              <ChevronDown className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-white/70" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-32 bg-[#0A2540] dark:bg-[#152238] rounded-xl border border-white/20 shadow-elevation-2 py-1 z-50">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      setLanguage(l.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-bold flex items-center justify-between ${
                      language === l.code
                        ? 'text-accent-400 bg-white/15'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{l.flag} {l.short}</span>
                    <span className="text-2xs text-white/60">{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 4. Theme Toggle Button (Moon / Sun, visible on ALL screen sizes) */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={resolvedTheme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 flex items-center justify-center text-accent-300 hover:text-accent-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 shrink-0"
            title={resolvedTheme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-accent-400" />
            ) : (
              <Moon className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-accent-300" />
            )}
          </button>

          {/* 4b. Help Center Button */}
          <button
            type="button"
            onClick={() => setShowHelpCenterModal(true)}
            aria-label="Centre d'aide et assistance"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 flex items-center justify-center text-white/90 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 shrink-0"
            title="Centre d'Aide & Sécurité Transnumerica"
          >
            <HelpCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-accent-300" />
          </button>

          {/* 5. Profile / Account Dropdown or Login Button */}
          {!isAuthenticated ? (
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg sm:rounded-xl bg-accent-500 hover:bg-accent-400 text-slate-950 text-xs font-black shadow-sm active:scale-95 transition-all min-h-[32px] sm:min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
            >
              <span>{t.login}</span>
            </button>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-1 sm:gap-2 pl-1 sm:pl-2 pr-1.5 sm:pr-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-white/15 hover:bg-white/20 text-white text-xs font-bold border border-white/20 shadow-sm transition-all active:scale-95 min-h-[32px] sm:min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
                aria-label="Menu Profil et Rôle"
              >
                <span className="w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-accent-500 text-neutral-950 flex items-center justify-center font-black text-2xs sm:text-xs shrink-0">
                  {currentUser.name.charAt(0)}
                </span>
                <span className="hidden md:inline truncate max-w-[90px]">
                  {currentUser.role === 'DRIVER' ? 'Chauffeur' : 'Compte'}
                </span>
                <ChevronDown className="w-3 h-3 opacity-75 hidden sm:inline" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-[#0A2540] dark:bg-[#152238] rounded-2xl border border-white/20 shadow-elevation-3 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-white">
                  <div className="px-3.5 py-2.5 border-b border-white/15">
                    <div className="text-xs font-black text-white truncate">
                      {currentUser.name}
                    </div>
                    <div className="text-2xs text-white/60 mt-0.5">
                      {currentUser.phone}
                    </div>
                  </div>

                  {/* Direct Account & Trips Links */}
                  <div className="py-1 border-b border-white/15">
                    <Link
                      href="/account"
                      onClick={() => setProfileMenuOpen(false)}
                      className="w-full text-left px-3.5 py-1.5 text-xs font-bold text-accent-400 hover:text-white flex items-center justify-between"
                    >
                      <span>Gérer mon compte &amp; Profil</span>
                      <span className="text-2xs text-accent-300">→</span>
                    </Link>
                    <Link
                      href="/trips"
                      onClick={() => setProfileMenuOpen(false)}
                      className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-white/90 hover:text-white flex items-center justify-between"
                    >
                      <span>Mes trajets &amp; Billets QR</span>
                    </Link>
                  </div>

                  {/* Mobile Navigation Links in Dropdown for quick access */}
                  <div className="py-1 lg:hidden border-b border-white/15">
                    <div className="px-3.5 py-1 text-2xs font-bold text-accent-400 uppercase tracking-wider">
                      Navigation
                    </div>
                    {navLinks.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setProfileMenuOpen(false)}
                        className="w-full text-left px-3.5 py-1.5 text-xs font-semibold flex items-center gap-2 text-white/85 hover:text-white hover:bg-white/10"
                      >
                        <span className="text-accent-400">{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>

                  <div className="py-1">
                    <div className="px-3.5 py-1 text-2xs font-bold text-white/50 uppercase tracking-wider">
                      Changer d'espace
                    </div>
                    {(['PASSENGER', 'DRIVER'] as UserRole[]).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => {
                          switchRole(role);
                          setProfileMenuOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                          currentUser.role === role
                            ? 'bg-white/15 text-accent-400 font-black'
                            : 'text-white/80 hover:bg-white/10'
                        }`}
                      >
                        <span>
                          {role === 'PASSENGER'
                            ? 'Espace Passager'
                            : 'Espace Chauffeur / Partenaire'}
                        </span>
                        {currentUser.role === role && <span className="text-accent-400 font-bold">✓</span>}
                      </button>
                    ))}
                  </div>

                  {/* Theme Selector in dropdown */}
                  <div className="pt-2 border-t border-white/15 px-3.5 py-1.5">
                    <div className="text-2xs font-bold text-white/50 uppercase tracking-wider mb-1.5">
                      Mode d'affichage
                    </div>
                    <div className="grid grid-cols-3 gap-1 bg-white/10 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setTheme('light')}
                        className={`py-1 text-2xs font-bold rounded-lg transition-all ${
                          theme === 'light'
                            ? 'bg-white text-neutral-950 shadow-sm'
                            : 'text-white/70 hover:text-white'
                        }`}
                      >
                        Clair
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme('dark')}
                        className={`py-1 text-2xs font-bold rounded-lg transition-all ${
                          theme === 'dark'
                            ? 'bg-accent-500 text-neutral-950 shadow-sm'
                            : 'text-white/70 hover:text-white'
                        }`}
                      >
                        Sombre
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme('system')}
                        className={`py-1 text-2xs font-bold rounded-lg transition-all ${
                          theme === 'system'
                            ? 'bg-white/20 text-white shadow-sm'
                            : 'text-white/70 hover:text-white'
                        }`}
                      >
                        Auto
                      </button>
                    </div>
                  </div>

                  {/* Design System, Onboarding & Logout links */}
                  <div className="pt-2 border-t border-white/15 px-3.5 py-1.5 space-y-1">
                    <Link
                      href="/design"
                      onClick={() => setProfileMenuOpen(false)}
                      className="w-full text-left py-1 text-xs font-semibold text-accent-300 hover:text-white flex items-center gap-1.5"
                    >
                      <span>Design System & Tokens</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        setShowHelpCenterModal(true);
                      }}
                      className="w-full text-left py-1 text-xs font-semibold text-emerald-400 hover:text-white flex items-center gap-1.5"
                    >
                      <span>Centre d&apos;aide &amp; Sécurité</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        setShowOnboardingModal(true);
                      }}
                      className="w-full text-left py-1 text-xs font-semibold text-accent-400 hover:text-white flex items-center gap-1.5"
                    >
                      <span>Découvrir l&apos;application</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left py-1 text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1.5"
                    >
                      <span>Se déconnecter</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
