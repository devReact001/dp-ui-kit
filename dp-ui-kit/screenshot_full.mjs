import { chromium } from '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
import path from 'node:path';

const shots = JSON.parse(process.argv[4] || '[]');
const base = process.argv[2] || 'http://localhost:6010';
const outDir = process.argv[3] || '.';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

for (const shot of shots) {
  const url = `${base}/?path=${encodeURIComponent(shot.path)}`;
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  const outPath = path.join(outDir, shot.file);
  await page.screenshot({ path: outPath });
  console.log('saved', outPath);
}

await browser.close();
