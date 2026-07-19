// Minimal cache-first service worker for the app shell only — this is what makes "Add to Home
// Screen" open instantly even on a flaky connection. The actual data fetch (a cross-origin call
// to the Apps Script backend) is deliberately left untouched here (no respondWith) so it always
// hits the network fresh — caching live sales/stock numbers would defeat the point of the dashboard.
// Bump this string every time index.html/manifest/icons change — the activate handler below
// deletes any cache whose name doesn't match, which is the only way a visitor's browser ever
// re-fetches the shell instead of serving whatever it cached on their very first visit.
const CACHE_NAME = 'billing-pwa-shell-v2';
const SHELL_FILES = ['./', './index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return; // let cross-origin (Apps Script) calls pass through untouched

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
