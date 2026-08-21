const CACHE_NAME = "pension-myriam-v1";
const STATIC_ASSETS = [
  "/",
  "/reservar",
  "/mi-reserva",
  "/admin/cocina",
  "/manifest.json",
  "/icon.png",
  "/images/logo.png",
  "/images/logo-letra-blanca.png",
  "/images/hero-paposo.jpg",
  "/images/comedor.jpg",
  "/images/habitacion.jpg",
  "/images/pasillo.jpg",
  "/images/IMAGENES.JPG",
  "/images/whatsapp-icon-white.png"
];

// Instalar el Service Worker y almacenar recursos esenciales en cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Precaching resources");
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activar el SW y limpiar caches antiguas
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[Service Worker] Clearing old cache");
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptar peticiones de red
self.addEventListener("fetch", (event) => {
  const req = event.request;
  
  // Solo interceptar peticiones de método GET
  if (req.method !== "GET") return;

  // Evitar interceptar llamadas de la API de Supabase o servicios externos que no sean estáticos
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      // Estrategia: Stale-While-Revalidate
      // Retorna el recurso de cache inmediatamente (si existe) y busca la versión fresca en red de fondo.
      const fetchPromise = fetch(req)
        .then((networkResponse) => {
          // Si la respuesta es válida, guardarla en cache
          if (networkResponse && networkResponse.status === 200) {
            const cacheCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, cacheCopy);
            });
          }
          return networkResponse;
        })
        .catch((err) => {
          console.log("[Service Worker] Fetch failed, client is offline:", err);
          // Si falla la red y no hay cache, podemos retornar un fallback offline para navegación de página
          if (req.mode === "navigate") {
            return caches.match("/admin/cocina") || caches.match("/");
          }
        });

      return cachedResponse || fetchPromise;
    })
  );
});
