const CACHE_NAME = "ludo-kingdom-cache-v7";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./board-data.js",
  "./ui.js",
  "./cloud.js",
  "./online.js",
  "./game.js",
  "./manifest.json",
  "./icon.webp",
  "./background-music.mp3",
  "./capture.mp3",
  "./get-home.mp3",
  "./winning.mp3"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((oldKey) => caches.delete(oldKey))
      )
    )
  );
  self.clients.claim();
});

async function serveFromCacheWithRange(request) {
  const cached = await caches.match(request, { ignoreVary: true });
  if (!cached) {
    return request.mode === "navigate" ? caches.match("./index.html") : Response.error();
  }

  const rangeHeader = request.headers.get("range");
  if (!rangeHeader) return cached;

  const buf = await cached.arrayBuffer();
  const total = buf.byteLength;
  const match = /bytes=(\d*)-(\d*)/.exec(rangeHeader);
  if (!match) return cached;

  const start = match[1] ? parseInt(match[1], 10) : 0;
  const end = match[2] ? Math.min(parseInt(match[2], 10), total - 1) : total - 1;
  if (start >= total || start > end) {
    return new Response("", {
      status: 416,
      headers: { "Content-Range": `bytes */${total}` }
    });
  }

  const chunk = buf.slice(start, end + 1);
  return new Response(chunk, {
    status: 206,
    statusText: "Partial Content",
    headers: {
      "Content-Type": cached.headers.get("Content-Type") || "audio/mpeg",
      "Content-Range": `bytes ${start}-${end}/${total}`,
      "Content-Length": String(chunk.byteLength),
      "Accept-Ranges": "bytes"
    }
  });
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => serveFromCacheWithRange(event.request))
  );
});
