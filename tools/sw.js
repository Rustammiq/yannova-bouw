
// Service Worker for Yannova Website
const CACHE_NAME = 'yannova-v1.0.0';
const urlsToCache = [
    '/',
    '/assets/css/critical.css',
    '/assets/css/bundle.min.css',
    '/assets/css/modern-ui-enhancements.min.css',
    '/assets/js/main.min.js',
    '/assets/js/modern-ui-interactions.min.js',
    '/assets/images/icon-192.png',
    '/assets/images/icon-512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
