const https = require('https');
const crypto = require('crypto');

const VERCEL_URL = 'https://even-play.vercel.app';
const HOSTINGER_URL = 'https://evenplayground.com';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      // Follow redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        return resolve(fetchUrl(res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, url).href));
      }
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ data, headers: res.headers, statusCode: res.statusCode }));
    }).on('error', reject);
  });
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
    const { data } = await fetchUrl(url);
    return crypto.createHash('sha256').update(data).digest('hex');
  } catch (err) {
    return `Error fetching ${url}: ${err.message}`;
  }
}

async function main() {
  console.log("Fetching Vercel...");
  const vercel = await fetchUrl(VERCEL_URL);
  
  console.log("Fetching Hostinger...");
  const hostinger = await fetchUrl(HOSTINGER_URL);

  const vercelAssets = extractAssets(vercel.data);
  const hostingerAssets = extractAssets(hostinger.data);

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
}

main();
