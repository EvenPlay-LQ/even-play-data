import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const ROOT = path.resolve(__dirname, "../..");

describe("PWA build artifacts", () => {
  it("offline.html exists in public/", () => {
    expect(fs.existsSync(path.join(ROOT, "public/offline.html"))).toBe(true);
  });

  it("offline.html is self-contained (no external CSS/JS)", () => {
    const html = fs.readFileSync(
      path.join(ROOT, "public/offline.html"),
      "utf-8"
    );
    expect(html).toContain("<style>");
    expect(html).not.toMatch(/<link[^>]+rel="stylesheet"/);
    expect(html).not.toMatch(/<script[^>]+src="/);
    expect(html).toContain("You're Offline");
    expect(html).toContain("window.location.reload()");
  });

  it("offline.html auto-reloads on reconnection", () => {
    const html = fs.readFileSync(
      path.join(ROOT, "public/offline.html"),
      "utf-8"
    );
    expect(html).toContain('"online"');
  });

  it("sw.ts references offline fallback", () => {
    const sw = fs.readFileSync(path.join(ROOT, "src/sw.ts"), "utf-8");
    expect(sw).toContain("offline-fallback");
    expect(sw).toContain("offline.html");
    expect(sw).toContain("setCatchHandler");
  });

  it("sw.ts includes BackgroundSyncPlugin for mutations", () => {
    const sw = fs.readFileSync(path.join(ROOT, "src/sw.ts"), "utf-8");
    expect(sw).toContain("BackgroundSyncPlugin");
    expect(sw).toContain("supabase-mutations");
  });

  it("sw.ts does not cache opaque responses (status 0)", () => {
    const sw = fs.readFileSync(path.join(ROOT, "src/sw.ts"), "utf-8");
    expect(sw).not.toContain("statuses: [0, 200]");
  });

  it("dead code files are removed", () => {
    expect(fs.existsSync(path.join(ROOT, "src/pages/OfflineFallback.tsx"))).toBe(false);
    expect(fs.existsSync(path.join(ROOT, "src/lib/offlineAwareQuery.ts"))).toBe(false);
  });

  it("manifest.json includes share_target", () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(ROOT, "public/manifest.json"), "utf-8")
    );
    expect(manifest.share_target).toBeDefined();
    expect(manifest.share_target.action).toBe("/share");
    expect(manifest.share_target.params).toHaveProperty("url");
    expect(manifest.share_target.params).toHaveProperty("title");
    expect(manifest.share_target.params).toHaveProperty("text");
  });

  it("manifest.json has required PWA fields", () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(ROOT, "public/manifest.json"), "utf-8")
    );
    expect(manifest.name).toBeDefined();
    expect(manifest.short_name).toBeDefined();
    expect(manifest.start_url).toBe("/");
    expect(manifest.display).toBe("standalone");
    expect(manifest.icons.length).toBeGreaterThanOrEqual(4);
    expect(manifest.icons.some((i: any) => i.purpose === "maskable")).toBe(true);
  });
});
