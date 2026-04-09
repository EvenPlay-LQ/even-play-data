import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE = path.resolve(__dirname, '../public/favicon.jpg');
const OUT_DIR = path.resolve(__dirname, '../public/icons');
const NAVY_BG = '#131c2e';

const icons = [
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'apple-touch-icon-180x180.png', size: 180 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-16x16.png', size: 16 },
];

const maskableIcons = [
  { name: 'icon-maskable-192x192.png', size: 192 },
  { name: 'icon-maskable-512x512.png', size: 512 },
];

async function generateStandardIcons() {
  for (const { name, size } of icons) {
    await sharp(SOURCE)
      .resize(size, size, { fit: 'contain', background: NAVY_BG })
      .png()
      .toFile(path.join(OUT_DIR, name));
    console.log(`✓ ${name}`);
  }
}

async function generateMaskableIcons() {
  for (const { name, size } of maskableIcons) {
    // Maskable icons: logo in central 80% safe zone with navy background
    const logoSize = Math.round(size * 0.7);
    const padding = Math.round((size - logoSize) / 2);

    const resizedLogo = await sharp(SOURCE)
      .resize(logoSize, logoSize, { fit: 'contain', background: NAVY_BG })
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: NAVY_BG,
      },
    })
      .composite([{ input: resizedLogo, top: padding, left: padding }])
      .png()
      .toFile(path.join(OUT_DIR, name));
    console.log(`✓ ${name} (maskable)`);
  }
}

async function main() {
  console.log('Generating PWA icons from', SOURCE);
  console.log('Output directory:', OUT_DIR);
  console.log('');
  await generateStandardIcons();
  await generateMaskableIcons();
  console.log('\nDone! Generated', icons.length + maskableIcons.length, 'icons.');
}

main().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
