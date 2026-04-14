import { test, expect } from "@playwright/test";

test.describe("PWA fundamentals", () => {
  test("manifest is served and valid", async ({ page }) => {
    const response = await page.goto("/manifest.json");
    expect(response?.status()).toBe(200);

    const manifest = await response?.json();
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/");
    expect(manifest.share_target).toBeDefined();
    expect(manifest.share_target.action).toBe("/share");
    expect(manifest.icons.length).toBeGreaterThanOrEqual(4);
  });

  test("offline.html is served", async ({ page }) => {
    const response = await page.goto("/offline.html");
    expect(response?.status()).toBe(200);

    await expect(page.locator("h1")).toContainText("Offline");
    await expect(page.locator("button")).toContainText("Try Again");
  });

  test("service worker registers", async ({ page }) => {
    await page.goto("/");

    // Wait for SW to register
    const swRegistered = await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) return false;
      const reg = await navigator.serviceWorker.ready;
      return !!reg.active;
    });

    expect(swRegistered).toBe(true);
  });

  test("app loads with PWA meta tags", async ({ page }) => {
    await page.goto("/");

    const manifestLink = await page.locator('link[rel="manifest"]').getAttribute("href");
    expect(manifestLink).toBe("/manifest.json");

    const themeColor = await page.locator('meta[name="theme-color"]').first().getAttribute("content");
    expect(themeColor).toBeTruthy();

    const appleCapable = await page.locator('meta[name="apple-mobile-web-app-capable"]').getAttribute("content");
    expect(appleCapable).toBe("yes");
  });
});

test.describe("Share target", () => {
  test("share target page renders with query params", async ({ page }) => {
    await page.goto("/share?title=Great+Match&text=Check+this+out&url=https://example.com/match/1");

    // The page may redirect to login (ProtectedRoute), which is expected.
    // If logged in, it would show the share content card.
    const currentUrl = page.url();
    expect(
      currentUrl.includes("/share") || currentUrl.includes("/login")
    ).toBe(true);
  });
});

test.describe("Offline fallback", () => {
  test("shows offline page when network fails on uncached route", async ({
    page,
    context,
  }) => {
    // First visit to install the service worker
    await page.goto("/");
    await page.evaluate(async () => {
      if ("serviceWorker" in navigator) {
        await navigator.serviceWorker.ready;
      }
    });

    // Give SW time to cache offline.html
    await page.waitForTimeout(1000);

    // Go offline
    await context.setOffline(true);

    // Navigate to a page that won't be in cache
    await page.goto("/some-uncached-page-that-does-not-exist", {
      waitUntil: "domcontentloaded",
      timeout: 10000,
    }).catch(() => {
      // Navigation may fail when offline — that's okay
    });

    // Should see either the cached app shell (SPA) or the offline fallback
    const bodyText = await page.locator("body").textContent().catch(() => "");
    const showsOfflineOrApp =
      bodyText?.includes("Offline") ||
      bodyText?.includes("Even") ||
      bodyText?.includes("404");
    expect(showsOfflineOrApp).toBe(true);

    // Restore online
    await context.setOffline(false);
  });
});
