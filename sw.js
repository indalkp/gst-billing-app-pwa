// Minimal cache-first service worker for the app shell only — bump CACHE_NAME whenever built
// assets change meaningfully; the activate handler deletes any stale cache automatically.
// Bump this every time the built JS/CSS content changes — index.html references content-hashed
// asset filenames (e.g. index-XXXXXX.js) that change per build, so an un-bumped cache would keep
// serving a stale index.html pointing at asset files that no longer exist on the server.
const CACHE_NAME = 'billing-web-shell-v2';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(['./', './index.html', './manifest.json'])));
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
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
