const crypto = require('crypto');

const VERCEL_URL = 'https://even-play.vercel.app';
const HOSTINGER_URL = 'https://evenplayground.com';

async function fetchHtml(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 AuditBot/1.0' } });
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return await res.text();
}

async function fetchAssetBuffer(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 AuditBot/1.0' } });
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function extractAssets(html) {
  const jsMatch = html.match(/<script[^>]+src="([^">]+)"/g);
  const cssMatch = html.match(/<link[^>]+rel="stylesheet"[^>]+href="([^">]+)"/g);
  
  const extractSrc = (str) => {
    const match = str.match(/(?:src|href)="([^">]+)"/);
    return match ? match[1] : null;
  };

  return {
    js: jsMatch ? jsMatch.map(extractSrc) : [],
    css: cssMatch ? cssMatch.map(extractSrc) : []
  };
}

async function getAssetHash(url) {
  try {
    const buffer = await fetchAssetBuffer(url);
    return crypto.createHash('sha256').update(buffer).digest('hex');
  } catch (err) {
    return `Error fetching ${url}: ${err.message}`;
  }
}

async function main() {
  try {
    console.log("Fetching Vercel...");
    const vercelHtml = await fetchHtml(VERCEL_URL);
    
    console.log("Fetching Hostinger...");
    const hostingerHtml = await fetchHtml(HOSTINGER_URL);

    const vercelAssets = extractAssets(vercelHtml);
    const hostingerAssets = extractAssets(hostingerHtml);

    console.log("\n--- Vercel Assets ---");
    console.log("JS:", vercelAssets.js);
    console.log("CSS:", vercelAssets.css);

    console.log("\n--- Hostinger Assets ---");
    console.log("JS:", hostingerAssets.js);
    console.log("CSS:", hostingerAssets.css);

    const vJsUrl = vercelAssets.js[0] ? new URL(vercelAssets.js[0], VERCEL_URL).href : null;
    const hJsUrl = hostingerAssets.js[0] ? new URL(hostingerAssets.js[0], HOSTINGER_URL).href : null;

    if (vJsUrl && hJsUrl) {
      console.log(`\nHashing Vercel JS: ${vJsUrl}`);
      const vHash = await getAssetHash(vJsUrl);
      console.log(`Hashing Hostinger JS: ${hJsUrl}`);
      const hHash = await getAssetHash(hJsUrl);

      console.log(`\nVercel SHA256:    ${vHash}`);
      console.log(`Hostinger SHA256: ${hHash}`);
      console.log(`Match? ${vHash === hHash ? '✅ YES' : '❌ NO'}`);
    }

    const vCssUrl = vercelAssets.css[0] ? new URL(vercelAssets.css[0], VERCEL_URL).href : null;
    const hCssUrl = hostingerAssets.css[0] ? new URL(hostingerAssets.css[0], HOSTINGER_URL).href : null;

    if (vCssUrl && hCssUrl) {
      console.log(`\nHashing Vercel CSS: ${vCssUrl}`);
      const vCssHash = await getAssetHash(vCssUrl);
      console.log(`Hashing Hostinger CSS: ${hCssUrl}`);
      const hCssHash = await getAssetHash(hCssUrl);

      console.log(`\nVercel CSS SHA256:    ${vCssHash}`);
      console.log(`Hostinger CSS SHA256: ${hCssHash}`);
      console.log(`Match? ${vCssHash === hCssHash ? '✅ YES' : '❌ NO'}`);
    }
  } catch (err) {
    console.error("Critical Error:", err.message);
  }
}

main();
