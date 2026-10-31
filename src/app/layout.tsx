import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/lib/store';
import { Navbar } from '@/components/shared/Navbar';
import { MobileBottomNav } from '@/components/shared/MobileBottomNav';
import { Footer } from '@/components/shared/Footer';
import { ClientModals } from '@/components/shared/ClientModals';

import { buildOrganizationSchema, buildWebSiteSchema } from '@/lib/seo-schema';
import { JsonLd } from '@/components/seo/JsonLd';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://transnumerica.cd'),
  title: {
    default: 'Transnumerica — Voyagez simplement, payez par Mobile Money (RDC)',
    template: '%s | Transnumerica',
  },
  description:
    'Plateforme moderne de mobilité en RD Congo : Bus interurbains (Kinshasa, Matadi, Lubumbashi, Kolwezi), Taxis et Motos Wewa. Billets QR 100% hors-ligne et paiements Mobile Money (M-Pesa, Airtel, Orange, Africell, Cash).',
  keywords: [
    'Transnumerica',
    'Transnumerica RDC',
    'bus RDC',
    'billet bus Kinshasa Matadi',
    'voyage Congo',
    'Wewa moto Kinshasa',
    'taxi Lubumbashi',
    'Mobile Money RDC',
    'M-Pesa Congo',
    'Airtel Money RDC',
    'billet électronique',
    'RN1 Congo',
    'autocar Kinshasa',
  ],
  authors: [{ name: 'Transnumerica RD Congo', url: 'https://transnumerica.cd' }],
  creator: 'Transnumerica',
  publisher: 'Transnumerica',
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Transnumerica — Plateforme de Mobilité en RDC',
    description:
      'Voyagez simplement en RDC. Billets de bus interurbains, taxis et mototaxis (Wewa). Paiement Mobile Money sécurisé et billets QR hors-ligne.',
    url: 'https://transnumerica.cd',
    siteName: 'Transnumerica',
    locale: 'fr_CD',
    type: 'website',
    images: [
      {
        url: '/images/og-share-transnumerica.jpg',
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: 'Transnumerica — Voyagez simplement, payez par Mobile Money (RDC)',
      },
      {
        url: '/images/og-share-transnumerica.png',
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: 'Transnumerica — Voyagez simplement, payez par Mobile Money (RDC)',
      },
      {
        url: '/images/og-share-square.png',
        width: 600,
        height: 600,
        type: 'image/png',
        alt: 'Transnumerica RDC — Logo & Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@transnumerica_cd',
    creator: '@transnumerica_cd',
    title: 'Transnumerica — Mobilité & Billetterie en RD Congo',
    description:
      'Billets de bus interurbains, taxis et mototaxis Wewa. Paiement Mobile Money et billets QR hors-ligne.',
    images: ['/images/og-share-transnumerica.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0A2540',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning className={`scroll-smooth ${plusJakartaSans.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* Global Structured Data (Organization & WebSite) */}
        <JsonLd data={buildOrganizationSchema()} />
        <JsonLd data={buildWebSiteSchema()} />
        {/* Anti-FOUC Theme Initialization Script (Executes synchronously before render) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('tn_theme');
                  var mql = window.matchMedia('(prefers-color-scheme: dark)');
                  var isDark = stored === 'dark' || (!stored && mql.matches) || (stored === 'system' && mql.matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  var ds = localStorage.getItem('tn_datasaver');
                  var connDs = navigator.connection && navigator.connection.saveData;
                  if (ds === 'true' || connDs) {
                    document.documentElement.classList.add('tn-data-saver');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-surface-50 dark:bg-surface-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-amber-400 selection:text-slate-950 pb-16 lg:pb-0">
        <AppProvider>
          {/* Accessible Skip Link for Keyboard Navigation */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2.5 focus:bg-primary-900 focus:text-white focus:font-black focus:text-xs focus:rounded-xl focus:shadow-elevation-4 focus:outline-none focus:ring-2 focus:ring-accent-400"
          >
            Aller au contenu principal
          </a>
          <Navbar />
          <main id="main-content" className="flex-1" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          <MobileBottomNav />
          <ClientModals />
        </AppProvider>
      </body>
    </html>
  );
}
