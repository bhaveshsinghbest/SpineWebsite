// Visual regression: screenshots each page on the original site (OLD_URL) and the new site (SITE_URL) and diffs them.
// Usage: node tests/visual-regression.cjs <width> <path...>   e.g. node tests/visual-regression.cjs 1440 / /about/ /careers/
// Writes <name>-old/new/diff.png to tests/output/visual/<width>/ and prints the height and pixel difference per page.
const pw = require('playwright');
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

const OLD = process.env.OLD_URL || 'http://localhost:4329';
const NEW = process.env.SITE_URL || 'http://localhost:4200';
const [w, ...paths] = process.argv.slice(2);
const width = Number(w);
const out = path.join(__dirname, 'output', 'visual', String(width));
fs.mkdirSync(out, { recursive: true });

async function shot(page, url, file) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  const buf = await page.screenshot({ fullPage: true, animations: 'disabled' });
  fs.writeFileSync(file, buf);
  return PNG.sync.read(buf);
}

(async () => {
  const browser = await pw.chromium.launch();
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  for (const p of paths) {
    const name = p === '/' ? 'home' : p.replace(/^\/|\/$/g, '').replace(/\//g, '_');
    const a = await shot(page, OLD + p, path.join(out, `${name}-old.png`));
    const b = await shot(page, NEW + p, path.join(out, `${name}-new.png`));
    const W = Math.max(a.width, b.width), H = Math.max(a.height, b.height);
    const pad = (img) => { const o = new PNG({ width: W, height: H }); o.data.fill(255); PNG.bitblt(img, o, 0, 0, img.width, img.height, 0, 0); return o; };
    const A = pad(a), B = pad(b), D = new PNG({ width: W, height: H });
    const diff = pixelmatch(A.data, B.data, D.data, W, H, { threshold: 0.15 });
    fs.writeFileSync(path.join(out, `${name}-diff.png`), PNG.sync.write(D));
    console.log(`${p.padEnd(42)} old ${a.height}px  new ${b.height}px  diff ${(100 * diff / (W * H)).toFixed(2)}%`);
  }
  await browser.close();
})();
