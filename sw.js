const CACHE_NAME = 'weighing-v2'

const urlsToCache = [
    '/rowing-weighing_online/index.html',
    '/rowing-weighing_online/results.html',
    '/rowing-weighing_online/manifest.json',
    '/rowing-weighing_online/ROW.png'
]

// Установка: кешируем все статические файлы
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    )
    self.skipWaiting()
})

// Запросы: сначала ищем в кеше, если нет — идём в сеть
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) return cachedResponse
            return fetch(event.request).then(response => {
                // Кешируем новые запросы на лету
                if (response && response.status === 200) {
                    const clone = response.clone()
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
                }
                return response
            }).catch(() => {
                // Если сети нет — показываем заглушку
                if (event.request.mode === 'navigate') {
                    return caches.match('/rowing-weighing_online/index.html')
                }
            })
        })
    )
})

// Активация: удаляем старые кеши
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(names => Promise.all(
            names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
        ))
    )
    self.clients.claim()
})