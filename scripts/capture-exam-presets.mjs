// scripts/capture-exam-presets.mjs
// Captures real text snapshots of official portals listed in src/data/examPresets.json.
// Verifies whether each entry uses an official (.gov / .gov.in / .nic.in / nta.ac.in) domain
// AND whether the exact quote or contiguous KB specification appears verbatim in the captured snapshot.
// Anything lacking verbatim snapshot verification is marked "check official notice".

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const presetsPath = path.join(rootDir, 'src/data/examPresets.json');
const snapshotsDir = path.join(rootDir, 'data/raw/snapshots');

if (!fs.existsSync(snapshotsDir)) fs.mkdirSync(snapshotsDir, { recursive: true });

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  const pwPath = 'F:/shiftandtip/node_modules/playwright/index.mjs';
  if (!fs.existsSync(pwPath)) throw new Error('Playwright not found in filebrik or F:/shiftandtip');
  ({ chromium } = await import(pathToFileURL(pwPath).href));
}

const OFFICIAL_DOMAIN_RE = /^https?:\/\/[^/]*(\.gov\.in|\.nic\.in|nta\.ac\.in|\.gov)(\/|$)/i;

const presets = JSON.parse(fs.readFileSync(presetsPath, 'utf8'));
const dateStamp = new Date().toISOString().slice(0, 10);

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  ignoreHTTPSErrors: true,
});

const pageCache = new Map();

for (const preset of presets) {
  const url = preset.officialUrl || '';
  const isOfficialDomain = OFFICIAL_DOMAIN_RE.test(url);
  let snapResult = pageCache.get(url);

  if (!snapResult && url) {
    console.log(`Capturing ${preset.id} -> ${url}`);
    const page = await context.newPage();
    try {
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
      const status = resp ? resp.status() : 0;
      await page.waitForTimeout(1000);
      const text = await page.evaluate(() => document.body ? document.body.innerText.replace(/\s+\n/g, '\n').trim() : '');
      snapResult = { ok: status > 0 && status < 400 && text.length > 50, status, text };
    } catch (err) {
      console.warn(`  [WARN] Failed fetching ${url}: ${err.message}`);
      snapResult = { ok: false, status: 0, text: '', error: err.message };
    } finally {
      await page.close();
    }
    pageCache.set(url, snapResult);
  }

  let snapshotRel = null;
  if (snapResult?.ok) {
    const snapName = `${preset.id}-${dateStamp}.txt`;
    const snapAbs = path.join(snapshotsDir, snapName);
    fs.writeFileSync(
      snapAbs,
      `URL: ${url}\nCaptured: ${new Date().toISOString()}\nHTTP Status: ${snapResult.status}\n\n${snapResult.text}\n`,
      'utf8'
    );
    snapshotRel = `data/raw/snapshots/${snapName}`;
  }

  // Strict verbatim check: require either the full quote OR a contiguous KB range phrase in the captured official text
  const hay = (snapResult?.text || '').replace(/\s+/g, ' ').toLowerCase();
  const quoteLower = (preset.officialQuote || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const exactQuoteMatch = quoteLower.length > 20 && hay.includes(quoteLower);

  const contiguousRangeRe = new RegExp(`\\b${preset.minKB}\\s*(?:kb)?\\s*(?:to|-|–|and)\\s*${preset.maxKB}\\s*kb`, 'i');
  const contextRe = preset.type === 'signature' ? /signature/i : /photo|photograph/i;
  const exactRangeMatch = contiguousRangeRe.test(hay) && contextRe.test(hay);

  if (isOfficialDomain && snapResult?.ok && (exactQuoteMatch || exactRangeMatch)) {
    preset.verificationStatus = 'verified';
    preset.verifiedDate = dateStamp;
    preset.snapshot = snapshotRel;
    delete preset.verifiedNote;
  } else {
    preset.verificationStatus = 'check official notice';
    preset.verifiedDate = dateStamp;
    preset.snapshot = snapshotRel;
    if (!isOfficialDomain) {
      preset.verifiedNote = '⚠ check official notice — domain is not .gov.in / .nic.in / nta.ac.in; verify against official gazette/notification PDF';
    } else if (!snapResult?.ok) {
      preset.verifiedNote = '⚠ check official notice — official portal unreachable during live snapshot capture; check official notice PDF directly';
    } else {
      preset.verifiedNote = '⚠ check official notice — portal captured, but exact photo/signature KB & pixel table is inside the downloadable exam notice PDF';
    }
  }
}

await browser.close();
fs.writeFileSync(presetsPath, JSON.stringify(presets, null, 2) + '\n', 'utf8');

const verifiedCount = presets.filter(p => p.verificationStatus === 'verified').length;
console.log(`Exam presets audit complete: ${verifiedCount}/${presets.length} verbatim verified; ${presets.length - verifiedCount} flagged "check official notice".`);
