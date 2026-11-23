// Offline cache for the app shell. Bump VERSION when files change.
const VERSION = 'fither-v2';
const FILES = ['./', 'index.html', 'css/styles.css', 'js/figure.js', 'js/data-exercises.js', 'js/data-meals.js', 'js/data-program.js', 'js/app.js', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  // network first so updates show up, cache fallback for offline
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(VERSION).then(ca => ca.put(e.request, c)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});
