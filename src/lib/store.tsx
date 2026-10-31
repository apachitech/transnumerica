'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Currency, Language, ServiceType, User, UserRole, ThemeMode } from '@/types';
import { getTranslations, TranslationKey } from '@/lib/i18n';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (cur: Currency) => void;
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  dataSaver: boolean;
  setDataSaver: (val: boolean | ((prev: boolean) => boolean)) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  t: TranslationKey;
  currentUser: User;
  isAuthenticated: boolean;
  setCurrentUser: (user: User) => void;
  loginWithPhone: (phone: string, name?: string) => void;
  logout: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (open: boolean) => void;
  showOnboardingModal: boolean;
  setShowOnboardingModal: (open: boolean) => void;
  showVerifiedModal: boolean;
  setShowVerifiedModal: (open: boolean) => void;
  verifiedModalData?: { title: string; entityName: string; type: 'OPERATOR' | 'DRIVER' } | null;
  openVerifiedModal: (title: string, entityName: string, type: 'OPERATOR' | 'DRIVER') => void;
  showHelpCenterModal: boolean;
  setShowHelpCenterModal: (open: boolean) => void;
  authContextNotice?: string;
  setAuthContextNotice: (notice?: string) => void;
  openAuthWithNotice: (notice: string, onSuccess?: () => void) => void;
  authSuccessCallback?: (() => void) | null;
  switchRole: (role: UserRole) => void;
  isOnline: boolean;
}

const DEFAULT_USER: User = {
  id: 'usr-demo-1',
  name: 'Patrick Mwamba',
  phone: '+243812345678',
  role: 'PASSENGER',
  gender: 'MALE',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  createdAt: new Date().toISOString(),
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr');
  const [currency, setCurrencyState] = useState<Currency>('CDF');
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [dataSaver, setDataSaverState] = useState<boolean>(false);
  const [selectedCity, setSelectedCityState] = useState<string>('kinshasa');
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(false);
  const [showVerifiedModal, setShowVerifiedModal] = useState<boolean>(false);
  const [verifiedModalData, setVerifiedModalData] = useState<{
    title: string;
    entityName: string;
    type: 'OPERATOR' | 'DRIVER';
  } | null>(null);
  const [showHelpCenterModal, setShowHelpCenterModal] = useState<boolean>(false);
  const [authContextNotice, setAuthContextNotice] = useState<string | undefined>(undefined);
  const [authSuccessCallback, setAuthSuccessCallback] = useState<(() => void) | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  const openVerifiedModal = (
    title: string,
    entityName: string,
    type: 'OPERATOR' | 'DRIVER'
  ) => {
    setVerifiedModalData({ title, entityName, type });
    setShowVerifiedModal(true);
  };

  // Initialize auth state and check if onboarding has been seen
  useEffect(() => {
    try {
      const authVal = localStorage.getItem('tn_auth');
      if (authVal === 'false') {
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }

      const savedUser = localStorage.getItem('tn_user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }

      const savedDataSaver = localStorage.getItem('tn_datasaver');
      const connectionSaveData = typeof navigator !== 'undefined' && (navigator as any).connection?.saveData;
      if (savedDataSaver === 'true' || connectionSaveData) {
        setDataSaverState(true);
        if (typeof document !== 'undefined') {
          document.documentElement.classList.add('tn-data-saver');
        }
      }

      // Check onboarding (avoid blocking automated test runners unless explicit)
      const onboardingSeen = localStorage.getItem('tn_onboarding_seen');
      const isAutomated =
        typeof window !== 'undefined' &&
        (Boolean(window.navigator.webdriver) || window.location.search.includes('e2e'));
      if (!onboardingSeen && !isAutomated) {
        setShowOnboardingModal(true);
      }

      // Sync Supabase Auth session if active
      fetch('/api/auth/me')
        .then((r) => r.json())
        .then((d) => {
          if (d?.authenticated && d?.user) {
            setIsAuthenticated(true);
            setCurrentUser((prev) => ({
              ...prev,
              phone: d.user.phone || prev.phone,
              name: d.user.name || prev.name,
            }));
          }
        })
        .catch(() => {});
    } catch {}
  }, []);

  const loginWithPhone = (phone: string, name?: string) => {
    const updatedUser: User = {
      ...currentUser,
      phone,
      name: name && name.trim() ? name.trim() : currentUser.name || 'Patrick Mwamba',
    };
    setCurrentUser(updatedUser);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('tn_auth', 'true');
      localStorage.setItem('tn_user', JSON.stringify(updatedUser));
    } catch {}

    if (authSuccessCallback) {
      authSuccessCallback();
      setAuthSuccessCallback(null);
    }
    setShowAuthModal(false);
    setAuthContextNotice(undefined);
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.setItem('tn_auth', 'false');
      fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } catch {}
  };

  const openAuthWithNotice = (notice: string, onSuccess?: () => void) => {
    setAuthContextNotice(notice);
    if (onSuccess) setAuthSuccessCallback(() => onSuccess);
    setShowAuthModal(true);
  };

  // Helper to apply theme to document root
  const applyThemeToDOM = (mode: ThemeMode) => {
    if (typeof window === 'undefined') return 'light';
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const isDark = mode === 'dark' || (mode === 'system' && mql.matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
      setResolvedTheme('dark');
      return 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      setResolvedTheme('light');
      return 'light';
    }
  };

  useEffect(() => {
    // Read persisted theme or default to system
    const savedTheme = localStorage.getItem('tn_theme') as ThemeMode;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setThemeState(savedTheme);
      applyThemeToDOM(savedTheme);
    } else {
      applyThemeToDOM('system');
    }

    // System theme change listener
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      const currentStored = localStorage.getItem('tn_theme');
      if (!currentStored || currentStored === 'system') {
        applyThemeToDOM('system');
      }
    };

    if (mql.addEventListener) {
      mql.addEventListener('change', handleSystemChange);
    } else {
      mql.addListener(handleSystemChange);
    }

    // Read persisted settings
    const savedLang = localStorage.getItem('tn_lang') as Language;
    if (savedLang && ['fr', 'en', 'ln', 'sw'].includes(savedLang)) {
      setLanguageState(savedLang);
    }
    const savedCur = localStorage.getItem('tn_currency') as Currency;
    if (savedCur && ['CDF', 'USD'].includes(savedCur)) {
      setCurrencyState(savedCur);
    }
    const savedDataSaver = localStorage.getItem('tn_datasaver');
    if (savedDataSaver === 'true') {
      setDataSaverState(true);
    }

    // Network connectivity listener
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register Service Worker if supported
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('[PWA] Service Worker registered:', reg.scope))
        .catch((err) => console.warn('[PWA] SW register error:', err));
    }

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', handleSystemChange);
      } else {
        mql.removeListener(handleSystemChange);
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem('tn_theme', mode);
    applyThemeToDOM(mode);
  };

  const toggleTheme = () => {
    // If current computed is dark, switch to light; otherwise dark
    const nextTheme: ThemeMode = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('tn_lang', lang);
  };

  const setCurrency = (cur: Currency) => {
    setCurrencyState(cur);
    localStorage.setItem('tn_currency', cur);
  };

  const setDataSaver = (val: boolean | ((prev: boolean) => boolean)) => {
    setDataSaverState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      localStorage.setItem('tn_datasaver', String(next));
      if (typeof document !== 'undefined') {
        if (next) {
          document.documentElement.classList.add('tn-data-saver');
        } else {
          document.documentElement.classList.remove('tn-data-saver');
        }
      }
      return next;
    });
  };

  const setSelectedCity = (city: string) => {
    setSelectedCityState(city);
  };

  const switchRole = (role: UserRole) => {
    // Client-side role escalation to ADMIN or SUPER_ADMIN is strictly prohibited
    if (role === 'ADMIN' || (role as string) === 'SUPER_ADMIN') {
      console.warn('Tentative d’escalade de privilèges côté client bloquée.');
      return;
    }
    setCurrentUser((prev) => ({
      ...prev,
      role,
      name:
        role === 'DRIVER'
          ? 'Papitcho Kalonji (Chauffeur)'
          : 'Patrick Mwamba (Passager)',
    }));
  };

  const t = getTranslations(language);

  return (
    <AppContext.Provider
      value={{
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
        setCurrentUser,
        loginWithPhone,
        logout,
        showAuthModal,
        setShowAuthModal,
        showOnboardingModal,
        setShowOnboardingModal,
        showVerifiedModal,
        setShowVerifiedModal,
        verifiedModalData,
        openVerifiedModal,
        showHelpCenterModal,
        setShowHelpCenterModal,
        authContextNotice,
        setAuthContextNotice,
        openAuthWithNotice,
        authSuccessCallback,
        switchRole,
        isOnline,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}
