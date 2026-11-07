// Render every <section data-out="name"> in an HTML file to <outDir>/<name>.png (1080x1920).
// Sections with data-transparent are saved with a transparent background (logo layers).
// Usage: node render.js <frames.html> <outDir>
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const [html, outDir] = process.argv.slice(2);
  if (!html || !outDir) { console.error('usage: node render.js <frames.html> <outDir>'); process.exit(1); }
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.resolve(html), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  for (const el of await page.$$('section[data-out]')) {
    const name = await el.getAttribute('data-out');
    const transparent = (await el.getAttribute('data-transparent')) !== null;
    if (transparent) await page.evaluate(() => (document.body.style.background = 'transparent'));
    await el.screenshot({ path: path.join(outDir, name + '.png'), omitBackground: transparent });
    if (transparent) await page.evaluate(() => (document.body.style.background = ''));
    console.log('rendered', name);
  }
  await browser.close();
})();
