// Service worker: guarda a "casca" do app (página, ícones) para abrir rápido.
// Os pratos sempre vêm da internet, pelo Apps Script.
const CACHE = 'cozinha-do-lago-v1';
const SHELL = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'icon-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // apaga caches de versões antigas deste app (não mexe no cache do London Bus)
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('cozinha-do-lago-') && k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // Apps Script: deixa passar direto
  // tenta a internet primeiro; sem conexão, usa a cópia guardada
  e.respondWith(
    fetch(e.request)
      .then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request))
  );
});
