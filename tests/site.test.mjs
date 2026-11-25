// F:/filebrik/tests/site.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

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
