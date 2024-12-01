/* eslint-disable no-restricted-globals */
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

clientsClaim();
self.skipWaiting();

// Precache all assets generated by your build process
precacheAndRoute(self.__WB_MANIFEST);

// Cache static resources (CSS, JS, Web Workers)
registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'worker',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Cache images with a Cache First strategy
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Cache fonts with a Cache First strategy
registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'fonts',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
      }),
    ],
  })
);

// Cache API responses with StaleWhileRevalidate strategy
registerRoute(
  ({ url }) => url.pathname.startsWith('/api'),
  new StaleWhileRevalidate({
    cacheName: 'api-responses',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      }),
    ],
  })
);

// Cache consultant data with NetworkFirst strategy
registerRoute(
  ({ url }) => url.pathname.includes('/api/consultants'),
  new NetworkFirst({
    cacheName: 'consultant-data',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 12 * 60 * 60, // 12 hours
      }),
    ],
    networkTimeoutSeconds: 3,
  })
);

// Cache booking data with NetworkFirst strategy
registerRoute(
  ({ url }) => url.pathname.includes('/api/bookings'),
  new NetworkFirst({
    cacheName: 'booking-data',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 6 * 60 * 60, // 6 hours
      }),
    ],
    networkTimeoutSeconds: 3,
  })
);

// Handle navigation requests
const handler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(handler, {
  allowlist: [new RegExp('^/(?!api)')],
  denylist: [new RegExp('^/api/')],
});
registerRoute(navigationRoute);

// Offline fallback
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/offline.html');
      })
    );
  }
});
