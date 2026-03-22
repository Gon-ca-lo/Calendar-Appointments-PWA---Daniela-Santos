const CACHE_NAME = 'daniela-app-v1';
const urlsToCache = [
  '/Calendar-Appointments-PWA---Daniela-Santos/',
  '/Calendar-Appointments-PWA---Daniela-Santos/index.html',
  '/Calendar-Appointments-PWA---Daniela-Santos/styles.css',
  '/Calendar-Appointments-PWA---Daniela-Santos/script.js',
  '/Calendar-Appointments-PWA---Daniela-Santos/events.js',
  '/Calendar-Appointments-PWA---Daniela-Santos/dataManager.js',
  '/Calendar-Appointments-PWA---Daniela-Santos/calendarBuilder.js',
  '/Calendar-Appointments-PWA---Daniela-Santos/manifest.json',
  '/Calendar-Appointments-PWA---Daniela-Santos/img/icon-192.png',
  '/Calendar-Appointments-PWA---Daniela-Santos/img/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );
});