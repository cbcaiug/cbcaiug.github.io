/**
 * Service Worker for CBC AI Tool
 * Minimal implementation to enable PWA installation
 */

const CACHE_NAME = 'cbc-ai-v1';

// Install event - cache essential files
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activated');
    event.waitUntil(clients.claim());
});

// Fetch event - network first, fall back to cache
self.addEventListener('fetch', (event) => {
    // For now, just let requests pass through (network-first)
    event.respondWith(fetch(event.request));
});
