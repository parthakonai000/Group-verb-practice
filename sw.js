// প্রতিবার সাইট আপডেট করলে শুধু এই নম্বরটা বাড়িয়ে দিন (v2 -> v3 ...)
const CACHE_NAME = 'pk-practice-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// ইনস্টল: ফাইল ক্যাশে রাখা (কোনো একটা ফাইল না থাকলেও ইনস্টল ফেইল হবে না)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(ASSETS_TO_CACHE.map((url) => cache.add(url).catch(() => {})))
    ).then(() => self.skipWaiting())
  );
});

// অ্যাক্টিভেট: পুরনো ক্যাশ মুছে ফেলা
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : null)))
    ).then(() => self.clients.claim())
  );
});

// ফেচ: আগে নেট থেকে নতুন ফাইল, নেট না থাকলে ক্যাশ থেকে
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || !req.url.startsWith('http')) return;

  // অন্য ডোমেইনের রিকোয়েস্ট (ফন্ট, ডাটা ইত্যাদি) ক্যাশ ছাড়াই যাবে
  if (new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((cached) => cached || caches.match('./index.html'))
      )
  );
});
