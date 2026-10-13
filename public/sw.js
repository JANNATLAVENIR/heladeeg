const CACHE_NAME = 'heladeeg-shell-v2'
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/logo.svg', '/icons/heladeeg-192.svg', '/icons/heladeeg-512.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('heladeeg-') && key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()))
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request)
        if (response.ok) await (await caches.open(CACHE_NAME)).put('/', response.clone())
        return response
      } catch {
        return (await caches.match(request)) || (await caches.match('/'))
      }
    })())
    return
  }

  if (url.pathname.startsWith('/assets/')) {
    event.respondWith((async () => {
      const cached = await caches.match(request)
      if (cached) return cached
      const response = await fetch(request)
      if (response.ok) await (await caches.open(CACHE_NAME)).put(request, response.clone())
      return response
    })())
  }
})
