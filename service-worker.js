var cacheStorageKey = 'minimal-pwa-2'

var cacheList = [
  '/',
  "index.html",
]

self.addEventListener('install', e => {
    e.waitUntil(
      caches.open(cacheStorageKey)
      .then(cache => cache.addAll(cacheList))
      .then(() => self.skipWaiting())
    )
    console.log("The install listener have been called.");
  })
  
  self.addEventListener('activate', function(event) {
    console.log('Finally active. Ready to start serving content!');  
  });
  
  
  self.addEventListener('fetch', function(event) {
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          // Cache hit - return response
          if (response) {
            return response;
          }
          // Cache miss - fetch from internet and try to store them in caches
          var requestToCache = event.request.clone();
          
          return fetch(requestToCache).then(
            function(response){
                if(!response || response.status !== 200){
                    return response;
                }
            
                var responseToCache = response.clone();
                caches.open(cacheStorageKey).then(function(cache){
                    cache.put(requestToCache, responseToCache);
                });
                return response;
            });
        })
    );
  });
  