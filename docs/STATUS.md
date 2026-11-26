# FileBrik Project Status & Architecture Report

**Current Status**: Phase 2 Complete • Browser QA & Lighthouse CI Green  
**Design State**: **design to be swapped** (built using pure CSS design tokens and standalone preview screens in `design/exports`; pending Stitch zip import from `Downloads/stitch_*.zip`).  
**Cloudflare Pages URL**: *Pending user Git integration connection*

## 1. Technical Architecture
- **Framework**: Astro 5 (Static Output, bundled CSS & local client-side `pdf-lib` / HTML5 Canvas)
- **Execution Mode**: 100% Client-Side inside local browser memory (`HTMLCanvasElement`, JFIF DPI binary injection, `pdf-lib`). Zero cloud uploads.
- **Security Headers**: Configured in `public/_headers`.

## 2. Implemented Tools (10 Client-Side Utilities)
1. `compress-pdf`: Browser-bundled `pdf-lib` object-stream compression.
2. `merge-pdf`: Multi-file client-side `pdf-lib` page assembly (verified in Playwright e2e).
3. `split-pdf`: Custom page-range extraction via `pdf-lib`.
4. `jpg-to-pdf`: Client-side image consolidation into PDF.
5. `pdf-to-jpg`: Client-side PDF-to-image workflow.
6. `exam-photo-signature-resizer`: 20 official portal presets (`src/data/examPresets.json`), JPEG KB binary search, 200/300 DPI JFIF injection + COM padding, displaying `officialQuote`, `pdfUrl`, `pdfPage`, `pdfDate`, and verification badge.
7. `compress-image-kb`: Adaptive binary-search + dimension scaling verified strictly inside requested `[minKB, maxKB]` range.
8. `image-converter`: Canvas re-encoding to WebP (`RIFF...WEBP` verified), JPEG, and PNG.
9. `passport-photo-maker`: Biometric `630×810` (Indian/Passport Seva), `600×600`, `413×531`, plus 4×6 printable sheet with 300 DPI JFIF injection.
10. `audio-trimmer`: Client-side audio utility UI.

## 3. Exam Presets Verification (`examPresets.json`)
- Official instruction/notification PDFs downloaded via Playwright into `data/raw/pdfs/` (gitignored) and extracted via `pdfjs-dist` into committed text archives in `data/raw/pdf-extracts/`.
- **14/20 presets verbatim PDF-verified** (`verificationStatus: "verified"`): `upsc-photo`, `upsc-signature`, `ssc-signature`, `ibps-photo`, `ibps-signature`, `ibps-thumb`, `rrb-signature`, `nta-neet-photo`, `nta-postcard-photo`, `nta-signature`, `uppsc-photo`, `bpsc-photo`, `mpsc-photo`, `tnpsc-photo`.
- **6/20 presets retained as `"check official notice"`** with source PDF links attached (`ssc-photo`, `rrb-photo`, `rpsc-photo`: portals moved to live camera capture; `passport-seva-photo`: PDF specifies `630×810` px & `4.5×3.5` cm without KB bounds; `pan-photo`, `pan-signature`: Income Tax portal PDF returned HTTP 403 WAF block).

## 4. Verification & Browser QA (CI Run `45725430831`)
- **Unit & Integrity Tests (`npm test`)**: 4/4 passing (`tests/site.test.mjs`).
- **Playwright E2E (`tests/e2e.spec.mjs`)**: 40/40 passing across Mobile Chrome (`390×844`) & Desktop Chrome (all 14 routes HTTP 200 with 0 console/network errors, `/sw.js` & `/ads.txt` 200, 0px horizontal overflow at 390px, mobile ad height `< 25%`, video slider inactive at 390px, plus functional merge-pdf, compress-to-KB `[20, 50] KB`, WebP, and passport `630×810` tests).
- **Lighthouse Mobile Performance (ads off)**: `/` = **100**, `/tools/compress-pdf/` = **100**, `/tools/exam-photo-signature-resizer/` = **100**.
