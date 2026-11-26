// FileBrik Playwright Browser QA e2e suite
import { test, expect } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';
import fs from 'node:fs';
import path from 'node:path';

const examPresets = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'src/data/examPresets.json'), 'utf8')
);

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

// 2. /sw.js, /ads.txt, /robots.txt, /sitemap-index.xml, and /sitemap-0.xml return 200 with pages.dev URLs
test('/sw.js, /ads.txt, /robots.txt, and XML sitemaps return 200 with pages.dev URLs', async ({ request }) => {
  const sw = await request.get('/sw.js');
  expect(sw.status()).toBe(200);
  const ads = await request.get('/ads.txt');
  expect(ads.status()).toBe(200);

  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain('Sitemap: https://filebrik.pages.dev/sitemap-index.xml');

  const smIndex = await request.get('/sitemap-index.xml');
  expect(smIndex.status()).toBe(200);
  expect(await smIndex.text()).toContain('https://filebrik.pages.dev/sitemap-0.xml');

  const sm0 = await request.get('/sitemap-0.xml');
  expect(sm0.status()).toBe(200);
  const sm0Text = await sm0.text();
  expect(sm0Text).toContain('https://filebrik.pages.dev/');
  expect(sm0Text).toContain('https://filebrik.pages.dev/tools/exam-photo-signature-resizer/');
});

// 2b. Every route has canonical & og:url pointed at https://filebrik.pages.dev
test('Canonicals and OG URLs point to https://filebrik.pages.dev', async ({ page }) => {
  for (const route of ALL_ROUTES) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
    expect(canonical).toBe(`https://filebrik.pages.dev${route}`);
    expect(ogUrl).toBe(`https://filebrik.pages.dev${route}`);
  }
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

// 8. Exam Presets E2E: Every verified PDF preset lands strictly inside its KB & dimension bounds
test('Tool e2e: exam-photo-signature-resizer verified presets land inside KB & pixel ranges', async ({ page }) => {
  test.setTimeout(90000);
  await page.goto('/tools/exam-photo-signature-resizer/', { waitUntil: 'networkidle' });

  // Synthesize a realistic 1000x1000 candidate portrait/document PNG inside Chromium
  const samplePng = await page.evaluate(async () => {
    const c = document.createElement('canvas');
    c.width = 1000;
    c.height = 1000;
    const ctx = c.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 1000, 1000);
    grad.addColorStop(0, '#f8fafc');
    grad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1000, 1000);
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(500, 380, 180, 0, Math.PI * 2);
    ctx.fill();
    for (let k = 0; k < 250; k++) {
      ctx.fillStyle = `rgb(${(k * 23) % 255}, ${(k * 47) % 255}, ${(k * 71) % 255})`;
      ctx.fillRect((k * 37) % 900, (k * 61) % 900, 80, 18);
    }
    const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
    return Array.from(new Uint8Array(await blob.arrayBuffer()));
  });

  const verifiedPresets = examPresets.filter((p) => p.verificationStatus === 'verified');
  expect(verifiedPresets.length).toBeGreaterThanOrEqual(10);

  await page.setInputFiles('#fileInput', {
    name: 'candidate-sample.png',
    mimeType: 'image/png',
    buffer: Buffer.from(samplePng),
  });

  for (const preset of verifiedPresets) {
    await page.selectOption('#examSelect', preset.id);
    await expect(page.locator('#verifyBadge')).toContainText('Verified');
    const pdfHref = await page.locator('#specPdfUrl').getAttribute('href');
    expect(pdfHref).toBe(preset.pdfUrl);

    await page.click('#processBtn');
    await expect(page.locator('#downloadOutput')).toHaveAttribute('data-preset', preset.id, { timeout: 15000 });

    const out = await page.evaluate(async () => {
      const href = document.getElementById('downloadOutput').getAttribute('href');
      const resp = await fetch(href);
      const ab = await resp.arrayBuffer();
      const bytes = new Uint8Array(ab);
      const img = new Image();
      img.src = href;
      await new Promise((r) => (img.onload = r));
      return {
        byteLen: ab.byteLength,
        soi0: bytes[0],
        soi1: bytes[1],
        width: img.naturalWidth,
        height: img.naturalHeight,
      };
    });

    const outKb = out.byteLen / 1024;
    expect(out.soi0, `${preset.id} must output JPEG SOI 0xFF`).toBe(0xff);
    expect(out.soi1, `${preset.id} must output JPEG SOI 0xD8`).toBe(0xd8);
    expect(outKb, `${preset.id} ${outKb.toFixed(2)}KB < ${preset.minKB}KB`).toBeGreaterThanOrEqual(preset.minKB);
    expect(outKb, `${preset.id} ${outKb.toFixed(2)}KB > ${preset.maxKB}KB`).toBeLessThanOrEqual(preset.maxKB);
    expect(out.width, `${preset.id} width ${out.width}`).toBeGreaterThanOrEqual(preset.minWidth);
    expect(out.width, `${preset.id} width ${out.width}`).toBeLessThanOrEqual(preset.maxWidth);
    expect(out.height, `${preset.id} height ${out.height}`).toBeGreaterThanOrEqual(preset.minHeight);
    expect(out.height, `${preset.id} height ${out.height}`).toBeLessThanOrEqual(preset.maxHeight);
  }

  // Also check unverified preset retains "Check Official Notice" and source PDF link
  await page.selectOption('#examSelect', 'ssc-photo');
  await expect(page.locator('#verifyBadge')).toContainText('Check Official Notice');
  const sscPdfHref = await page.locator('#specPdfUrl').getAttribute('href');
  expect(sscPdfHref).toContain('.pdf');
});

// 9. SEO, metadata, real 404, IndexNow key, OG image, JSON-LD, and >= 400 words per tool page
test('SEO & Release Audit: fb-build, OG/Twitter, JSON-LD, IndexNow, 404, >=400 words on all tools', async ({ page, request }) => {
  const keyRes = await request.get('/9a4f8e2c7b1d4058e9a3c2f1b7d60482.txt');
  expect(keyRes.status()).toBe(200);
  expect((await keyRes.text()).trim()).toBe('9a4f8e2c7b1d4058e9a3c2f1b7d60482');

  const ogRes = await request.get('/og-default.png');
  expect(ogRes.status()).toBe(200);

  const notFoundRes = await request.get('/definitely-missing-audit-404-route/');
  expect(notFoundRes.status()).toBe(404);

  for (const route of ALL_ROUTES) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    const seo = await page.evaluate(() => {
      const fbBuild = document.querySelector('meta[name="fb-build"]')?.getAttribute('content') || '';
      const ogImg = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
      const twCard = document.querySelector('meta[name="twitter:card"]')?.getAttribute('content') || '';
      const ldScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((s) => s.textContent || '');
      const titleLen = document.title.length;
      const mainText = (document.querySelector('main')?.innerText || '').trim();
      const words = mainText ? mainText.split(/\s+/).length : 0;
      const links = document.querySelectorAll('main a[href^="/"]').length;
      return { fbBuild, ogImg, twCard, ldScripts, titleLen, words, links };
    });
    expect(seo.fbBuild.length, `fb-build missing on ${route}`).toBeGreaterThanOrEqual(4);
    expect(seo.ogImg, `og:image missing on ${route}`).toContain('/og-default.png');
    expect(seo.twCard, `twitter:card missing on ${route}`).toBe('summary_large_image');
    expect(seo.titleLen, `titleLen=${seo.titleLen} on ${route}`).toBeGreaterThanOrEqual(30);
    expect(seo.titleLen, `titleLen=${seo.titleLen} on ${route}`).toBeLessThanOrEqual(60);
    expect(seo.ldScripts.length, `JSON-LD missing on ${route}`).toBeGreaterThanOrEqual(1);
    for (const raw of seo.ldScripts) expect(() => JSON.parse(raw)).not.toThrow();
    if (route.startsWith('/tools/')) {
      expect(seo.words, `${route} words=${seo.words} < 400`).toBeGreaterThanOrEqual(400);
      expect(seo.links, `${route} internal links=${seo.links} < 3`).toBeGreaterThanOrEqual(3);
    }
  }
});

// 10. Remaining 5 tools E2E + zero outbound upload network requests assertion
test('Tools e2e: compress-pdf, split-pdf, jpg-to-pdf, pdf-to-jpg, audio-trimmer with 0 upload requests', async ({ page }) => {
  test.setTimeout(90000);
  const uploadRequests = [];
  page.on('request', (req) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method())) {
      uploadRequests.push(`${req.method()} ${req.url()}`);
    }
  });

  const twoPagePdf = await PDFDocument.create();
  twoPagePdf.addPage([300, 300]);
  twoPagePdf.addPage([300, 300]);
  const pdfBuf = Buffer.from(await twoPagePdf.save());

  // compress-pdf
  await page.goto('/tools/compress-pdf/', { waitUntil: 'networkidle' });
  await page.setInputFiles('#pdfInput', { name: 'sample.pdf', mimeType: 'application/pdf', buffer: pdfBuf });
  await page.click('#compressBtn');
  await expect(page.locator('#resultBox')).toBeVisible({ timeout: 10000 });
  const compBytes = await page.evaluate(async () => Array.from(new Uint8Array(await (await fetch(document.getElementById('downloadBtn').getAttribute('href'))).arrayBuffer())));
  expect((await PDFDocument.load(new Uint8Array(compBytes))).getPageCount()).toBe(2);

  // split-pdf
  await page.goto('/tools/split-pdf/', { waitUntil: 'networkidle' });
  await page.setInputFiles('#fileInput', { name: 'multi.pdf', mimeType: 'application/pdf', buffer: pdfBuf });
  await page.fill('#pageRange', '2');
  await page.click('#actionBtn');
  await expect(page.locator('#resultBox')).toBeVisible({ timeout: 10000 });
  const splitBytes = await page.evaluate(async () => Array.from(new Uint8Array(await (await fetch(document.getElementById('downloadBtn').getAttribute('href'))).arrayBuffer())));
  expect((await PDFDocument.load(new Uint8Array(splitBytes))).getPageCount()).toBe(1);

  // jpg-to-pdf
  await page.goto('/tools/jpg-to-pdf/', { waitUntil: 'networkidle' });
  const samplePng = await page.evaluate(async () => {
    const c = document.createElement('canvas'); c.width = 120; c.height = 90;
    const ctx = c.getContext('2d'); ctx.fillStyle = '#0D9488'; ctx.fillRect(0, 0, 120, 90);
    return Array.from(new Uint8Array(await (await new Promise((r) => c.toBlob(r, 'image/png'))).arrayBuffer()));
  });
  await page.setInputFiles('#fileInput', { name: 'card.png', mimeType: 'image/png', buffer: Buffer.from(samplePng) });
  await page.click('#actionBtn');
  await expect(page.locator('#resultBox')).toBeVisible({ timeout: 10000 });
  const j2pBytes = await page.evaluate(async () => Array.from(new Uint8Array(await (await fetch(document.getElementById('downloadBtn').getAttribute('href'))).arrayBuffer())));
  expect((await PDFDocument.load(new Uint8Array(j2pBytes))).getPageCount()).toBe(1);

  // pdf-to-jpg
  await page.goto('/tools/pdf-to-jpg/', { waitUntil: 'networkidle' });
  await page.setInputFiles('#fileInput', { name: 'render.pdf', mimeType: 'application/pdf', buffer: pdfBuf });
  await page.click('#actionBtn');
  await expect(page.locator('#resultBox')).toBeVisible({ timeout: 20000 });
  const p2j = await page.evaluate(async () => {
    const dl = document.getElementById('downloadBtn');
    const b = new Uint8Array(await (await fetch(dl.getAttribute('href'))).arrayBuffer());
    return { pages: dl.dataset.pages, soi0: b[0], soi1: b[1] };
  });
  expect(p2j.pages).toBe('2');
  expect(p2j.soi0).toBe(0xff);
  expect(p2j.soi1).toBe(0xd8);

  // audio-trimmer
  await page.goto('/tools/audio-trimmer/', { waitUntil: 'networkidle' });
  const wavBuf = await page.evaluate(() => {
    const sr = 22050, len = 22050, dataBytes = len * 2, buf = new ArrayBuffer(44 + dataBytes), v = new DataView(buf);
    const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); v.setUint32(4, 36 + dataBytes, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true);
    v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true);
    v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, dataBytes, true);
    for (let i = 0; i < len; i++) v.setInt16(44 + i * 2, Math.round(Math.sin(i / 20) * 8000), true);
    return Array.from(new Uint8Array(buf));
  });
  await page.setInputFiles('#fileInput', { name: 'tone.wav', mimeType: 'audio/wav', buffer: Buffer.from(wavBuf) });
  await expect(page.locator('#actionBtn')).toBeEnabled({ timeout: 10000 });
  await page.fill('#startSec', '0');
  await page.fill('#endSec', '0.25');
  await page.click('#actionBtn');
  await expect(page.locator('#resultBox')).toBeVisible({ timeout: 10000 });
  const trimmed = await page.evaluate(async () => {
    const dl = document.getElementById('downloadBtn');
    const b = new Uint8Array(await (await fetch(dl.getAttribute('href'))).arrayBuffer());
    return {
      riff: String.fromCharCode(...b.slice(0, 4)),
      wave: String.fromCharCode(...b.slice(8, 12)),
      dur: Number(dl.dataset.duration),
      len: b.byteLength,
    };
  });
  expect(trimmed.riff).toBe('RIFF');
  expect(trimmed.wave).toBe('WAVE');
  expect(trimmed.dur).toBeCloseTo(0.25, 1);
  expect(trimmed.len).toBeLessThan(wavBuf.length);
  expect(uploadRequests).toHaveLength(0);
});
