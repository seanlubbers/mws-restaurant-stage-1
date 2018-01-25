/*

Service worker code 
Influenced by https://developers.google.com/web/ilt/pwa/lab-caching-files-with-service-worker)
*/

(function() {
  'use strict';


// Stage 1 --> Adding things to Cache
  var filesToCache = [
  'css/styles.css',
  'data/restaurants.json',
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
];

var staticCacheName = 'pages-cache-v1';

self.addEventListener('install', function(event) {
  console.log('Attempting to install service worker and cache static assets');
  event.waitUntil(
    caches.open(staticCacheName)
    .then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
});

 self.addEventListener('fetch', function(event) {
  console.log('Fetch event for ', event.request.url);
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        console.log('Found ', event.request.url, ' in cache');
        return response;
      }
      console.log('Network request for ', event.request.url);
      return fetch(event.request)

    .then(function(response) {
      return caches.open(staticCacheName).then(function(cache) {
        if (event.request.url.indexOf('test') < 0) {
          cache.put(event.request.url, response.clone());
        }
        return response;
      });
    });
    }).catch(function(error) {
    })
  );
});
})();

