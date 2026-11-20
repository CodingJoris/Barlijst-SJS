// Barlijst service worker: laadt de app ook zonder internet.
// Verzoeken naar Google (de Sheet) worden NIET onderschept.
const CACHE = 'barlijst-v3-3';
const BESTANDEN = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BESTANDEN)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Eerst de opgeslagen versie tonen (snel, werkt offline), en op de achtergrond
// een nieuwe versie ophalen. Een update is zichtbaar na de volgende herstart.
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== self.location.origin) return;
  e.respondWith(caches.open(CACHE).then(c => c.match(e.request, { ignoreSearch: true }).then(opgeslagen => {
    const vers = fetch(e.request).then(r => { if (r && r.ok) c.put(e.request, r.clone()); return r; }).catch(() => opgeslagen);
    return opgeslagen || vers;
  })));
});
