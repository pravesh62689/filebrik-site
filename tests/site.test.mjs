// F:/filebrik/tests/site.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function presetGroup(id) {
  const groups = ['upsc', 'ssc', 'ibps', 'rrb', 'nta', 'passport', 'pan', 'uppsc', 'bpsc', 'mpsc', 'tnpsc', 'rpsc'];
  for (const g of groups) if (id.startsWith(g)) return g;
  return id;
}

test('Public static files: ads.txt and sw.js exist', () => {
  const adsPath = path.join(rootDir, 'public/ads.txt');
  const swPath = path.join(rootDir, 'public/sw.js');
  const headersPath = path.join(rootDir, 'public/_headers');

  assert.ok(fs.existsSync(adsPath), 'public/ads.txt must exist');
  assert.ok(fs.existsSync(swPath), 'public/sw.js must exist');
  assert.ok(fs.existsSync(headersPath), 'public/_headers must exist');

  const headers = fs.readFileSync(headersPath, 'utf8');
  assert.ok(headers.includes('X-Content-Type-Options'), '_headers must include security policies');
});

test('Exam presets data integrity: 20 official presets loaded', () => {
  const presetsPath = path.join(rootDir, 'src/data/examPresets.json');
  assert.ok(fs.existsSync(presetsPath), 'examPresets.json must exist');

  const data = JSON.parse(fs.readFileSync(presetsPath, 'utf8'));
  const list = Array.isArray(data) ? data : data.presets;
  assert.ok(list.length >= 10, 'Should have at least 10 official exam presets');

  for (const p of list) {
    assert.ok(p.id, 'Preset must have id');
    assert.ok(p.name, 'Preset must have name');
    assert.ok(p.minKB > 0, `${p.id} must have minKB`);
    assert.ok(p.maxKB >= p.minKB, `${p.id} maxKB >= minKB`);
    assert.ok(p.dpi >= 100, `${p.id} must have valid dpi`);
    assert.ok(p.officialUrl && !/sarkari|testbook|collegedunia|jagran|adda247/i.test(p.officialUrl), `${p.id} must not use aggregator URLs`);
    assert.ok(p.pdfUrl && !/sarkari|testbook|collegedunia|jagran|adda247/i.test(p.pdfUrl), `${p.id} must have official pdfUrl`);
    assert.ok(p.pdfPage >= 1, `${p.id} must declare pdfPage`);
    assert.ok(p.pdfDate, `${p.id} must declare pdfDate`);
    assert.ok(p.officialQuote, `${p.id} must have quote`);
    assert.ok(p.verifiedDate, `${p.id} must have verifiedDate`);
    assert.ok(p.verificationStatus === 'verified' || p.verificationStatus === 'check official notice', `${p.id} must declare verificationStatus`);
    if (p.verificationStatus === 'verified') {
      assert.ok(p.pdfExtract && fs.existsSync(path.join(rootDir, p.pdfExtract)), `${p.id} verified preset must have committed pdfExtract`);
      const extractText = fs.readFileSync(path.join(rootDir, p.pdfExtract), 'utf8').replace(/\s+/g, ' ');
      const quoteNorm = p.officialQuote.replace(/\s+/g, ' ').trim();
      assert.ok(extractText.includes(quoteNorm), `${p.id} officialQuote must match verbatim inside ${p.pdfExtract}`);
    }
  }
});

test('Tool pages: all 10 tools exist in src/pages/tools/', () => {
  const toolsDir = path.join(rootDir, 'src/pages/tools');
  const expectedTools = [
    'compress-pdf.astro',
    'merge-pdf.astro',
    'split-pdf.astro',
    'jpg-to-pdf.astro',
    'pdf-to-jpg.astro',
    'exam-photo-signature-resizer.astro',
    'compress-image-kb.astro',
    'image-converter.astro',
    'passport-photo-maker.astro',
    'audio-trimmer.astro'
  ];

  for (const t of expectedTools) {
    const p = path.join(toolsDir, t);
    assert.ok(fs.existsSync(p), `Tool page ${t} must exist`);
  }
});

test('Legal and trust pages exist: privacy, terms, contact', () => {
  const pagesDir = path.join(rootDir, 'src/pages');
  assert.ok(fs.existsSync(path.join(pagesDir, 'index.astro')));
  assert.ok(fs.existsSync(path.join(pagesDir, 'privacy.astro')));
  assert.ok(fs.existsSync(path.join(pagesDir, 'terms.astro')));
  assert.ok(fs.existsSync(path.join(pagesDir, 'contact.astro')));
});

test('Zero-budget permanent pages.dev SEO & docs configuration', () => {
  const astroConfig = fs.readFileSync(path.join(rootDir, 'astro.config.mjs'), 'utf8');
  assert.match(astroConfig, /https:\/\/filebrik\.pages\.dev/);

  const robotsPath = path.join(rootDir, 'public/robots.txt');
  assert.ok(fs.existsSync(robotsPath), 'public/robots.txt must exist');
  const robots = fs.readFileSync(robotsPath, 'utf8');
  assert.match(robots, /Sitemap:\s*https:\/\/filebrik\.pages\.dev\/sitemap-index\.xml/);

  const layout = fs.readFileSync(path.join(rootDir, 'src/layouts/Layout.astro'), 'utf8');
  assert.match(layout, /https:\/\/filebrik\.pages\.dev/);
  assert.match(layout, /<meta name="google-site-verification" content="EuP7tR_9jMW5UuGvMcL4iTqmbOJUfRJT3FeuZgJbvj0" \/>/);
  assert.ok(!/filebrik\.com/.test(layout), 'Layout.astro must not contain unowned filebrik.com');

  const launchDoc = fs.readFileSync(path.join(rootDir, 'docs/launch-steps.md'), 'utf8');
  const statusDoc = fs.readFileSync(path.join(rootDir, 'docs/STATUS.md'), 'utf8');
  assert.match(launchDoc, /Domain: deferred, buy only from ad earnings/);
  assert.match(statusDoc, /Domain: deferred, buy only from ad earnings/);
  assert.ok(!/spaceship/i.test(launchDoc + statusDoc), 'Spaceship domain steps must be removed');
});
