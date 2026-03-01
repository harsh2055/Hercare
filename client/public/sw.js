// client/public/sw.js
// HerCare Service Worker
//
// Strategy:
//   • Static assets (JS/CSS/fonts/images)  → Cache-First (fast loads, versioned cache bust)
//   • API calls (/api/*)                   → Network-First with 5s timeout (fresh data, falls back to cache)
//   • Navigation requests (HTML pages)     → Network-First, falls back to /offline.html
//   • Unsplash images (pose photos)        → Stale-While-Revalidate (show cached, update in background)
//
// Cache versioning: bump CACHE_VERSION on each deploy to force fresh install.
// ─────────────────────────────────────────────────────────────────────────────

const CACHE_VERSION    = 'hercare-v1';
const STATIC_CACHE     = `${CACHE_VERSION}-static`;
const API_CACHE        = `${CACHE_VERSION}-api`;
const IMAGE_CACHE      = `${CACHE_VERSION}-images`;

// Assets to pre-cache on install (app shell)
const APP_SHELL_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
];

// ── INSTALL ───────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Pre-caching app shell');
      return cache.addAll(APP_SHELL_URLS);
    }).then(() => self.skipWaiting())  // activate immediately
  );
});

// ── ACTIVATE ──────────────────────────────────────────────────────────────────
// Delete all caches that don't belong to the current CACHE_VERSION
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter(key => !key.startsWith(CACHE_VERSION))
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      );
    }).then(() => self.clients.claim())  // take control of all open tabs immediately
  );
});

// ── FETCH ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // ── 1. API calls → Network-First (5s timeout) ─────────────────────────
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithTimeout(request, API_CACHE, 5000));
    return;
  }

  // ── 2. Unsplash / external images → Stale-While-Revalidate ───────────
  if (url.hostname.includes('unsplash.com') || url.hostname.includes('images.unsplash')) {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
    return;
  }

  // ── 3. Navigation (HTML page requests) → Network-First + offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // ── 4. Static assets (JS/CSS/fonts/icons) → Cache-First ──────────────
  if (
    url.pathname.match(/\.(js|css|woff2?|ttf|otf|svg|png|jpg|webp|ico)$/) ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // ── 5. Everything else → Network only (no caching) ───────────────────
  // Don't cache unknown request types
});

// ── Strategy helpers ──────────────────────────────────────────────────────────

/**
 * Cache-First: return cache hit immediately, otherwise fetch + cache.
 */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Asset not in cache and network failed — nothing we can do
    return new Response('Asset unavailable offline.', { status: 503 });
  }
}

/**
 * Network-First with timeout: try network first.
 * If network is slow (> timeout ms) or fails, fall back to cache.
 * API responses are cached for offline use.
 */
async function networkFirstWithTimeout(request, cacheName, timeoutMs) {
  const cache = await caches.open(cacheName);

  // Race: network response vs timeout promise
  const networkPromise = fetch(request).then(async (response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Network timeout')), timeoutMs)
  );

  try {
    return await Promise.race([networkPromise, timeoutPromise]);
  } catch {
    // Network failed or timed out — return cached response if available
    const cached = await cache.match(request);
    if (cached) {
      console.log('[SW] Serving cached API response for:', request.url);
      return cached;
    }
    // No cache — return offline JSON
    return new Response(
      JSON.stringify({ message: 'You are offline. Please reconnect to see live data.', offline: true }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Stale-While-Revalidate: return cache immediately (if available),
 * then fetch from network in the background and update cache.
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache   = await caches.open(cacheName);
  const cached  = await cache.match(request);

  // Start network fetch regardless (background update)
  const networkFetch = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);

  // Return cached immediately if available, else wait for network
  return cached || networkFetch;
}

// ── BACKGROUND SYNC ───────────────────────────────────────────────────────────
// Stub for future: retry failed API writes (e.g. symptom log saved while offline)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-symptom-logs') {
    console.log('[SW] Background sync: symptom logs');
    // Future: event.waitUntil(replayFailedRequests('symptom-logs'));
  }
  if (event.tag === 'sync-cycle-logs') {
    console.log('[SW] Background sync: cycle logs');
    // Future: event.waitUntil(replayFailedRequests('cycle-logs'));
  }
});

// ── PUSH NOTIFICATIONS ────────────────────────────────────────────────────────
// Stub for future reminder push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try { data = event.data.json(); }
  catch { data = { title: 'HerCare', body: event.data.text() }; }

  const options = {
    body: data.body || 'You have a new health reminder.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: data.tag || 'hercare-reminder',
    data: { url: data.url || '/' },
    actions: [
      { action: 'open',    title: 'View',   icon: '/icons/icon-72x72.png' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
    vibrate: [100, 50, 100],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'HerCare', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});