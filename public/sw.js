/**
 * Transnumerica Service Worker — Aggressive Cache for 3G & Offline Resilience
 * Version: 2.1.0
 */

const CACHE_NAME = 'transnumerica-cache-v2';
const STATIC_ASSETS_CACHE = 'transnumerica-static-v2';
const TICKETS_CACHE = 'transnumerica-tickets-v2';

const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/images/logo-horizontal-transparent.png',
];

// Offline HTML fallback shell for un-cached navigations
const OFFLINE_FALLBACK_HTML = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Hors-Ligne — Transnumerica</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0A2540; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; text-align: center; }
    .card { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 24px; padding: 32px 24px; max-width: 400px; width: 100%; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
    h1 { font-size: 20px; font-weight: 900; margin: 16px 0 8px; }
    p { font-size: 13px; color: #cbd5e1; line-height: 1.5; margin-bottom: 24px; }
    .btn { display: inline-block; background: #F59E0B; color: #0f172a; font-weight: 800; font-size: 13px; padding: 12px 24px; border-radius: 14px; text-decoration: none; }
    .icon { font-size: 44px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">📶</div>
    <h1>Connexion Internet Indisponible</h1>
    <p>Vous êtes actuellement hors-ligne. Vos billets et trajets téléchargés restent accessibles dans l'application.</p>
    <a href="/account?tab=trips" class="btn">Consulter mes billets hors-ligne</a>
  </div>
</body>
</html>`;

// Install event: Precache core shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Also cache offline fallback shell
      const offlineResponse = new Response(OFFLINE_FALLBACK_HTML, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
      cache.put('/offline-shell', offlineResponse);
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Core precache warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event: Clean up legacy caches
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, STATIC_ASSETS_CACHE, TICKETS_CACHE];
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (!currentCaches.includes(key)) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: Optimized multi-tier caching
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. Static immutable Next.js chunks & fonts: Cache-First
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.hostname.includes('gstatic.com') ||
    url.hostname.includes('googleapis.com') ||
    url.pathname.match(/\.(woff2?|ttf|otf|png|jpg|jpeg|webp|avif|svg|ico)$/i)
  ) {
    event.respondWith(
      caches.open(STATIC_ASSETS_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch {
          return cached || Response.error();
        }
      })
    );
    return;
  }

  // 2. Tickets and offline QR codes: Cache-First with Stale-While-Revalidate
  if (url.pathname.startsWith('/tickets/') || url.pathname.includes('/trips')) {
    event.respondWith(
      caches.open(TICKETS_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        const networkFetch = fetch(event.request)
          .then((res) => {
            if (res && res.status === 200) {
              cache.put(event.request, res.clone());
            }
            return res;
          })
          .catch(() => cached);

        return cached || networkFetch;
      })
    );
    return;
  }

  // 3. Navigation HTML pages: Stale-While-Revalidate with Offline Fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, copy);
            });
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          const fallback = await caches.match('/offline-shell');
          return (
            fallback ||
            new Response(OFFLINE_FALLBACK_HTML, {
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
            })
          );
        })
    );
    return;
  }

  // 4. Default: Network first with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
