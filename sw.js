// Service Worker voor Yannovabouw - Enhanced Version
const CACHE_NAME = 'yannovabouw-v2.0.0';
const STATIC_CACHE = 'yannova-static-v2';
const DYNAMIC_CACHE = 'yannova-dynamic-v2';

const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/assets/css/bundle.css',
  '/assets/js/main.js',
  '/assets/js/layout-switcher.js',
  '/assets/js/quote-generator.js',
  '/assets/js/analytics.js',
  '/assets/images/about-team.jpg',
  '/assets/images/hero-bg.jpg',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - stale-while-revalidate strategy
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // If we have a cached version, return it immediately
        if (response) {
          // Update cache in background
          fetch(event.request)
            .then(fetchResponse => {
              if (fetchResponse.status === 200) {
                caches.open(DYNAMIC_CACHE)
                  .then(cache => {
                    cache.put(event.request, fetchResponse.clone());
                  });
              }
            })
            .catch(() => {
              // Ignore network errors for background updates
            });
          
          return response;
        }

        // If not in cache, fetch from network
        return fetch(event.request)
          .then(fetchResponse => {
            // Check if valid response
            if (fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
              return fetchResponse;
            }

            // Clone the response
            const responseToCache = fetchResponse.clone();

            // Cache the response
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return fetchResponse;
          })
          .catch(() => {
            // If network fails and it's a page request, show offline page
            if (event.request.destination === 'document') {
              return caches.match('/offline.html');
            }
            
            // For other resources, return a basic error response
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});