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
    const output = join(targetDir, `icon-${size}x${size}.png`);
    await sharp(sourceSvg)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toFile(output);
    console.log('Created', output);
  }
  console.log('✔ All icons generated successfully');
})(); 