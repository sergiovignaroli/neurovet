// sw.js — NeuroVet Service Worker
// Colocar en la raíz del dominio GitHub Pages (mismo nivel que index.html)
// Versión 1.1

var CACHE_NAME = 'neurovet-v1';

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(clients.claim());
});

// ── Push notification recibida ──────────────────────────────────
self.addEventListener('push', function(e) {
  var data = {};
  try {
    data = e.data ? e.data.json() : {};
  } catch(err) {
    data = { body: e.data ? e.data.text() : 'Nueva notificación' };
  }

  var title = data.title || '🚨 NeuroVet — Nueva crisis';
  var options = {
    body:             data.body || 'Un tutor registró una nueva crisis',
    icon:             '/icon-192.png',
    badge:            '/icon-72.png',
    tag:              data.tag  || 'nv-crisis',
    renotify:         true,
    requireInteraction: true,
    vibrate:          [200, 100, 200, 100, 200],
    data: {
      url:           data.url  || '/',
      paciente:      data.paciente || ''
    },
    actions: [
      { action: 'open',    title: '👁️ Ver en NeuroVet' },
      { action: 'dismiss', title: 'Cerrar' }
    ]
  };

  e.waitUntil(self.registration.showNotification(title, options));
});

// ── Click en la notificación ────────────────────────────────────
self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  if (e.action === 'dismiss') return;

  var targetUrl = (e.notification.data && e.notification.data.url) || '/';

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(wins) {
      // Si NeuroVet ya está abierto, enfocarlo
      for (var i = 0; i < wins.length; i++) {
        var w = wins[i];
        if ('focus' in w) {
          w.focus();
          // Mandar mensaje al cliente para abrir el panel de crisis
          w.postMessage({ type: 'OPEN_CRISIS_PANEL', paciente: e.notification.data.paciente || '' });
          return;
        }
      }
      // Si no está abierto, abrir la app
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
