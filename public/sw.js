const CACHE_NAME = 'mk-portfolio-v1';
const STATIC_ASSETS = [
  '/',
  '/blog',
  '/guestbook',
  '/search',
  '/manifest.json',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);

  // Bypass service worker for non-http/https protocols (e.g. chrome-extension)
  if (!url.protocol.startsWith('http')) return;

  // Bypass for Next.js hot-reloading (development)
  if (url.pathname.includes('/_next/webpack-hmr') || url.pathname.includes('webpack')) {
    return;
  }

  // Bypass API and Auth/Dashboard routes to prevent caching sensitive/private states
  if (
    url.pathname.startsWith('/api') || 
    url.pathname.startsWith('/dashboard') || 
    url.pathname.startsWith('/login') || 
    url.pathname.startsWith('/register')
  ) {
    return;
  }

  const isHtml = event.request.mode === 'navigate' || 
                 (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'));

  if (isHtml) {
    // Network-First (Network falling back to cache) for HTML documents
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cloned = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, cloned);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return caches.match('/');
          });
        })
    );
  } else {
    // Cache-First (Cache falling back to network) for static assets (images, JS, CSS, fonts)
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) return response;
        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) return networkResponse;
          
          // Only cache static assets from our own origin
          if (event.request.url.startsWith(self.location.origin)) {
            const cloned = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, cloned);
            });
          }
          return networkResponse;
        });
      })
    );
  }
});
