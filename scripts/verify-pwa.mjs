import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, "../dist");
const PUBLIC = path.resolve(__dirname, "../public");
let errors = 0;

function check(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ ${message}`);
    errors++;
  }
}

console.log("\n🔍 PWA Build Verification\n");

// 1. Manifest
console.log("Manifest:");
const manifestPath = path.join(DIST, "manifest.json");
const manifestExists = fs.existsSync(manifestPath);
check(manifestExists, "manifest.json exists in dist/");

if (manifestExists) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  check(manifest.name, `name: "${manifest.name}"`);
  check(manifest.short_name, `short_name: "${manifest.short_name}"`);
  check(manifest.start_url, `start_url: "${manifest.start_url}"`);
  check(manifest.display === "standalone", `display: standalone`);
  check(
    manifest.icons && manifest.icons.length >= 4,
    `${manifest.icons?.length || 0} icons defined`
  );

  const hasMaskable = manifest.icons?.some((i) => i.purpose === "maskable");
  const hasAny = manifest.icons?.some((i) => i.purpose === "any");
  check(hasMaskable, "Has maskable icon");
  check(hasAny, "Has standard (any) icon");

  const combined = manifest.icons?.some(
    (i) => i.purpose === "any maskable"
  );
  check(!combined, 'No combined "any maskable" icons (best practice)');

  check(manifest.share_target, "share_target defined");
  check(
    manifest.share_target?.action === "/share",
    `share_target action: "${manifest.share_target?.action}"`
  );
}

// 2. Icons
console.log("\nIcons:");
const requiredIcons = [
  "icon-192x192.png",
  "icon-512x512.png",
  "icon-maskable-192x192.png",
  "icon-maskable-512x512.png",
  "apple-touch-icon-180x180.png",
  "favicon-32x32.png",
  "favicon-16x16.png",
];
for (const icon of requiredIcons) {
  check(
    fs.existsSync(path.join(DIST, "icons", icon)),
    `icons/${icon} exists`
  );
}

// 3. Offline fallback
console.log("\nOffline Fallback:");
check(
  fs.existsSync(path.join(DIST, "offline.html")),
  "offline.html exists in dist/"
);

// 4. Service Worker
console.log("\nService Worker:");
check(fs.existsSync(path.join(DIST, "sw.js")), "sw.js exists in dist/");

if (fs.existsSync(path.join(DIST, "sw.js"))) {
  const sw = fs.readFileSync(path.join(DIST, "sw.js"), "utf-8");
  check(sw.includes("precache") || sw.includes("__WB_MANIFEST"), "Contains precache logic");
  check(sw.includes("supabase-semi-static"), "Contains Supabase caching strategies");
  check(
    sw.includes("supabase-dynamic"),
    "Contains dynamic cache for Supabase"
  );
  check(!sw.includes("/auth/v1/token"), "No auth token URLs in precache");
  check(
    sw.includes("offline-fallback") || sw.includes("offline.html"),
    "Contains offline fallback handler"
  );
  check(
    sw.includes("supabase-mutations") || sw.includes("BackgroundSync"),
    "Contains BackgroundSync for mutations"
  );
}

// 4. index.html meta tags
console.log("\nHTML Meta Tags:");
const indexPath = path.join(DIST, "index.html");
if (fs.existsSync(indexPath)) {
  const html = fs.readFileSync(indexPath, "utf-8");
  check(html.includes('rel="manifest"'), "Manifest link present");
  check(html.includes('name="theme-color"'), "theme-color meta present");
  check(
    html.includes("apple-mobile-web-app-capable"),
    "iOS web app meta present"
  );
  check(html.includes("apple-touch-icon"), "Apple touch icon link present");
}

// Summary
console.log(
  `\n${errors === 0 ? "✅ All checks passed!" : `❌ ${errors} check(s) failed!`}\n`
);
process.exit(errors > 0 ? 1 : 0);
