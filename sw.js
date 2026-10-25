// Dino Rush service worker: the game opens fast and works offline; new versions are picked up on the next visit
const CACHE = 'dinorush-v109';
const CORE = ['./', 'index.html', 'three.min.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-180.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('dinorush-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;   // the multiplayer server and the ranking go straight to the network
  if (url.pathname.includes('/musica/')) {   // songs: from the device once downloaded
    e.respondWith(caches.open(CACHE).then(c => c.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok && r.status === 200) c.put(req, r.clone()); return r; }))));
    return;
  }
  e.respondWith(fetch(req).then(r => { if (r.ok) caches.open(CACHE).then(c => c.put(req, r.clone())); return r; }).catch(() => caches.match(req).then(hit => hit || caches.match('index.html'))));   // the rest: fresh when online, saved copy when not
});
