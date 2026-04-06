self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('jlpt-store').then((cache) => cache.addAll([
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
      '/js/resource.js'
    ])),
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request)),
  );
});
