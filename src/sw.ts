/// <reference lib="webworker" />

import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute, NavigationRoute, setCatchHandler } from "workbox-routing";
import {
  NetworkFirst,
  StaleWhileRevalidate,
  CacheFirst,
  NetworkOnly,
} from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { BackgroundSyncPlugin } from "workbox-background-sync";
import { clientsClaim } from "workbox-core";

declare const self: ServiceWorkerGlobalScope;

// Take control of open clients immediately once activated
clientsClaim();

// Listen for SKIP_WAITING message from the UI (sent when user clicks "Update Now")
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Precache all build assets (injected by vite-plugin-pwa)
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// ---------------------------------------------------------------------------
// Offline fallback — cache offline.html during install
// ---------------------------------------------------------------------------
const OFFLINE_CACHE = "offline-fallback";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(OFFLINE_CACHE).then((cache) => cache.add(OFFLINE_URL))
  );
});

// ---------------------------------------------------------------------------
// Navigation: App Shell (SPA fallback to index.html)
// ---------------------------------------------------------------------------
const navigationHandler = new NetworkFirst({
  cacheName: "navigations",
  networkTimeoutSeconds: 5,
});

registerRoute(
  new NavigationRoute(navigationHandler, {
    // Don't intercept auth callbacks — they carry hash tokens
    denylist: [/\/auth\/callback/],
  })
);

// Serve offline.html when both network and cache fail for navigations
setCatchHandler(async ({ event }) => {
  if ((event as FetchEvent).request?.destination === "document") {
    const cache = await caches.open(OFFLINE_CACHE);
    const cached = await cache.match(OFFLINE_URL);
    return cached || Response.error();
  }
  return Response.error();
});

// ---------------------------------------------------------------------------
// Auth endpoints — NEVER cache
// ---------------------------------------------------------------------------
const isAuthEndpoint = ({ url }: { url: URL }) =>
  url.pathname.startsWith("/auth/v1") || url.pathname.includes("/auth/");

registerRoute(isAuthEndpoint, new NetworkOnly(), "GET");
registerRoute(isAuthEndpoint, new NetworkOnly(), "POST");

// ---------------------------------------------------------------------------
// Supabase REST API — per-table caching strategies
// ---------------------------------------------------------------------------
const isSupabaseRest = (url: URL) =>
  url.hostname.endsWith(".supabase.co") && url.pathname.includes("/rest/v1/");

// Dynamic data: matches, posts, live stats (NetworkFirst, 30 min)
registerRoute(
  ({ url }) =>
    isSupabaseRest(url) &&
    /\/(matches|match_stats|posts|athlete_matches|performance_metrics|notifications|comments|likes)/.test(
      url.pathname
    ),
  new NetworkFirst({
    cacheName: "supabase-dynamic",
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 30 }),
      new CacheableResponsePlugin({ statuses: [200] }),
    ],
  }),
  "GET"
);

// Semi-static data: profiles, rosters, achievements (StaleWhileRevalidate, 4 hr)
registerRoute(
  ({ url }) =>
    isSupabaseRest(url) &&
    /\/(profiles|athletes|teams|team_members|achievements|user_roles|institutions|parents|parent_athletes|community_groups|merchandise|media_gallery)/.test(
      url.pathname
    ),
  new StaleWhileRevalidate({
    cacheName: "supabase-semi-static",
    plugins: [
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 4 }),
      new CacheableResponsePlugin({ statuses: [200] }),
    ],
  }),
  "GET"
);

// Catch-all for any other Supabase REST GETs
registerRoute(
  ({ url }) => isSupabaseRest(url),
  new NetworkFirst({
    cacheName: "supabase-other",
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 }),
    ],
  }),
  "GET"
);

// Supabase storage: avatars, uploaded media (CacheFirst, 7 days)
registerRoute(
  ({ url }) =>
    url.hostname.endsWith(".supabase.co") &&
    url.pathname.includes("/storage/"),
  new CacheFirst({
    cacheName: "supabase-storage",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 7,
      }),
      new CacheableResponsePlugin({ statuses: [200] }),
    ],
  }),
  "GET"
);

// ---------------------------------------------------------------------------
// Supabase mutations — NetworkOnly with Background Sync fallback
// ---------------------------------------------------------------------------
const bgSyncPlugin = new BackgroundSyncPlugin("supabase-mutations", {
  maxRetentionTime: 24 * 60, // Retry for up to 24 hours
  onSync: async ({ queue }) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        const response = await fetch(entry.request.clone());
        // 4xx = permanent failure — don't re-queue, notify client
        if (response.status >= 400 && response.status < 500) {
          const allClients = await self.clients.matchAll({ type: "window" });
          for (const client of allClients) {
            client.postMessage({
              type: "BACKGROUND_SYNC_FAILED",
              status: response.status,
              url: entry.request.url,
            });
          }
          continue;
        }
        // 5xx = temporary failure — re-queue for retry
        if (!response.ok) {
          await queue.unshiftRequest(entry);
          throw new Error(`Server error ${response.status}`);
        }
      } catch (error) {
        // Network failure — re-queue for retry
        await queue.unshiftRequest(entry);
        throw error;
      }
    }
    // Notify open clients that queued mutations have synced
    const allClients = await self.clients.matchAll({ type: "window" });
    for (const client of allClients) {
      client.postMessage({ type: "BACKGROUND_SYNC_COMPLETE" });
    }
  },
});

const mutationStrategy = new NetworkOnly({ plugins: [bgSyncPlugin] });
const isSupabaseMutation = ({ url }: { url: URL }) =>
  url.hostname.endsWith(".supabase.co") &&
  !url.pathname.startsWith("/auth/");

registerRoute(isSupabaseMutation, mutationStrategy, "POST");
registerRoute(isSupabaseMutation, mutationStrategy, "PATCH");
registerRoute(isSupabaseMutation, mutationStrategy, "DELETE");

// ---------------------------------------------------------------------------
// Google Fonts
// ---------------------------------------------------------------------------
registerRoute(
  ({ url }) => url.origin === "https://fonts.googleapis.com",
  new StaleWhileRevalidate({
    cacheName: "google-fonts-stylesheets",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365,
      }),
    ],
  })
);

registerRoute(
  ({ url }) => url.origin === "https://fonts.gstatic.com",
  new CacheFirst({
    cacheName: "google-fonts-webfonts",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 365,
      }),
      // No CacheableResponsePlugin — font files are cross-origin opaque (status 0)
      // and must be cached as-is for offline support
    ],
  })
);

// ---------------------------------------------------------------------------
// General images (CacheFirst, 30 days)
// ---------------------------------------------------------------------------
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "images",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
      new CacheableResponsePlugin({ statuses: [200] }),
    ],
  })
);

// ---------------------------------------------------------------------------
// Push Notifications (placeholder for future implementation)
// ---------------------------------------------------------------------------
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const title = data.title || "Even Playground";
  const options: NotificationOptions = {
    body: data.body || "",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/favicon-32x32.png",
    data: { url: data.url || "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(self.clients.openWindow(url));
});
