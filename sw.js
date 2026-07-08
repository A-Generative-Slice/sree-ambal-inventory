/**
 * ============================================================================
 * SREE AMBAL CATERING — SERVICE WORKER (sw.js)
 * Strategy: Network-First for HTML/JS/CSS (Always fresh!), Cache fallback when offline
 * ============================================================================
 */

const CACHE_NAME = 'sreeambal-portal-v9';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './catalog.js?v=9',
  './i18n.js?v=9',
  './app.js?v=9',
  './manifest.json',
  'https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&display=swap'
];

// Install Event - Cache Application Shell and force immediate activation
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install Event: Caching App Shell v3');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[ServiceWorker] Note: External fonts/CDN could not be cached offline immediately:', err);
      });
    })
  );
  self.skipWaiting(); // Force new Service Worker to activate instantly
});

// Activate Event - Clean up all old caches (v1, v2, iOS 14 cache) immediately
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate Event: Cleaning old caches');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old obsolete cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control of all open client tabs immediately
});

// Fetch Event - NETWORK-FIRST strategy for local assets so updates are live immediately!
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // For Firebase API calls or realtime connections, let network handle directly
  if (url.includes('firebase') || url.includes('googleapis.com') || event.request.method !== 'GET') {
    event.respondWith(
      fetch(event.request).catch((error) => {
        console.warn('[ServiceWorker] Network request failed for API/dynamic call:', error);
        throw error;
      })
    );
    return;
  }

  // For HTML, JS, CSS, and manifest: NETWORK FIRST! Always fetch freshest version from GitHub Pages
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If fetch succeeds, update the cache in background and return fresh response
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch((error) => {
        // If offline or network fails, fallback to cached version
        console.log('[ServiceWorker] Offline fallback for:', url);
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          throw error;
        });
      })
  );
});
