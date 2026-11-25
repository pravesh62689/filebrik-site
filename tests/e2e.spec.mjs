// FileBrik Playwright Browser QA e2e suite
import { test, expect } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';

const ALL_ROUTES = [
  '/',
  '/privacy/',
  '/terms/',
  '/contact/',
  '/tools/compress-pdf/',
  '/tools/merge-pdf/',
  '/tools/split-pdf/',
  '/tools/jpg-to-pdf/',
  '/tools/pdf-to-jpg/',
  '/tools/exam-photo-signature-resizer/',
  '/tools/compress-image-kb/',
  '/tools/image-converter/',
  '/tools/passport-photo-maker/',
  '/tools/audio-trimmer/',
];

// 1. Every route returns 200 with zero console/page errors or failed static requests
for (const route of ALL_ROUTES) {
  test(`Route ${route} -> 200, 0 console errors`, async ({ page }) => {
    const errors = [];
    const badResponses = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('response', (res) => {
      if (res.status() >= 400 && !res.url().includes('sw.js')) {
        badResponses.push(`${res.status()} ${res.url()}`);
      }
    });

    const res = await page.goto(route, { waitUntil: 'networkidle' });
    expect(res.status()).toBe(200);
    expect(badResponses, `HTTP errors on ${route}: ${badResponses.join(', ')}`).toHaveLength(0);
    expect(errors, `Console/page errors on ${route}: ${errors.join(', ')}`).toHaveLength(0);
  });
}

// 2. /sw.js and /ads.txt return 200
test('/sw.js and /ads.txt return 200', async ({ request }) => {
  const sw = await request.get('/sw.js');
  expect(sw.status()).toBe(200);
  const ads = await request.get('/ads.txt');
  expect(ads.status()).toBe(200);
});

// 3. No horizontal overflow at 390px across all routes + video slider never loads at 390px + mobile ad height < 25%
test('Mobile 390px: zero overflow, ad height < 25%, desktop video slider inactive', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();

  for (const route of ALL_ROUTES) {
    await page.goto(route, { waitUntil: 'networkidle' });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > 390);
    expect(overflow, `${route} overflows horizontally at 390px`).toBe(false);

    const adPct = await page.evaluate(() => {
      const els = document.querySelectorAll('[data-ad-slot], .ad-container');
      let h = 0;
      els.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.height > 0) h += rect.height;
      });
      return (h / window.innerHeight) * 100;
    });
    expect(adPct, `Mobile ad height on ${route} is ${adPct.toFixed(1)}%`).toBeLessThan(25);

    const sliderLoaded = await page.evaluate(() => {
      const slider = document.getElementById('fb-desktop-slider');
      const scripts = Array.from(document.querySelectorAll('script')).some((s) => /hilltop/i.test(s.src || ''));
      const rect = slider ? slider.getBoundingClientRect() : null;
      const visible = Boolean(slider && !slider.hasAttribute('hidden') && rect && rect.height > 0);
      return scripts || visible;
    });
    expect(sliderLoaded, `Desktop video slider must never load at 390px (${route})`).toBe(false);
  }

  await ctx.close();
});

// 4. Functional Tool Test: Merge PDF combines 2 PDFs into 2 pages
test('Tool e2e: merge-pdf combines 2 PDFs', async ({ page }) => {
  const doc1 = await PDFDocument.create();
  doc1.addPage([200, 200]);
  const doc2 = await PDFDocument.create();
  doc2.addPage([200, 200]);
  const buf1 = Buffer.from(await doc1.save());
  const buf2 = Buffer.from(await doc2.save());

  await page.goto('/tools/merge-pdf/', { waitUntil: 'networkidle' });
  await page.setInputFiles('#pdfInput', [
    { name: 'a.pdf', mimeType: 'application/pdf', buffer: buf1 },
    { name: 'b.pdf', mimeType: 'application/pdf', buffer: buf2 },
  ]);

  await page.click('#mergeBtn');
  await expect(page.locator('#resultBox')).toBeVisible({ timeout: 10000 });
  const pagesAttr = await page.locator('#downloadBtn').getAttribute('data-pages');
  expect(pagesAttr).toBe('2');

  const mergedBytes = await page.evaluate(async () => {
    const href = document.getElementById('downloadBtn').getAttribute('href');
    const resp = await fetch(href);
    return Array.from(new Uint8Array(await resp.arrayBuffer()));
  });
  const mergedPdf = await PDFDocument.load(new Uint8Array(mergedBytes));
  expect(mergedPdf.getPageCount()).toBe(2);
});

// 5. Functional Tool Test: Compress-to-KB outputs inside requested range [20, 50] KB
test('Tool e2e: compress-image-kb compresses inside target KB range', async ({ page }) => {
  await page.goto('/tools/compress-image-kb/', { waitUntil: 'networkidle' });

  // Synthesize a high-entropy 900x900 PNG inside Chromium so it exceeds 50 KB before compression
  const pngBytes = await page.evaluate(async () => {
    const c = document.createElement('canvas');
    c.width = 900;
    c.height = 900;
    const ctx = c.getContext('2d');
    const imgData = ctx.createImageData(900, 900);
    for (let i = 0; i < imgData.data.length; i += 4) {
      imgData.data[i] = (i * 13) % 255;
      imgData.data[i + 1] = (i * 29) % 255;
      imgData.data[i + 2] = (i * 53) % 255;
      imgData.data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
    const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
    return Array.from(new Uint8Array(await blob.arrayBuffer()));
  });

  await page.fill('#minKbInput', '20');
  await page.fill('#maxKbInput', '50');
  await page.setInputFiles('#fileInput', {
    name: 'large-photo.png',
    mimeType: 'image/png',
    buffer: Buffer.from(pngBytes),
  });
  await page.click('#actionBtn');
  await expect(page.locator('#resultBox')).toBeVisible({ timeout: 15000 });

  const outLen = await page.evaluate(async () => {
    const href = document.getElementById('downloadBtn').getAttribute('href');
    const resp = await fetch(href);
    const ab = await resp.arrayBuffer();
    return ab.byteLength;
  });
  const outKb = outLen / 1024;
  expect(outKb).toBeGreaterThanOrEqual(20);
  expect(outKb).toBeLessThanOrEqual(50);
});

// 6. Functional Tool Test: WebP Conversion produces valid RIFF WEBP binary
test('Tool e2e: image-converter converts PNG to WebP', async ({ page }) => {
  await page.goto('/tools/image-converter/', { waitUntil: 'networkidle' });

  const pngBytes = await page.evaluate(async () => {
    const c = document.createElement('canvas');
    c.width = 160;
    c.height = 120;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#4F46E5';
    ctx.fillRect(0, 0, 160, 120);
    const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
    return Array.from(new Uint8Array(await blob.arrayBuffer()));
  });

  await page.selectOption('#formatSelect', 'image/webp');
  await page.setInputFiles('#fileInput', {
    name: 'sample.png',
    mimeType: 'image/png',
    buffer: Buffer.from(pngBytes),
  });
  await page.click('#actionBtn');
  await expect(page.locator('#resultBox')).toBeVisible({ timeout: 10000 });

  const headerInfo = await page.evaluate(async () => {
    const href = document.getElementById('downloadBtn').getAttribute('href');
    const resp = await fetch(href);
    const bytes = new Uint8Array(await resp.arrayBuffer());
    const riff = String.fromCharCode(...bytes.slice(0, 4));
    const webp = String.fromCharCode(...bytes.slice(8, 12));
    return { mime: resp.headers.get('content-type') || document.getElementById('downloadBtn').dataset.mime, riff, webp };
  });

  expect(headerInfo.riff).toBe('RIFF');
  expect(headerInfo.webp).toBe('WEBP');
});

// 7. Functional Tool Test: Passport Photo Maker creates exact 630x810 output
test('Tool e2e: passport-photo-maker generates 630x810 image', async ({ page }) => {
  await page.goto('/tools/passport-photo-maker/', { waitUntil: 'networkidle' });

  const jpgBytes = await page.evaluate(async () => {
    const c = document.createElement('canvas');
    c.width = 800;
    c.height = 800;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, 800, 800);
    const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.9));
    return Array.from(new Uint8Array(await blob.arrayBuffer()));
  });

  await page.selectOption('#sizePreset', '630x810');
  await page.setInputFiles('#fileInput', {
    name: 'portrait.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from(jpgBytes),
  });
  await page.click('#actionBtn');
  await expect(page.locator('#resultBox')).toBeVisible({ timeout: 10000 });

  const dims = await page.evaluate(async () => {
    const href = document.getElementById('downloadBtn').getAttribute('href');
    const img = new Image();
    img.src = href;
    await new Promise((r) => (img.onload = r));
    return { width: img.naturalWidth, height: img.naturalHeight };
  });

  expect(dims.width).toBe(630);
  expect(dims.height).toBe(810);
});
