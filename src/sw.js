/**
 * Service Worker untuk PWA
 * Menangani push notification, caching, dan mode offline
 */

const CACHE_NAME = 'cerita-nusantara-v1';
const urlsToCache = [
  '/',
  '/app.css',
  '/app.bundle.js',
  '/manifest.json',
  '/images/logo.png',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
];

// Install event - Pre-cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => clients.claim())
  );
});

// Push event - menerima notifikasi dari server
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received', event);

  let notificationData = {
    title: 'Story berhasil dibuat',
    options: {
      body: 'Anda telah membuat story baru',
      icon: '/images/icon-192x192.png',
      badge: '/images/badge-72x72.png',
      vibrate: [200, 100, 200],
      tag: 'story-notification',
      requireInteraction: false,
      actions: [
        {
          action: 'view',
          title: 'Lihat Story',
          icon: '/images/checkmark.png'
        },
        {
          action: 'close',
          title: 'Tutup',
          icon: '/images/close.png'
        }
      ],
      data: {
        url: '/#/home',
        storyId: null
      }
    }
  };

  // Jika ada data dari push
  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('Push payload:', payload);
      
      if (payload.title) {
        notificationData.title = payload.title;
      }
      
      if (payload.options) {
        notificationData.options = {
          ...notificationData.options,
          ...payload.options
        };
      }

      // Simpan data untuk navigation
      if (payload.options && payload.options.data) {
        notificationData.options.data = {
          ...notificationData.options.data,
          ...payload.options.data
        };
      }
    } catch (error) {
      console.error('Error parsing push payload:', error);
    }
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    notificationData.options
  );

  event.waitUntil(promiseChain);
});

// Notification click event - handle navigasi
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  const action = event.action;
  const notificationData = event.notification.data || {};
  
  // Jika user klik action "close", tidak perlu buka window
  if (action === 'close') {
    return;
  }

  // Jika action "view" atau klik pada notification body
  let urlToOpen = notificationData.url || '/#/home';
  
  // Jika ada storyId, navigasi ke detail story
  if (notificationData.storyId) {
    urlToOpen = `/#/story/${notificationData.storyId}`;
  }

  const promiseChain = clients.openWindow(urlToOpen);
  event.waitUntil(promiseChain);
});

// Fetch event - Network First, falling back to cache (untuk mode offline)
self.addEventListener('fetch', (event) => {
  // Skip untuk request bukan GET
  if (event.request.method !== 'GET') return;
  
  // Skip untuk chrome extension
  if (event.request.url.startsWith('chrome-extension://')) return;
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone response karena response hanya bisa digunakan sekali
        const responseToCache = response.clone();
        
        // Jangan cache API requests dari story-api
        if (!event.request.url.includes('/v1/')) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        
        return response;
      })
      .catch(() => {
        // Jika offline, ambil dari cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Jika API request dan offline, return offline page
          if (event.request.url.includes('/v1/')) {
            return new Response(
              JSON.stringify({ 
                error: true, 
                message: 'Anda sedang offline. Silakan cek koneksi internet.' 
              }),
              { 
                headers: { 'Content-Type': 'application/json' },
                status: 503
              }
            );
          }
          
          // Untuk halaman HTML, return fallback
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/');
          }
          
          return new Response('Offline - Resource not available', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});
