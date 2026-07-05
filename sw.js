const CACHE_NAME = 'sreeambal-portal-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './i18n.js',
  './app.js',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap'
];

// Install Event - Cache Application Shell
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install Event: Caching App Shell');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((error) => {
        console.warn('[ServiceWorker] Note: Some external assets could not be cached immediately:', error);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate Event: Cleaning old caches');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Serve from cache, fallback to network, with stale-while-revalidate for static assets
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // For Supabase API calls or realtime WebSocket connections, let network handle directly with graceful error fallback
  if (url.includes('supabase.co') || event.request.method !== 'GET') {
    event.respondWith(
      fetch(event.request).catch((error) => {
        console.warn('[ServiceWorker] Network request failed for API/dynamic call:', error);
        throw error;
      })
    );
    return;
  }

  // For static assets and app shell, use Cache First strategy with network fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Stale-while-revalidate background update
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
        }).catch(() => {
          // Ignore network errors during background update
        });
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch((error) => {
        console.warn('[ServiceWorker] Offline fetch failed for:', url, error);
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        throw error;
      });
    })
  );
});
