/* Service worker: la aplicación funciona sin conexión una vez instalada.
   - Núcleo (HTML, CSS, JS, datos, iconos): se guarda al instalar y se actualiza en segundo plano.
   - Imágenes: se guardan al verlas (o todas a la vez desde Ajustes → Aplicación).
   - Tipografías de Google Fonts: se guardan al primer uso. */
const VERSION = 'lv-pub-mw74i77z';
const NUCLEO = `${VERSION}-nucleo`;
const MEDIA = 'lv-media-v1';
const ARCHIVOS = [
  './', 'index.html', 'manifest.webmanifest', 'css/app.css', 'css/v2.css',
  'data/preguntas.js', 'js/iconos.js', 'js/motor.js', 'js/aprender.js', 'js/lecciones.js', 'js/video.js', 'js/app.js',
  'img/app/icono-192.png', 'img/app/icono-512.png', 'img/app/icono-180.png',
  ...['r1', 'r2', 'r101', 'r301-50', 'r305', 'r307', 'r308', 'r402', 's13', 'p20'].map(s => `img/senales/${s}.svg`)
];

// La página pide activar la versión nueva cuando el usuario pulsa «Actualizar».
self.addEventListener('message', e => { if (e.data === 'activar') self.skipWaiting(); });

self.addEventListener('install', e => {
  e.waitUntil(caches.open(NUCLEO).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.endsWith('-nucleo') && k !== NUCLEO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Fuentes: primero caché.
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) { e.respondWith(primeroCache(req, MEDIA)); return; }
  if (url.origin !== location.origin) return;
  // Imágenes: primero caché (no cambian).
  if (/\/img\//.test(url.pathname)) { e.respondWith(primeroCache(req, MEDIA)); return; }
  // Navegación y núcleo: red con respaldo en caché, para recibir actualizaciones cuando hay conexión.
  e.respondWith(
    fetch(req, { cache: 'no-cache' }).then(r => { if (r.ok) { const copia = r.clone(); caches.open(NUCLEO).then(c => c.put(req.mode === 'navigate' ? 'index.html' : req, copia)); } return r; })
      .catch(() => caches.match(req.mode === 'navigate' ? 'index.html' : req, { ignoreSearch: true }).then(r => r || caches.match(req)))
  );
});

function primeroCache(req, nombre) {
  return caches.match(req).then(r => r || fetch(req).then(res => {
    if (res.ok || res.type === 'opaque') { const copia = res.clone(); caches.open(nombre).then(c => c.put(req, copia)); }
    return res;
  }));
}
