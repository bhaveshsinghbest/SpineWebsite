// Accessibility scan (axe-core, WCAG 2.1 A/AA rules) of every public page.
// With OLD_URL set, the original site is scanned too, so new issues can be told apart from inherited ones.
// Usage: node tests/a11y.cjs            (pages from tests/pages.txt)
const pw = require('playwright');
const fs = require('fs');
const path = require('path');
const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const NEW = process.env.SITE_URL || 'http://localhost:4200';
const OLD = process.env.OLD_URL || '';
const pages = fs.readFileSync(path.join(__dirname, 'pages.txt'), 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);

async function scan(page, url) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.addScriptTag({ content: axeSource });
  return page.evaluate(async () => {
    const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help }));
  });
}

(async () => {
  const browser = await pw.chromium.launch();
  // Reduced motion: no scroll-reveal fades, so text is measured at full opacity.
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  const totals = { new: new Map(), old: new Map() };
  for (const p of pages) {
    const n = await scan(page, NEW + p);
    for (const v of n) totals.new.set(v.id, { ...v, pages: (totals.new.get(v.id)?.pages ?? 0) + 1, nodes: (totals.new.get(v.id)?.nodes ?? 0) + v.nodes });
    if (OLD) {
      const o = await scan(page, OLD + p);
      for (const v of o) totals.old.set(v.id, { ...v, pages: (totals.old.get(v.id)?.pages ?? 0) + 1, nodes: (totals.old.get(v.id)?.nodes ?? 0) + v.nodes });
    }
  }
  await browser.close();
  const print = (label, m) => {
    console.log(`\n${label}: ${m.size} rule(s) violated`);
    for (const v of m.values()) console.log(`  [${v.impact}] ${v.id} — ${v.help} (${v.nodes} elements on ${v.pages} pages)`);
  };
  print(`New site (${pages.length} pages)`, totals.new);
  if (OLD) print('Original site', totals.old);
  const introduced = [...totals.new.keys()].filter((k) => !totals.old.has(k));
  if (OLD) console.log(`\nIntroduced by the migration: ${introduced.length ? introduced.join(', ') : 'none'}`);
  process.exit(OLD ? (introduced.length ? 1 : 0) : (totals.new.size ? 1 : 0));
})();
