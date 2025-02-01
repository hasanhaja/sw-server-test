const VERSION = "0.0.1";
const STATIC_CACHE_NAME = `static-cache_${VERSION}`;

// TODO Cache manifest etc, but not service worker. Let the browser handle that.
const assets = [
  "/",
  "/index.html",
  "/main.js",
];

async function cacheStatic() {
  const cache = await caches.open(STATIC_CACHE_NAME);
  await cache.addAll(assets);
  console.log(`${STATIC_CACHE_NAME} has been updated`);
}

async function cleanCache() {
  const keys = await caches.keys();
  return Promise.all(
    keys
      .filter((key) => key !== STATIC_CACHE_NAME)
      .map((key) => caches.delete(key))
  );
}

self.addEventListener("install", (e) => {
  console.log(`Version ${VERSION} installed`);
  e.waitUntil(cacheStatic());
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  console.log(`Version ${VERSION} activated`);
  e.waitUntil(async () => {
    await cleanCache();
    await self.clients.claim(); 
  });
});

async function respondWithCache(request) {
  const cacheRes = await caches.match(request); 
  if (cacheRes !== undefined) {
    return cacheRes;
  } 
  // fetch anyways incase the cache is stale
  const fetchRes = await fetch(request);
  const cache = await caches.open(STATIC_CACHE_NAME);
  cache.put(request, fetchRes.clone());
  return fetchRes;
}

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  const path = url.pathname;

  if (assets.includes(path)) {
    e.respondWith(respondWithCache(e.request));
  } else if (path === "/kick") {
    const data = { message: "Hello from SW for /kick" };
    const res = new Response(JSON.stringify(data), { status: 200, statusText: "OK" });
    e.respondWith(res);
  } else if (path === "/content") {
    const content = `
      <section>
        <h2>Server content</h2>
        <p>This content was generated on the service worker pretending to be the real server.</p>
      </section>
    `;
    const headers = new Headers();
    headers.append("Content-Type", "text/html");

    const res = new Response(content, { status: 200, statusText: "OK", headers });
    e.respondWith(res);
  }
});
