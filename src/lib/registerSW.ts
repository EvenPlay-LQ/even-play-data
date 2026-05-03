import { requestPersistentStorage } from "./storagePersistence";

export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  try {
    const isProd = import.meta.env.MODE === "production";
    const swUrl = isProd ? "/sw.js" : "/dev-sw.js?dev-sw";
    const swType = isProd ? "classic" : ("module" as const);

    console.log(`[PWA] Registering service worker: ${swUrl}`);

    const registration = await navigator.serviceWorker.register(swUrl, {
      type: swType,
      scope: "/",
    });

    console.log(`[PWA] Service worker registered (scope: ${registration.scope})`);

    // Check for updates every 60 minutes
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000);

    // Listen for new service worker activation
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener("statechange", () => {
        if (
          newWorker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          // New SW is waiting — prompt user to update
          window.dispatchEvent(new CustomEvent("sw-updated"));
        }
      });
    });

    // Listen for background sync messages from the SW
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data?.type === "BACKGROUND_SYNC_COMPLETE") {
        if (import.meta.env.DEV) {
          console.log("[PWA] Background sync completed — mutations replayed");
        }
        window.dispatchEvent(new CustomEvent("mutation-queue-changed"));
      }
      if (event.data?.type === "BACKGROUND_SYNC_FAILED") {
        window.dispatchEvent(
          new CustomEvent("mutation-sync-failed", {
            detail: { status: event.data.status, url: event.data.url },
          })
        );
      }
    });

    // Request persistent storage so caches aren't evicted
    requestPersistentStorage();
  } catch (error) {
    // Always log SW errors — critical for debugging production issues on Hostinger
    console.error("[PWA] Service worker registration failed:", error);
  }
}
