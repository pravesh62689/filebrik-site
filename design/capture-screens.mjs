// F:/filebrik/design/capture-screens.mjs
// Captures full-page screenshots for S1, S2, S3, S4 design exports using Playwright.

import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('F:/shiftandtip/node_modules/playwright');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const exportsDir = path.join(__dirname, 'exports');

async function capture() {
  console.log('Launching Playwright Chrome for design screen captures...');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  const screens = [
    { file: 'S1-home-desktop', width: 1280, height: 800, isMobile: false },
    { file: 'S2-compress-pdf-desktop', width: 1280, height: 800, isMobile: false },
    { file: 'S3-exam-resizer-mobile', width: 390, height: 844, isMobile: true },
    { file: 'S4-privacy-desktop', width: 1280, height: 800, isMobile: false }
  ];

  for (const s of screens) {
    const context = await browser.newContext({
      viewport: { width: s.width, height: s.height },
      isMobile: s.isMobile
    });
    const page = await context.newPage();
    const htmlPath = path.join(exportsDir, `${s.file}.html`);
    const fileUrl = pathToFileURL(htmlPath).href;

    console.log(`Rendering ${s.file} at ${s.width}x${s.height}...`);
    await page.goto(fileUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    // Brief pause to allow fonts and CSS to paint
    await page.waitForTimeout(500);
    const pngPath = path.join(exportsDir, `${s.file}.png`);
    await page.screenshot({ path: pngPath, fullPage: true });
    console.log(`Saved screenshot: ${pngPath}`);
    await context.close();
  }

  await browser.close();
  console.log('All 4 Stitch design export screenshots captured successfully.');
}

capture().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
