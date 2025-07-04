/*
 * Generate PWA icon set from logo.svg
 * Usage: npx ts-node tools/generate-icons.js (after installing sharp)
 */

import sharp from 'sharp';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const sourceSvg = resolve(__dirname, '../public/assets/img/logo/logo.svg');
const targetDir = resolve(__dirname, '../public/icons');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

(async () => {
  for (const size of sizes) {
    // ---- create white background (maskable) default icon ----
    const inner = Math.round(size * 0.8);
    const pad = Math.round((size - inner) / 2);
    const logoWhite = await sharp(sourceSvg)
      .resize(inner, inner, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .flatten({ background: '#ffffff' })
      .png({ compressionLevel: 9 })
      .toBuffer();

    await sharp({ create: { width: size, height: size, channels: 4, background: '#ffffff' } })
      .composite([{ input: logoWhite, left: pad, top: pad }])
      .png({ compressionLevel: 9 })
      .toFile(join(targetDir, `icon-${size}x${size}-v3.png`));

    // ---- create transparent (any) icon with padding ----
    const logoTransparent = await sharp(sourceSvg)
      .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toBuffer();

    await sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: logoTransparent, left: pad, top: pad }])
      .png({ compressionLevel: 9 })
      .toFile(join(targetDir, `icon-${size}x${size}.png`));

    console.log('Created set for size', size);
  }
  console.log('✔ All icons (white + transparent) generated');
})(); 