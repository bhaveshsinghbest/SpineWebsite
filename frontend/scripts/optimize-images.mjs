// Generates responsive WebP banners (and a JPG for social sharing) from src/assets-src/banners/*.jpg
// into public/assets/banners/. Run after adding or replacing a banner: npm run images
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'src/assets-src/banners';
const OUT = 'public/assets/banners';
const WIDTHS = [480, 720, 1024, 1408];

await fs.mkdir(OUT, { recursive: true });
for (const file of (await fs.readdir(SRC)).filter((f) => f.endsWith('.jpg'))) {
  const key = file.replace(/\.jpg$/, '');
  const input = path.join(SRC, file);
  for (const w of WIDTHS) {
    await sharp(input).resize({ width: w, withoutEnlargement: true }).webp({ quality: 78 }).toFile(path.join(OUT, `${key}-${w}.webp`));
  }
  await sharp(input).resize({ width: 1200 }).jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(OUT, `${key}-og.jpg`));
  console.log(`banner ${key}: ${WIDTHS.length} WebP sizes + OG JPG`);
}
