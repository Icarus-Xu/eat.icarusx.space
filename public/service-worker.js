// Copyright (C) 2026 Icarus. All rights reserved.
// Minimal Service Worker - satisfies PWA installability requirements.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (event) => event.respondWith(fetch(event.request)));
