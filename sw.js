/*

Service worker code 
Influenced by https://developers.google.com/web/ilt/pwa/lab-caching-files-with-service-worker)
*/


(function() {
  'use strict';


// Stage 1 --> Adding things to Cache
  var filesToCache = [
  'css/styles.css',
  'js/dbhelper.js',
  'js/main.js',
  'js/restaurant_info.js',
  'index.html',
  'restaurant.html',
  'img/1.jpg',
  'img/2.jpg',
  'img/3.jpg',
  'img/4.jpg',
  'img/5.jpg',
  'img/6.jpg',
  'img/7.jpg',
  'img/8.jpg',
  'img/9.jpg',
  'img/10.jpg',
  'node_modules/idb/lib/idb.js',
  'sw.js'
];

var staticCacheName = 'pages-cache-v1';

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(staticCacheName)
    .then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request);
    })
  );
});

})();

