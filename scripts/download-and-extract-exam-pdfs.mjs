#!/usr/bin/env node
// scripts/download-and-extract-exam-pdfs.mjs
// Uses Playwright to download official instruction/notification PDFs into data/raw/pdfs/ (gitignored),
// extracts all text + page numbers with pdfjs-dist into data/raw/pdf-extracts/ (committed),
// and prints candidate spec matches per preset.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const presetsPath = path.join(rootDir, 'src/data/examPresets.json');
const pdfsDir = path.join(rootDir, 'data/raw/pdfs');
const extractsDir = path.join(rootDir, 'data/raw/pdf-extracts');

fs.mkdirSync(pdfsDir, { recursive: true });
fs.mkdirSync(extractsDir, { recursive: true });

// Load pdfjs-dist
let pdfjsLib;
const pdfjsPaths = [
  'pdfjs-dist/legacy/build/pdf.mjs',
  'C:/Users/prave/.cache/pdfjs-tmp/node_modules/pdfjs-dist/legacy/build/pdf.mjs',
  'F:/shiftandtip/node_modules/pdfjs-dist/legacy/build/pdf.mjs',
];
for (const p of pdfjsPaths) {
  try {
    pdfjsLib = p.startsWith('pdfjs') ? await import(p) : (fs.existsSync(p) ? await import(pathToFileURL(p).href) : null);
    if (pdfjsLib) break;
  } catch { /* next */ }
}
if (!pdfjsLib) throw new Error('pdfjs-dist not found');

// Load Playwright
let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  const pwPath = 'F:/shiftandtip/node_modules/playwright/index.mjs';
  if (!fs.existsSync(pwPath)) throw new Error('Playwright not found');
  ({ chromium } = await import(pathToFileURL(pwPath).href));
}

// Official candidate PDF URLs (from .gov.in / .nic.in / ibps.in / nta / passportindia / pan)
const PDF_CANDIDATES = {
  upsc: [
    'https://upsconline.nic.in/caf/assets/PDF/instruction-photo-signature-upload-upsc.pdf',
  ],
  ssc: [
    'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_CTGD_2026.pdf',
  ],
  ibps: [
    'https://www.ibps.in/wp-content/uploads/Detailed-Notification_CRP-PO-XVI_Final_V1_30.06.2026.pdf',
    'https://ibpsreg.ibps.in/idbesomar26/uploads/loadpdf.php?file=k7m5p+fQ15exvs3Y1NjSy9uYoJS+pdGTpaeV6Kqlcg==&t=1LHArOLA2di0yczXwNDa083LmNWypw==',
    'https://ibpsreg.ibps.in/psbmar26/uploads/loadpdf.php?file=k7m5p+fQ15e4zc3gwtuXoJjWzst9tN/FppyXow==&t=1LHArOLA2di0yczXwNDa083LmNWypw==',
    'https://ibpsreg.ibps.in/sidbimay26/uploads/loadpdf.php?file=k7m5p+fQ15e7w8/VytbG45ucmdWyp5rXppSo3aRx&t=1LHArOLA2di0yczXwNDa083LmNWypw==',
  ],
  rrb: [
    'https://www.rrbapply.gov.in/assets/forms/FAQs_CEN_07_2026_NTPC_G_English.pdf',
    'https://www.rrbapply.gov.in/assets/forms/FAQ_CEN_04_2026_JE.pdf',
    'https://www.rrbapply.gov.in/assets/forms/FAQ_07_2026_NTPC_UG.pdf',
    'https://www.rrbapply.gov.in/assets/forms/FAQs_Station_Master_CEN_08_2026_English.pdf',
  ],
  nta: [
    'https://cdnbbsr.s3waas.gov.in/s37bc1ec1d9c3426357e69acd5bf320061/uploads/2025/02/2025020754.pdf',
    'https://cdnbbsr.s3waas.gov.in/s37bc1ec1d9c3426357e69acd5bf320061/uploads/2023/03/2023031499.pdf',
    'https://nta.ac.in/Download/Notice/Notice_20200716085610.pdf',
  ],
  passport: [
    'https://www.passportindia.gov.in/AppOnlineProject/pdf/ApplicationformInstructionBooklet-V3.0.pdf',
    'https://www.hcikl.gov.in/pdf/marquee/marquee__638867946.pdf',
  ],
  pan: [
    'https://www.incometaxindia.gov.in/documents/d/guest/form-no-49a',
    'https://www.pan.utiitsl.com/downloadFile?FileName=DocumentsForPAN.pdf',
  ],
  uppsc: [
    'https://uppsc.up.nic.in/CMS/OTR_DOC/OTR_PHOTO_INSTRUCTION.pdf',
    'https://uppsc.up.nic.in/advt_pdffile/pdf_advt_english_602.pdf',
  ],
  bpsc: [
    'https://bpsc.bihar.gov.in/wp-content/uploads/BPSC_content/Notices/Advertisement-Integrated-72th-CCE-PT_BPSC-20260505-p1euvo.pdf',
    'https://bpsc.bihar.gov.in/wp-content/uploads/2025/01/FAQ-BPSC-v1-1.pdf',
    'https://bpsc.bihar.gov.in/wp-content/uploads/BPSC_content/Notices/022026-ACF-Syllabus-1_BPSC-20260110-ts21ve.pdf',
  ],
  mpsc: [
    'https://mpsconline.gov.in/downloads/Instructions-for-Filling-the-Application-Form.pdf',
  ],
  tnpsc: [
    'https://www.tnpsc.gov.in/static_pdf/document/instructions-to-candiates.pdf',
    'https://tnpsc.gov.in/Document/Department/English/ANNEXURE-I%20INSTRUCTION.pdf',
    'https://tnpsc.gov.in/Document/Department/English/ANNEXURE_I_dec_2022_EN.pdf',
  ],
  rpsc: [
    'https://rpsc.rajasthan.gov.in/Static/InformationForCandidates/FAQ.pdf',
  ],
};

async function extractPdfText(pdfPath) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data, useSystemFonts: true, verbosity: 0 }).promise;
  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map(item => item.str).join(' ').replace(/\s+/g, ' ').trim();
    pages.push({ pageNum: i, text });
  }
  const meta = await doc.getMetadata().catch(() => null);
  return { pages, numPages: doc.numPages, info: meta?.info || {} };
}

function searchSpecLines(pages) {
  const hits = [];
  const re = /(?:photo|photograph|signature|thumb|kb|pixel|pixels|px|dpi|cm|mm|inch|4\.5|3\.5|2\.5|213|140|200|230|240|jpeg|jpg)/i;
  for (const { pageNum, text } of pages) {
    // split around sentence-ish boundaries or find KB / cm / pixel patterns
    const pat = /(.{0,120}(?:\b\d+\s*(?:kb|k\.b|pixels?|px|dpi|cm|mm)\b|photographs?|signatures?|thumb\s*impression).{0,160})/gi;
    let m;
    const seen = new Set();
    while ((m = pat.exec(text)) !== null) {
      const s = m[1].trim();
      if (/(?:\d+\s*(?:kb|px|pixel|dpi|cm|mm|inch)|[x×]\s*\d+)/i.test(s) && re.test(s)) {
        const key = `${pageNum}:${s.slice(0, 60)}`;
        if (!seen.has(key)) {
          seen.add(key);
          hits.push({ pageNum, snippet: s });
        }
      }
      if (pat.lastIndex === m.index) pat.lastIndex++;
    }
  }
  return hits;
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  ignoreHTTPSErrors: true,
});

for (const [group, urls] of Object.entries(PDF_CANDIDATES)) {
  console.log(`\n==================== [${group.toUpperCase()}] ====================`);
  for (let idx = 0; idx < urls.length; idx++) {
    const url = urls[idx];
    const pdfName = `${group}-${idx + 1}.pdf`;
    const pdfPath = path.join(pdfsDir, pdfName);
    const txtName = `${group}-${idx + 1}.txt`;
    const txtPath = path.join(extractsDir, txtName);

    try {
      console.log(`Downloading [${group}-${idx + 1}]: ${url}`);
      const resp = await context.request.get(url, { timeout: 30000, maxRedirects: 5 });
      const status = resp.status();
      if (status < 200 || status >= 400) {
        console.log(`  [FAIL] HTTP ${status}`);
        continue;
      }
      const buf = await resp.body();
      if (buf.length < 1000 || buf.subarray(0, 5).toString() !== '%PDF-') {
        console.log(`  [SKIP] Not a PDF (bytes=${buf.length}, head=${buf.subarray(0, 20).toString().replace(/\s+/g, ' ')})`);
        continue;
      }
      fs.writeFileSync(pdfPath, buf);
      console.log(`  [OK] Saved ${pdfName} (${(buf.length / 1024).toFixed(1)} KB)`);

      const { pages, numPages, info } = await extractPdfText(pdfPath);
      const hits = searchSpecLines(pages);
      const header = [
        `PDF URL: ${url}`,
        `Saved PDF: data/raw/pdfs/${pdfName} (gitignored)`,
        `Captured: ${new Date().toISOString()}`,
        `Pages: ${numPages}`,
        `CreationDate: ${info?.CreationDate || 'unknown'} | ModDate: ${info?.ModDate || 'unknown'}`,
        '',
        '=== SPEC HITS ===',
        ...hits.slice(0, 40).map(h => `[p.${h.pageNum}] ${h.snippet}`),
        '',
        '=== FULL EXTRACTED TEXT ===',
        ...pages.map(p => `--- Page ${p.pageNum} ---\n${p.text}`),
      ].join('\n\n');
      fs.writeFileSync(txtPath, header + '\n', 'utf8');
      console.log(`  [OK] Extracted ${numPages} pages -> ${txtName} (${hits.length} spec hits)`);
      hits.slice(0, 8).forEach(h => console.log(`    [p.${h.pageNum}] ${h.snippet.slice(0, 180)}`));
    } catch (err) {
      console.log(`  [ERR] ${err.message}`);
    }
  }
}

await browser.close();
console.log('\nALL DOWNLOADS & EXTRACTIONS FINISHED.');
