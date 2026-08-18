/* JARVIS Service Worker — HUD kabuğunu önbelleğe alır (offline destek) */
const CACHE = "jarvis-v10-v1";
const SHELL = [
  "/",
  "/index.html",
  "/css/jarvis.css",
  "/js/hud.js",
  "/js/app.js",
  "/manifest.json",
  "/icons/jarvis.svg",
  "/icons/jarvis-maskable.svg",
  "/icons/favicon.svg"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // API istekleri önbelleğe alınmaz (her zaman canlı)
  if (url.pathname.startsWith("/api/") || url.pathname === "/health" || url.pathname === "/meta") {
    return;
  }

  // Yalnızca GET
  if (req.method !== "GET") return;

  e.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
