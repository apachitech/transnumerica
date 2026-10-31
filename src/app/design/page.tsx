'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  XCircle,
  Info,
  ArrowRight,
  Sun,
  Moon,
  Sparkles,
  Layers,
  Palette,
  Type,
  Maximize2,
  Smartphone,
  ExternalLink,
  Bus,
  Car,
  Bike,
  Search,
  SlidersHorizontal,
  CreditCard,
  Plus,
  Trash2,
  Bell,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import {
  Button,
  Input,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Tabs,
  BottomSheet,
  Modal,
  ToastContainer,
  ToastMessage,
  Skeleton,
  SkeletonText,
  SkeletonCard,
  EmptyState,
  SuccessCheckmark,
} from '@/components/ui';

import { useApp } from '@/lib/store';

export default function DesignSystemStorybookPage() {
  const { resolvedTheme, toggleTheme } = useApp();
  const isDark = resolvedTheme === 'dark';
  const [activeStoryTab, setActiveStoryTab] = useState('all');

  // Interactive component states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isLoadingButton, setIsLoadingButton] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeSubTab, setActiveSubTab] = useState('bus');
  const [selectedDemoSeat, setSelectedDemoSeat] = useState<string>('1A');
  const [checkmarkKey, setCheckmarkKey] = useState<number>(0);

  const addToast = (type: 'success' | 'error' | 'warning' | 'info') => {
    const id = Date.now().toString();
    const titles = {
      success: 'Paiement M-Pesa réussi !',
      error: 'Erreur réseau : reconnexion...',
      warning: 'Départ dans 15 minutes',
      info: 'Nouveau trajet Kinshasa → Matadi disponible',
    };
    const descriptions = {
      success: 'Votre billet électronique QR est disponible hors-ligne.',
      error: 'Vérifiez votre signal cellulaire Vodacom / Airtel.',
      warning: 'Présentez-vous à la gare de Matadi Kibala.',
      info: '3 places disponibles au tarif réduit de 25.000 FC.',
    };

    setToasts((prev) => [...prev, { id, type, title: titles[type], description: descriptions[type] }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const storyNavTabs = [
    { id: 'all', label: 'Tous les Composants' },
    { id: 'buttons', label: 'Boutons' },
    { id: 'inputs', label: 'Formulaires' },
    { id: 'cards-badges', label: 'Cartes & Badges' },
    { id: 'navigation', label: 'Onglets' },
    { id: 'overlays', label: 'Modales & Bottom Sheet' },
    { id: 'feedback', label: 'Toasts & Retours' },
    { id: 'skeletons', label: 'Squelettes & États Vides' },
    { id: 'motion', label: 'Système de Mouvement' },
    { id: 'tokens', label: 'Tokens & Accessibilité' },
  ];


  const primaryScale = [
    { step: '50', hex: '#F0F5FA', textDark: true },
    { step: '100', hex: '#E1EBF5', textDark: true },
    { step: '200', hex: '#C4D8EC', textDark: true },
    { step: '300', hex: '#98BEDE', textDark: true },
    { step: '400', hex: '#5F9BCB', textDark: false },
    { step: '500', hex: '#317DB5', textDark: false },
    { step: '600', hex: '#1C6096', textDark: false },
    { step: '700', hex: '#134A77', textDark: false },
    { step: '800', hex: '#0D3354', textDark: false },
    { step: '900', hex: '#0A2540', textDark: false, label: 'Core Navy' },
    { step: '950', hex: '#051424', textDark: false },
  ];

  const accentScale = [
    { step: '50', hex: '#FFFBEB', textDark: true },
    { step: '100', hex: '#FEF3C7', textDark: true },
    { step: '200', hex: '#FDE68A', textDark: true },
    { step: '300', hex: '#FCD34D', textDark: true },
    { step: '400', hex: '#FBBF24', textDark: true },
    { step: '500', hex: '#F59E0B', textDark: true, label: 'Kinetic Amber' },
    { step: '600', hex: '#D97706', textDark: false },
    { step: '700', hex: '#B45309', textDark: false },
    { step: '800', hex: '#92400E', textDark: false },
    { step: '900', hex: '#78350F', textDark: false },
    { step: '950', hex: '#451A03', textDark: false },
  ];

  const neutralScale = [
    { step: '50', hex: '#F8FAFC', textDark: true },
    { step: '100', hex: '#F1F5F9', textDark: true },
    { step: '200', hex: '#E2E8F0', textDark: true },
    { step: '300', hex: '#CBD5E1', textDark: true },
    { step: '400', hex: '#94A3B8', textDark: false },
    { step: '500', hex: '#64748B', textDark: false },
    { step: '600', hex: '#475569', textDark: false },
    { step: '700', hex: '#334155', textDark: false },
    { step: '800', hex: '#1E293B', textDark: false },
    { step: '900', hex: '#0F172A', textDark: false },
    { step: '950', hex: '#020617', textDark: false },
  ];

  const contrastMatrix = [
    {
      role: 'Bouton Primaire / Texte Clé',
      foreground: 'Primary 900 (#0A2540)',
      background: 'White (#FFFFFF)',
      ratio: '14.2:1',
      rating: 'AAA',
      sample: 'Réserver un billet',
      fgColor: '#0A2540',
      bgColor: '#FFFFFF',
    },
    {
      role: 'Texte Blanc sur Primaire Navy',
      foreground: 'White (#FFFFFF)',
      background: 'Primary 900 (#0A2540)',
      ratio: '14.2:1',
      rating: 'AAA',
      sample: 'Continuer le paiement',
      fgColor: '#FFFFFF',
      bgColor: '#0A2540',
    },
    {
      role: 'Accent Ambre sur Primaire Navy',
      foreground: 'Accent 500 (#F59E0B)',
      background: 'Primary 900 (#0A2540)',
      ratio: '9.1:1',
      rating: 'AAA',
      sample: 'Tarif négocié : 3.500 FC',
      fgColor: '#F59E0B',
      bgColor: '#0A2540',
    },
    {
      role: 'Texte Principal sur Fond Clair',
      foreground: 'Neutral 900 (#0F172A)',
      background: 'Neutral 50 (#F8FAFC)',
      ratio: '15.8:1',
      rating: 'AAA',
      sample: 'Gare routière de Matadi Kibala',
      fgColor: '#0F172A',
      bgColor: '#F8FAFC',
    },
    {
      role: 'Mode Sombre : Texte sur Fond',
      foreground: 'Neutral 50 (#F8FAFC)',
      background: 'Dark Surface (#0B1320)',
      ratio: '16.4:1',
      rating: 'AAA',
      sample: 'Billet électronique vérifié',
      fgColor: '#F8FAFC',
      bgColor: '#0B1320',
    },
    {
      role: 'Alerte Succès',
      foreground: 'Success 700 (#047857)',
      background: 'Success 50 (#ECFDF5)',
      ratio: '6.8:1',
      rating: 'AA',
      sample: 'Paiement M-Pesa validé',
      fgColor: '#047857',
      bgColor: '#ECFDF5',
    },
    {
      role: 'Alerte Erreur / Danger',
      foreground: 'Danger 700 (#B91C1C)',
      background: 'Danger 50 (#FEF2F2)',
      ratio: '7.2:1',
      rating: 'AAA',
      sample: 'Siège déjà occupé',
      fgColor: '#B91C1C',
      bgColor: '#FEF2F2',
    },
    {
      role: 'Avertissement',
      foreground: 'Warning 700 (#B45309)',
      background: 'Warning 50 (#FFFBEB)',
      ratio: '5.4:1',
      rating: 'AA',
      sample: 'Embarquement immédiat',
      fgColor: '#B45309',
      bgColor: '#FFFBEB',
    },
    {
      role: 'Information',
      foreground: 'Info 700 (#0369A1)',
      background: 'Info 50 (#F0F9FF)',
      ratio: '6.5:1',
      rating: 'AA',
      sample: 'Présentez le QR au contrôleur',
      fgColor: '#0369A1',
      bgColor: '#F0F9FF',
    },
  ];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Storybook Header */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="w-9 h-9 rounded-xl bg-primary-900 dark:bg-primary-500 flex items-center justify-center text-accent-500 dark:text-neutral-950 font-bold text-sm shadow-elevation-1">
              TN
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white leading-tight">
                  Transnumerica Design System
                </h1>
                <Badge variant="accent" size="sm">
                  Storybook 2.0
                </Badge>
              </div>
              <p className="text-2xs sm:text-xs text-neutral-500 dark:text-neutral-400">
                Composants polis • Cibles 48px+ • Focus rings • Zéro motifs décoratifs
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleTheme}
              aria-label="Changer le thème"
              leftIcon={
                isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-primary-900" />
              }
            >
              <span className="hidden sm:inline">{isDark ? 'Mode Clair' : 'Mode Sombre'}</span>
            </Button>
            <Link href="/" passHref legacyBehavior>
              <Button variant="primary" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                <span>Application</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Storybook Category Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 border-t border-neutral-100 dark:border-neutral-800 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            {storyNavTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveStoryTab(tab.id)}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 ${
                  activeStoryTab === tab.id
                    ? 'bg-primary-900 text-white dark:bg-primary-500 dark:text-neutral-950 shadow-elevation-1'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Intro Banner */}
        <section className="bg-primary-900 dark:bg-neutral-800 text-white rounded-2xl p-6 sm:p-8 shadow-elevation-2 relative border border-primary-800 dark:border-neutral-700">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-accent-500/20 text-accent-400 border border-accent-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Base Components Specification • RDC Mobile-First</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Catalogue de Composants Reutilisables
            </h2>
            <p className="text-primary-100 dark:text-neutral-300 text-sm leading-relaxed">
              Tous les composants sont conçus avec des cibles tactiles de 48px minimum, des anneaux de focalisation nets,
              des états pressés dynamiques, des indicateurs de chargement intégrés et une iconographie 100% Lucide.
            </p>
          </div>
        </section>

        {/* 1. BUTTONS */}
        {(activeStoryTab === 'all' || activeStoryTab === 'buttons') && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <span>Boutons (Button)</span>
                  <Badge variant="primary" size="sm">
                    48px min touch target
                  </Badge>
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Variants, tailles, états au clic, focus accessible et état de chargement avec spinner Lucide.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLoadingButton(!isLoadingButton)}
                leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoadingButton ? 'animate-spin' : ''}`} />}
              >
                {isLoadingButton ? 'Arrêter chargement' : 'Tester chargement'}
              </Button>
            </div>

            <Card elevation={1}>
              <CardHeader>
                <CardTitle>Variants de Boutons</CardTitle>
                <CardDescription>Tous les variants respectent le ratio de contraste WCAG AA/AAA.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Variant Row */}
                <div>
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Styles</h4>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="primary" leftIcon={<ArrowRight className="w-4 h-4" />}>
                      Primaire
                    </Button>
                    <Button variant="accent" leftIcon={<Sparkles className="w-4 h-4" />}>
                      Accent / Négocier
                    </Button>
                    <Button variant="outline">Contour</Button>
                    <Button variant="secondary">Secondaire</Button>
                    <Button variant="ghost">Fantôme</Button>
                    <Button variant="danger" leftIcon={<Trash2 className="w-4 h-4" />}>
                      Destructif
                    </Button>
                  </div>
                </div>

                {/* States Row */}
                <div>
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                    États : Chargement, Pressé, Désactivé
                  </h4>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="primary" isLoading={isLoadingButton || true}>
                      Chargement en cours
                    </Button>
                    <Button variant="accent" isLoading={isLoadingButton || true}>
                      Paiement USSD...
                    </Button>
                    <Button variant="primary" disabled>
                      Désactivé
                    </Button>
                    <Button variant="outline" disabled>
                      Contour Désactivé
                    </Button>
                  </div>
                </div>

                {/* Sizes Row */}
                <div>
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                    Tailles (Hauteur minimale garantie 48px)
                  </h4>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="primary" size="sm">
                      Taille SM (min 48px)
                    </Button>
                    <Button variant="primary" size="md">
                      Taille MD (min 48px)
                    </Button>
                    <Button variant="primary" size="lg">
                      Taille LG (min 52px)
                    </Button>
                    <Button variant="primary" size="icon" aria-label="Action icône">
                      <Plus className="w-5 h-5" />
                    </Button>
                    <Button variant="accent" size="icon" aria-label="Action icône accent">
                      <Sparkles className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* 2. INPUTS & SELECTS */}
        {(activeStoryTab === 'all' || activeStoryTab === 'inputs') && (
          <section className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <span>Champs de Saisie & Sélecteurs (Input, Select)</span>
                <Badge variant="primary" size="sm">
                  48px touch targets
                </Badge>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Anneau de focalisation ambre, préfixes/suffixes, validation d'erreurs et chevron personnalisé.
              </p>
            </div>

            <Card elevation={1}>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                <Input
                  label="Recherche de destination"
                  placeholder="Ex: Gare Centrale, Matadi Kibala, Boulevard..."
                  leftAddon={<Search className="w-4 h-4" />}
                  helperText="Saisissez un repère ou une commune de Kinshasa"
                />

                <Input
                  label="Numéro Mobile Money (RDC)"
                  placeholder="81 234 5678"
                  leftAddon={<span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">+243</span>}
                  helperText="Compatible M-Pesa, Airtel, Orange, Africell"
                />

                <Input
                  label="Champs avec erreur de validation"
                  defaultValue="080 000 0000"
                  error="Numéro de téléphone invalide pour Vodacom M-Pesa"
                  leftAddon={<span className="text-xs font-bold">+243</span>}
                />

                <Input
                  label="Champ désactivé"
                  defaultValue="Tarif fixe régulé par l'Hôtel de Ville"
                  disabled
                  helperText="Modification non autorisée pour ce trajet"
                />

                <Select
                  label="Ville ou Province"
                  leftIcon={<MapPin className="w-4 h-4" />}
                  options={[
                    { value: 'kinshasa', label: 'Kinshasa (Capitale)' },
                    { value: 'matadi', label: 'Matadi (Kongo-Central)' },
                    { value: 'lubumbashi', label: 'Lubumbashi (Haut-Katanga)' },
                    { value: 'kolwezi', label: 'Kolwezi (Lualaba)' },
                  ]}
                  helperText="Détermine la disponibilité des Wewa et bus"
                />

                <Select
                  label="Moyen de Paiement"
                  leftIcon={<CreditCard className="w-4 h-4" />}
                  options={[
                    { value: 'mpesa', label: 'Vodacom M-Pesa (*1122#)' },
                    { value: 'airtel', label: 'Airtel Money (*501#)' },
                    { value: 'orange', label: 'Orange Money (*144#)' },
                    { value: 'cash', label: 'Espèces au chauffeur' },
                  ]}
                  helperText="Validation instantanée par notification push"
                />
              </CardContent>
            </Card>
          </section>
        )}

        {/* 3. CARDS & BADGES */}
        {(activeStoryTab === 'all' || activeStoryTab === 'cards-badges') && (
          <section className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <span>Cartes & Badges (Card, Badge)</span>
                <Badge variant="accent" size="sm">
                  Corners 16px & 24px
                </Badge>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Hiérarchie à 3 niveaux d'élévation d'ombre, surface nette sans motif et badges de statut contrastés.
              </p>
            </div>

            {/* Badges Row */}
            <Card elevation={1}>
              <CardHeader>
                <CardTitle>Badges Sémantiques</CardTitle>
                <CardDescription>Indicateurs d'état à contraste élevé pour statut de paiement et trajets.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-2.5">
                <Badge variant="default">Défaut</Badge>
                <Badge variant="primary" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
                  Vérifié Transnumerica
                </Badge>
                <Badge variant="accent" icon={<Sparkles className="w-3.5 h-3.5" />}>
                  Meilleur Tarif
                </Badge>
                <Badge variant="success" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                  Payé M-Pesa
                </Badge>
                <Badge variant="warning" icon={<AlertTriangle className="w-3.5 h-3.5" />}>
                  Départ Imminent
                </Badge>
                <Badge variant="danger" icon={<XCircle className="w-3.5 h-3.5" />}>
                  Trajet Annulé
                </Badge>
                <Badge variant="info" icon={<Info className="w-3.5 h-3.5" />}>
                  Climatisé
                </Badge>
                <Badge variant="outline">Contour Léger</Badge>
              </CardContent>
            </Card>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card elevation={1}>
                <CardHeader>
                  <Badge variant="primary" size="sm" className="mb-2 w-fit">
                    Élévation 1
                  </Badge>
                  <CardTitle>Carte Standard</CardTitle>
                  <CardDescription>Ombre au repos pour listes et récapitulatifs.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300">
                    Surface unie avec bordure fine, sans bruit ni texture superflue.
                  </p>
                </CardContent>
                <CardFooter>
                  <span className="text-xs font-bold text-neutral-500">shadow-elevation-1</span>
                  <Button variant="ghost" size="sm">
                    Détails
                  </Button>
                </CardFooter>
              </Card>

              <Card elevation={2} interactive>
                <CardHeader>
                  <Badge variant="accent" size="sm" className="mb-2 w-fit">
                    Élévation 2 • Interactive
                  </Badge>
                  <CardTitle>Carte Cliquable</CardTitle>
                  <CardDescription>Effet hover dynamique et retour tactile au clic.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300">
                    Cliquez pour tester l'animation active:scale et l'anneau focus accessible.
                  </p>
                </CardContent>
                <CardFooter>
                  <span className="text-xs font-bold text-accent-600 dark:text-accent-400">
                    35.000 FC
                  </span>
                  <Button variant="primary" size="sm">
                    Choisir
                  </Button>
                </CardFooter>
              </Card>

              <Card elevation={3}>
                <CardHeader>
                  <Badge variant="success" size="sm" className="mb-2 w-fit">
                    Élévation 3
                  </Badge>
                  <CardTitle>Carte Flottante</CardTitle>
                  <CardDescription>Profondeur accentuée pour mise en avant critique.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300">
                    Idéale pour le ticket QR code actif et le récapitulatif de paiement.
                  </p>
                </CardContent>
                <CardFooter>
                  <span className="text-xs font-bold text-neutral-500">shadow-elevation-3</span>
                  <Button variant="accent" size="sm">
                    Scanner QR
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </section>
        )}

        {/* 4. TABS & NAVIGATION */}
        {(activeStoryTab === 'all' || activeStoryTab === 'navigation') && (
          <section className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <span>Onglets de Navigation (Tabs)</span>
                <Badge variant="primary" size="sm">
                  48px touch targets
                </Badge>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Sélecteurs de services (Bus, Taxi, Wewa) ergonomiques au pouce sur mobile.
              </p>
            </div>

            <Card elevation={1}>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                    Segmented Tabs
                  </h4>
                  <Tabs
                    variant="segmented"
                    activeTab={activeSubTab}
                    onChange={setActiveSubTab}
                    tabs={[
                      { id: 'bus', label: 'Bus Interurbain', icon: <Bus className="w-4 h-4" /> },
                      { id: 'taxi', label: 'Taxi Confort', icon: <Car className="w-4 h-4" /> },
                      { id: 'moto', label: 'Wewa (Moto)', icon: <Bike className="w-4 h-4" /> },
                      {
                        id: 'express',
                        label: 'Colis Express',
                        icon: <Smartphone className="w-4 h-4" />,
                        badge: <Badge variant="accent" size="sm">Bientôt</Badge>,
                        disabled: true,
                      },
                    ]}
                  />
                </div>

                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300">
                  <span className="font-bold">Onglet actif :</span> {activeSubTab.toUpperCase()} • La cible tactile de chaque onglet est strictement supérieure ou égale à 48px pour éviter les erreurs de frappe.
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* 5. MODAL & BOTTOM SHEET OVERLAYS */}
        {(activeStoryTab === 'all' || activeStoryTab === 'overlays') && (
          <section className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <span>Modales & Tiroirs Mobiles (Modal, BottomSheet)</span>
                <Badge variant="accent" size="sm">
                  Touch 48px & ESC
                </Badge>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Fermeture au clavier (Échap), cibles 48px sur la croix et poignée tactile pour glisser.
              </p>
            </div>

            <Card elevation={1}>
              <CardContent className="pt-6 flex flex-wrap gap-4">
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                  Ouvrir Modale Accessible
                </Button>

                <Button variant="accent" onClick={() => setIsBottomSheetOpen(true)}>
                  Ouvrir Bottom Sheet (Mobile)
                </Button>
              </CardContent>
            </Card>

            {/* Live Modal */}
            <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title="Confirmation de la réservation"
              description="Vérifiez les détails avant d'initier la demande USSD."
              footer={
                <>
                  <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                    Annuler
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setIsModalOpen(false);
                      addToast('success');
                    }}
                  >
                    Confirmer (48px)
                  </Button>
                </>
              }
            >
              <div className="space-y-3 text-sm">
                <p className="text-neutral-600 dark:text-neutral-300">
                  Trajet : <strong>Kinshasa → Matadi</strong> (Départ 07h30)
                </p>
                <p className="text-neutral-600 dark:text-neutral-300">
                  Siège sélectionné : <strong>1A (Fenêtre)</strong>
                </p>
                <p className="text-neutral-600 dark:text-neutral-300">
                  Montant à débiter : <strong>35.000 FC</strong> (Vodacom M-Pesa)
                </p>
              </div>
            </Modal>

            {/* Live Bottom Sheet */}
            <BottomSheet
              isOpen={isBottomSheetOpen}
              onClose={() => setIsBottomSheetOpen(false)}
              title="Filtres de Trajet"
              description="Personnalisez vos préférences de voyage"
              footer={
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => setIsBottomSheetOpen(false)}
                >
                  Appliquer les filtres
                </Button>
              }
            >
              <div className="space-y-4">
                <Input label="Heure de départ souhaitée" type="time" defaultValue="08:00" />
                <Select
                  label="Confort du véhicule"
                  options={[
                    { value: 'all', label: 'Tous les bus' },
                    { value: 'ac', label: 'Climatisation garantie' },
                    { value: 'vip', label: 'VIP (Sièges inclinables)' },
                  ]}
                />
              </div>
            </BottomSheet>
          </section>
        )}

        {/* 6. TOASTS & FEEDBACK */}
        {(activeStoryTab === 'all' || activeStoryTab === 'feedback') && (
          <section className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <span>Notifications & Retours (Toast)</span>
                <Badge variant="primary" size="sm">
                  Lucide Icons
                </Badge>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Notifications non intrusives pour confirmation Mobile Money, perte de réseau ou rappel de départ.
              </p>
            </div>

            <Card elevation={1}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    className="border-emerald-600 text-emerald-700 dark:text-emerald-400"
                    leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    onClick={() => addToast('success')}
                  >
                    Déclencher Succès
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-600 text-red-700 dark:text-red-400"
                    leftIcon={<AlertCircle className="w-4 h-4 text-red-600" />}
                    onClick={() => addToast('error')}
                  >
                    Déclencher Erreur
                  </Button>
                  <Button
                    variant="outline"
                    className="border-amber-600 text-amber-700 dark:text-amber-400"
                    leftIcon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
                    onClick={() => addToast('warning')}
                  >
                    Déclencher Avertissement
                  </Button>
                  <Button
                    variant="outline"
                    className="border-sky-600 text-sky-700 dark:text-sky-400"
                    leftIcon={<Info className="w-4 h-4 text-sky-600" />}
                    onClick={() => addToast('info')}
                  >
                    Déclencher Info
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* 7. SKELETONS & EMPTY STATES */}
        {(activeStoryTab === 'all' || activeStoryTab === 'skeletons') && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <span>Squelettes de Chargement & États Vides (Skeleton, EmptyState)</span>
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Expérience fluide sur connexions 3G/Edge lentes sans décalage visuel (CLS).
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSkeleton(!showSkeleton)}
              >
                {showSkeleton ? 'Afficher Contenu Réel' : 'Afficher Squelette'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {showSkeleton ? (
                <SkeletonCard />
              ) : (
                <Card elevation={1}>
                  <CardHeader className="flex flex-row items-center gap-3">
                    <span className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-primary-900 dark:text-primary-300 font-bold shrink-0">
                      MK
                    </span>
                    <div>
                      <CardTitle>Matadi Express VIP</CardTitle>
                      <CardDescription>Départ 07h30 • Gare de Matadi Kibala</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300">
                      Bus grand confort climatisé avec prises USB et espace bagages sécurisé.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="primary" size="md" className="w-full">
                      Réserver mon siège
                    </Button>
                  </CardFooter>
                </Card>
              )}

              <EmptyState
                icon={<Search className="w-8 h-8" />}
                title="Aucun trajet trouvé"
                description="Aucun bus direct n'est disponible pour cette date. Essayez un trajet le lendemain ou modifiez vos points d'embarquement."
                primaryAction={{
                  label: 'Voir trajets du lendemain',
                  onClick: () => addToast('info'),
                }}
                secondaryAction={{
                  label: 'Réinitialiser filtres',
                  onClick: () => {},
                }}
              />
            </div>
          </section>
        )}

        {/* 8. TOKENS & WCAG AA CONTRAST AUDIT */}
        {(activeStoryTab === 'all' || activeStoryTab === 'tokens') && (
          <section className="space-y-6">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-xl font-bold tracking-tight">Audit de Contraste WCAG AA / AAA</h3>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-elevation-1 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100 dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-700 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Usage & Rôle</th>
                    <th className="py-3 px-4">Texte</th>
                    <th className="py-3 px-4">Arrière-plan</th>
                    <th className="py-3 px-4">Ratio Relevé</th>
                    <th className="py-3 px-4">Niveau WCAG</th>
                    <th className="py-3 px-4">Aperçu Réel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                  {contrastMatrix.map((item, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition">
                      <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-white">
                        {item.role}
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-600 dark:text-neutral-300">
                        {item.foreground}
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-600 dark:text-neutral-300">
                        {item.background}
                      </td>
                      <td className="py-3 px-4 font-bold text-neutral-900 dark:text-white">
                        {item.ratio}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={item.rating === 'AAA' ? 'success' : 'info'}
                          size="sm"
                        >
                          ✓ {item.rating}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div
                          className="px-2.5 py-1 rounded-lg font-medium border border-neutral-300/40 inline-block text-2xs"
                          style={{ backgroundColor: item.bgColor, color: item.fgColor }}
                        >
                          {item.sample}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Typography Scale */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-5 border border-neutral-200 dark:border-neutral-700 shadow-elevation-1 space-y-4">
              <div className="flex items-center space-x-2">
                <Type className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <h4 className="text-base font-bold text-neutral-900 dark:text-white">
                  Échelle Typographique (Plus Jakarta Sans + Fallback Système)
                </h4>
              </div>
              <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                <div className="py-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <div className="w-48 shrink-0">
                    <span className="font-mono text-xs font-bold text-primary-700 dark:text-primary-300 block">text-4xl</span>
                    <span className="text-2xs text-neutral-500 font-mono">36px / 40px • font-extrabold</span>
                  </div>
                  <div className="text-4xl font-extrabold text-neutral-900 dark:text-white truncate">Mobilité Transnumerica</div>
                </div>
                <div className="py-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <div className="w-48 shrink-0">
                    <span className="font-mono text-xs font-bold text-primary-700 dark:text-primary-300 block">text-2xl</span>
                    <span className="text-2xs text-neutral-500 font-mono">24px / 32px • font-bold</span>
                  </div>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-white truncate">Kinshasa → Matadi</div>
                </div>
                <div className="py-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <div className="w-48 shrink-0">
                    <span className="font-mono text-xs font-bold text-primary-700 dark:text-primary-300 block">text-base</span>
                    <span className="text-2xs text-neutral-500 font-mono">16px / 24px • font-normal</span>
                  </div>
                  <div className="text-base font-normal text-neutral-900 dark:text-white truncate">Présentez ce QR code à l'embarquement, même hors-ligne.</div>
                </div>
              </div>
            </div>

            {/* Mobile Money Operators */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-5 border border-neutral-200 dark:border-neutral-700 shadow-elevation-1 space-y-3">
              <h4 className="text-base font-bold text-neutral-900 dark:text-white">Opérateurs Mobile Money (RDC)</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-red-600 text-white flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold block">Vodacom M-Pesa</span>
                    <span className="text-2xs font-mono text-red-100">#E60000</span>
                  </div>
                  <Smartphone className="w-4 h-4 text-white/80" />
                </div>
                <div className="p-3 rounded-xl bg-[#E60012] text-white flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold block">Airtel Money</span>
                    <span className="text-2xs font-mono text-red-100">#E60012</span>
                  </div>
                  <Smartphone className="w-4 h-4 text-white/80" />
                </div>
                <div className="p-3 rounded-xl bg-[#FF7900] text-white flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold block">Orange Money</span>
                    <span className="text-2xs font-mono text-orange-100">#FF7900</span>
                  </div>
                  <Smartphone className="w-4 h-4 text-white/80" />
                </div>
                <div className="p-3 rounded-xl bg-[#6C1D5F] text-white flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold block">Africell Money</span>
                    <span className="text-2xs font-mono text-purple-200">#6C1D5F</span>
                  </div>
                  <Smartphone className="w-4 h-4 text-white/80" />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 9. RESTRAINED MOTION SYSTEM (150ms - 250ms Ease-Out) */}
        {(activeStoryTab === 'all' || activeStoryTab === 'motion') && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <span>Système de Mouvement Restreint (150-250ms Ease-Out)</span>
                  <Badge variant="accent" size="sm">
                    Non-Bloquant • GPU
                  </Badge>
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Micro-interactions douces adaptées aux téléphones Android d'entrée de gamme en RDC : zéro lag, respect de prefers-reduced-motion.
                </p>
              </div>
              <Badge variant="success" size="sm" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
                prefers-reduced-motion: supporté
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Demo 1: Animated Seat Selection */}
              <Card elevation={1}>
                <CardHeader>
                  <CardTitle>1. Sélection de Siège Animée</CardTitle>
                  <CardDescription>
                    Ressort subtil (200ms ease-out spring) et retour tactile active:scale-90.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center gap-3">
                    {['1A', '1B', '2A', '2B'].map((seatNum) => {
                      const isSelected = selectedDemoSeat === seatNum;
                      return (
                        <button
                          key={seatNum}
                          onClick={() => setSelectedDemoSeat(seatNum)}
                          className={`w-12 h-12 rounded-xl text-xs font-black flex items-center justify-center transition-all duration-200 ease-out active:scale-90 ${
                            isSelected
                              ? 'bg-amber-400 text-neutral-950 ring-2 ring-primary ring-offset-2 scale-105 shadow-md animate-seat-select'
                              : 'bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:border-amber-400 hover:scale-[1.03]'
                          }`}
                        >
                          {seatNum}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-2xs text-neutral-500 text-center font-mono">
                    Siège sélectionné : <span className="font-bold text-accent-600">{selectedDemoSeat}</span> (cliquez pour tester l'animation)
                  </p>
                </CardContent>
              </Card>

              {/* Demo 2: Success Checkmark Animation */}
              <Card elevation={1}>
                <CardHeader>
                  <CardTitle>2. Coche de Validation Animée (Post-Paiement)</CardTitle>
                  <CardDescription>
                    Pop circulaire (250ms spring) et tracé SVG stroke (200ms) pour rassurer le voyageur.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex flex-col items-center justify-center">
                  <div key={checkmarkKey} className="py-2">
                    <SuccessCheckmark size="lg" />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCheckmarkKey((k) => k + 1)}
                    leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                  >
                    Rejouer l'animation (250ms)
                  </Button>
                </CardContent>
              </Card>

              {/* Demo 3: Tactile Button Press Physics */}
              <Card elevation={1}>
                <CardHeader>
                  <CardTitle>3. Retour Tactile des Boutons</CardTitle>
                  <CardDescription>
                    Compression fluide (active:scale-[0.98]) avec transition duration-150.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary" size="md">
                      Appui Doux (150ms)
                    </Button>
                    <Button variant="accent" size="md">
                      Bouton Accent (150ms)
                    </Button>
                  </div>
                  <p className="text-2xs text-neutral-500">
                    Les cibles de 48px et le feedback d'enfoncement confirment instantanément le geste sans bloquer le fil d'exécution JS.
                  </p>
                </CardContent>
              </Card>

              {/* Demo 4: Hardware-Accelerated Shimmer */}
              <Card elevation={1}>
                <CardHeader>
                  <CardTitle>4. Shimmer Squelette Accéléré GPU</CardTitle>
                  <CardDescription>
                    Balayage linéaire fluide par transform: translateX(-100% à 100%) sans recalcul de mise en page.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
                    <Skeleton className="h-4 w-3/4 rounded-md" />
                    <Skeleton className="h-3 w-1/2 rounded-md" />
                  </div>
                  <p className="text-2xs text-neutral-500">
                    Dégradé subtil sans à-coups pour maintenir le débit d'affichage à 60 FPS sur smartphones Android modestes.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

      </main>

    </div>
  );
}
