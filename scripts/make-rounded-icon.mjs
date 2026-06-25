import sharp from 'sharp';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputPath  = path.resolve(__dirname, '../public/logo2.png');
const outputPath = path.resolve(__dirname, '../public/logo2-rounded.png');

// 1. Get image metadata to know the actual dimensions
const meta = await sharp(inputPath).metadata();
const w = meta.width;
const h = meta.height;

// 2. Compute radius = 35% of the shorter dimension
const radius = Math.round(Math.min(w, h) * 0.35);

// 3. Build an SVG rounded-rect mask matching the image size
const mask = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
     <rect width="${w}" height="${h}" rx="${radius}" ry="${radius}" fill="white"/>
   </svg>`
);

// 4. Composite: use the SVG mask as the alpha channel
await sharp(inputPath)
  .png()                          // ensure RGBA output
  .composite([{ input: mask, blend: 'dest-in' }])
  .toFile(outputPath);

console.log(`✅  Saved rounded icon → ${outputPath}`);
console.log(`   Size: ${w}x${h}  |  Radius: ${radius}px  (35% of shorter side)`);
