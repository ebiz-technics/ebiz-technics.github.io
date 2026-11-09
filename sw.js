/* E-BIZ Technics — service worker
   Caches the site's own files so pages keep working offline after the first visit.
   Bump CACHE_VERSION whenever you deploy changes so visitors get the new files. */
const CACHE_VERSION = 'ebiz-v1';
const CORE_FILES = [
  './', 'index.html', 'about.html', 'services.html', 'solutions.html', 'careers.html', 'contact.html', '404.html',
  'css/styles.css', 'js/main.js', 'assets/favicon.svg', 'site.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((c) => c.addAll(CORE_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Pages: network first (fresh content), fall back to cache when offline.
// Everything else (CSS, JS, fonts, images, icons): cache first, then network.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE_VERSION).then((c) => c.put(req, copy)); return res; })
        .catch(() => caches.match(req).then((r) => r || caches.match('index.html')))
    );
    return;
  }
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE_VERSION).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => cached))
  );
});
