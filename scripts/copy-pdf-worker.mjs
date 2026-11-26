// Ensures PDF.js worker is copied to public/workers/ before every Astro build
import fs from 'node:fs';
import path from 'node:path';

const candidates = [
  'node_modules/pdfjs-dist/build/pdf.worker.min.mjs',
  'node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs',
];
const src = candidates.find((p) => fs.existsSync(p));
if (!src) {
  console.error('pdf.worker.min.mjs not found in node_modules/pdfjs-dist');
  process.exit(1);
}
fs.mkdirSync('public/workers', { recursive: true });
fs.copyFileSync(src, path.join('public/workers', 'pdf.worker.min.mjs'));
console.log(`Copied ${src} -> public/workers/pdf.worker.min.mjs`);
