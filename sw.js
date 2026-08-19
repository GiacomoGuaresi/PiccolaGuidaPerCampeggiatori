// Service worker della Piccola Guida per Campeggiatori.
// L'app deve funzionare in montagna, cioè senza rete: all'installazione
// vengono messe in cache la shell e *tutte* le schede elencate in
// manifest.json (frammenti HTML piccoli, in totale poche centinaia di KB).
// Bump di CACHE_VERSION a ogni modifica della shell o del service worker.
const CACHE_VERSION = "v1";
const SHELL_CACHE = `guida-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `guida-runtime-${CACHE_VERSION}`;

const SHELL_ASSETS = [
  "./",
  "index.html",
  "manifest.json",
  "app.webmanifest",
  "assets/css/style.css",
  "assets/js/app.js",
  "assets/js/pwa.js",
  "assets/favicon.svg",
  "assets/favicon.ico",
  "assets/icons/favicon-16.png",
  "assets/icons/favicon-32.png",
  "assets/img/icons.svg",
  "assets/img/bg-pattern.png",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/icons/icon-maskable-512.png",
  "assets/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await cacheAllTolerant(cache, SHELL_ASSETS);
      await cacheAllTolerant(cache, await cardUrls());
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== SHELL_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "skip-waiting") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Navigazione: rete prima (per prendere subito una shell aggiornata),
  // altrimenti la index in cache.
  if (req.mode === "navigate") {
    event.respondWith(networkFirst(req, "index.html"));
    return;
  }

  // Font di Google: cache prima, si aggiornano di rado e offline sono
  // l'unica differenza visibile fra app installata e schermata rotta.
  if (url.origin === "https://fonts.googleapis.com" || url.origin === "https://fonts.gstatic.com") {
    event.respondWith(cacheFirst(req, RUNTIME_CACHE));
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Schede e asset locali: si serve la copia in cache e si aggiorna in
  // sottofondo (stale-while-revalidate).
  event.respondWith(staleWhileRevalidate(req));
});

async function cacheAllTolerant(cache, urls) {
  // cache.addAll() fallisce in blocco se un solo file manca: qui una scheda
  // rimossa dal disco ma ancora in manifest non deve impedire l'installazione.
  await Promise.all(
    urls.map(async (url) => {
      try {
        const res = await fetch(url, { cache: "reload" });
        if (res.ok) await cache.put(url, res);
      } catch (err) {
        /* offline o file mancante: si riproverà a runtime */
      }
    })
  );
}

async function cardUrls() {
  try {
    const res = await fetch("manifest.json", { cache: "reload" });
    if (!res.ok) return [];
    const data = await res.json();
    const entries = Array.isArray(data) ? data : data.cards || [];
    return entries.map((entry) => entry && entry.file).filter(Boolean);
  } catch (err) {
    return [];
  }
}

async function networkFirst(req, fallbackUrl) {
  try {
    const res = await fetch(req);
    if (res.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(fallbackUrl, res.clone());
    }
    return res;
  } catch (err) {
    const cached = (await caches.match(fallbackUrl)) || (await caches.match(req));
    if (cached) return cached;
    throw err;
  }
}

async function cacheFirst(req, cacheName) {
  const cached = await caches.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  if (res.ok || res.type === "opaque") {
    const cache = await caches.open(cacheName);
    cache.put(req, res.clone());
  }
  return res;
}

async function staleWhileRevalidate(req) {
  const shell = await caches.open(SHELL_CACHE);
  const fromShell = await shell.match(req);
  const cache = fromShell ? shell : await caches.open(RUNTIME_CACHE);
  const cached = fromShell || (await cache.match(req));

  const network = fetch(req)
    .then((res) => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => null);

  if (cached) return cached;
  const res = await network;
  if (res) return res;
  return new Response("Contenuto non disponibile offline.", {
    status: 504,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
