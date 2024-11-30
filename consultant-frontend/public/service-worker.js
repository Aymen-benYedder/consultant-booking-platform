const CACHE_NAME = 'consultant-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/css/main.chunk.css',
  '/static/js/main.chunk.js',
  '/static/js/bundle.js'
];

let preloadedConsultants = [];

// Install a service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(STATIC_ASSETS);
      })
  );
});

// Listen for messages from the client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CACHE_CONSULTANTS') {
    const consultants = event.data.consultants;
    preloadedConsultants = consultants.slice(0, 8).map(c => c.avatar);
    
    // Preload first 8 consultant images
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => {
          return Promise.all(
            preloadedConsultants.map(imageUrl => 
              fetch(imageUrl)
                .then(response => cache.put(imageUrl, response))
                .catch(error => console.log('Failed to cache:', imageUrl, error))
            )
          );
        })
    );
  }
});

// Cache and return requests
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          response => {
            // Check if we received a valid response
            if(!response || response.status !== 200) {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Don't cache if the URL contains certain patterns
            if (!event.request.url.includes('google') && 
                !event.request.url.includes('auth') &&
                !event.request.url.includes('api')) {
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }

            return response;
          }
        );
      })
  );
});

// Update a service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
