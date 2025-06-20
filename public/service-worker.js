
const CACHE_NAME = 'airdrop-compass-cache-v1.12'; // Incremented version
const OFFLINE_URL = 'offline.html';
const API_CACHE_NAME = 'airdrop-compass-api-cache-v1.7'; // Incremented API Cache version

const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/index.tsx',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
  'https://esm.sh/react@^19.1.0',
  'https://esm.sh/react-dom@^19.1.0/client',
  'https://esm.sh/lucide-react@^0.515.0',
  'https://esm.sh/localforage@^1.10.0',
  'https://esm.sh/react-router-dom@^7.6.2',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  '/assets/sounds/timer-notification.mp3'
];

self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install event in progress.');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching app shell and core assets.');
        const cachePromises = URLS_TO_CACHE.map(urlToCache => {
            const request = new Request(urlToCache, {cache: 'reload'}); // Force reload from network
            return cache.add(request).catch(err => {
                console.warn(`[ServiceWorker] Failed to cache ${urlToCache} during install:`, err);
            });
        });
        return Promise.all(cachePromises);
      })
      .then(() => {
        console.log('[ServiceWorker] Install completed, skipping waiting.');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[ServiceWorker] Cache addAll failed during install:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate event in progress.');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[ServiceWorker] Activate completed, claiming clients.');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Navigate requests: try network, then cache, then offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            console.log('[ServiceWorker] Using preload response for navigation.');
            return preloadResponse;
          }
          const networkResponse = await fetch(request);
          console.log('[ServiceWorker] Serving navigation from network:', request.url);
          return networkResponse;
        } catch (error) {
          console.log('[ServiceWorker] Navigate fetch failed; trying cache then offline page.', error);
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(request.url) || await cache.match(OFFLINE_URL);
          if (cachedResponse) {
            console.log('[ServiceWorker] Serving navigation from cache or offline page.');
            return cachedResponse;
          }
          return new Response("Offline fallback page not found in cache.", {status: 404, headers: {'Content-Type': 'text/html'}});
        }
      })()
    );
    return;
  }

  // API GET requests: Network first, then Cache
  if (request.url.includes('/api/v1/') && request.method === 'GET') {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);
           console.log(`[ServiceWorker] API request to network: ${request.url}, Status: ${networkResponse.status}`);
          if (networkResponse && networkResponse.ok) {
            const cache = await caches.open(API_CACHE_NAME);
            console.log(`[ServiceWorker] Caching API response for: ${request.url}`);
            await cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          console.log(`[ServiceWorker] API fetch failed for ${request.url}; trying cache. Error:`, error);
          const cache = await caches.open(API_CACHE_NAME);
          const cachedResponse = await cache.match(request);
          if (cachedResponse) {
            console.log(`[ServiceWorker] Serving API response from API_CACHE: ${request.url}`);
            return cachedResponse;
          }
          console.warn(`[ServiceWorker] API request for ${request.url} failed and not in API_CACHE.`);
          return new Response(JSON.stringify({ error: 'Offline and data not available from cache. Please connect to the internet to refresh data.' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 503 
          });
        }
      })()
    );
    return;
  }

  // Static assets: Cache first, then network
  if (URLS_TO_CACHE.some(url => request.url.endsWith(url.split('/').pop() || url)) ||
      request.destination === 'font' ||
      request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'image' ||
      request.url.startsWith('https://esm.sh/')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          console.log(`[ServiceWorker] Serving static asset from CACHE_NAME: ${request.url}`);
          return cachedResponse;
        }
        console.log(`[ServiceWorker] Static asset not in cache, fetching from network: ${request.url}`);
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
             if (request.url.startsWith('https://esm.sh/') || URLS_TO_CACHE.includes(request.url) || URLS_TO_CACHE.some(u => request.url.endsWith(u.split('/').pop() || u))) {
                return caches.open(CACHE_NAME).then(cache => {
                    console.log(`[ServiceWorker] Caching new static asset: ${request.url}`);
                    cache.put(request, networkResponse.clone());
                    return networkResponse;
                });
             }
          }
          return networkResponse;
        });
      }).catch(error => {
        console.warn('[ServiceWorker] Static asset fetch failed, not in cache:', request.url, error);
      })
    );
    return;
  }
});
