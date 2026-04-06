const CACHE_NAME = 'jlpt-store-v2';

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([
      '/',
      '/index.html',
      '/css/style.css',
      '/js/app.js',
      '/js/kana.js',
      '/js/vocabulary.js',
      '/js/grammar.js',
      '/js/kanji.js',
      '/js/data-extra.js',
      '/js/exam-data.js',
      '/js/n4-tests.js',
      '/js/listening.js',
      '/js/resource.js',
      '/img/icon-192.jpg',
      '/img/icon-512.jpg',
      '/img/screenshot1.png',
      '/img/screenshot2.png'
    ])),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Network First, falling back to cache
  e.respondWith(
    fetch(e.request).then((response) => {
      // If we got a valid response, clone it and update the cache
      if (response && response.status === 200 && response.type === 'basic') {
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseToCache);
        });
      }
      return response;
    }).catch(() => {
      // If network fails (offline), return cached version
      return caches.match(e.request);
    })
  );
});
