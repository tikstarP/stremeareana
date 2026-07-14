import sharp from 'sharp';
import { readFileSync, mkdirSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const svg = readFileSync(join(publicDir, 'icon.svg'), 'utf-8');

const sizes = [192, 512];

mkdirSync(join(publicDir, 'icons'), { recursive: true });

for (const size of sizes) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(join(publicDir, 'icons', `icon-${size}.png`));
  console.log(`Generated ${size}x${size} PNG`);
}

copyFileSync(join(publicDir, 'icon.svg'), join(publicDir, 'icons', 'icon.svg'));
console.log('Copied SVG icon');
