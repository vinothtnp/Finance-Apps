const CACHE = 'ledger-v2';
const SHELL = ['./index.html', './manifest.json', './icon.svg', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

const NO_CACHE_HOSTS = ['finance.yahoo.com', 'corsproxy.io', 'allorigins.win', 'codetabs.com'];

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Never cache live price calls (direct or via CORS relay) — always go to network.
  if (NO_CACHE_HOSTS.some(h => url.hostname.includes(h))) return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => cached))
  );
});
