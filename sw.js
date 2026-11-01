/**
 * P29 Service Worker — 缓存优先，仅服务本工具。
 * 1. 安装时预缓存本工具核心文件
 * 2. 样式与文档走网络优先，失败再读缓存
 * 3. 其余同源 GET 走缓存优先，并在后台更新
 */
const CACHE_NAME = "p29-fallacy-match-v1";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./favicon.svg",
  "./styles.css",
  "./app.js",
  "./pm-metrics.js",
  "../shared/modern-styles.css",
  "../shared/tool-chrome.css",
  "../shared/design-tokens.css",
  "../shared/dark-toggle.js",
  "../shared/cmd-palette.js",
  "../shared/toast.js",
  "../shared/onboarding.js",
  "../shared/pedagogy-data-p1.js",
  "../shared/pedagogy-data-p2.js",
  "../shared/global-nav.js",
  "../shared/kbd-hints.js"
];

// Install: Pre-cache core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch(() => {
        // Silently skip missing optional files
        return Promise.allSettled(
          CORE_ASSETS.map((url) => cache.add(url).catch(() => {}))
        );
      });
    })
  );
  self.skipWaiting();
});

// Activate: Clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: Cache-First for same-origin, Network-First for external
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET and cross-origin API calls
  if (event.request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;
  const isStyleOrDoc =
    event.request.destination === "document" ||
    event.request.destination === "style" ||
    url.pathname.endsWith(".html") ||
    url.pathname.endsWith(".css");

  if (isStyleOrDoc) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((c) => c || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        // Return cache, but also update in background (stale-while-revalidate)
        const fetchPromise = fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => {});
        event.waitUntil(fetchPromise);
        return cached;
      }
      return fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback
        if (event.request.destination === "document") {
          return caches.match("./index.html");
        }
      });
    })
  );
});
