# FileBrik Project Status & Architecture Report

**Current Status**: Phase 2 & PDF Verification Complete • Deployed Live (`0ec9a75`) • Live QA & CI Green (`45776561136` / `45774196300`) • GSC Verified & Sitemaps Submitted (Google + Bing)  
**Design State**: **design to be swapped** (built using pure CSS design tokens and standalone preview screens in `design/exports`; pending Stitch zip import from `Downloads/stitch_*.zip`).  
**Production URL**: `https://filebrik.pages.dev` *(live on Cloudflare Pages Git integration from `main` @ `0ec9a75`)*  
Domain: deferred, buy only from ad earnings

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

## 4. Verification & Browser QA
- **CI Push Pipeline (`45774196300` on `457e35e`)**: All 3 jobs green (`build-and-test`: 5/5, `e2e`: 44/44, `lighthouse` mobile: `/` = **99**, `/tools/compress-pdf/` = **100**, `/tools/exam-photo-signature-resizer/` = **100**).
- **Live E2E Against `https://filebrik.pages.dev` (Live QA `45776561136` on deployed `0ec9a75`)**: **44/44 passing** (`35.5s`) across Mobile Chrome (`390×844`) & Desktop Chrome (all 14 routes HTTP 200 with 0 console/network errors, `/sw.js`, `/ads.txt`, `/robots.txt`, `/sitemap-index.xml`, `/sitemap-0.xml` 200, canonical & OG URLs pointing to `https://filebrik.pages.dev`, 0px horizontal overflow at 390px, mobile ad height `< 25%`, desktop video slider inactive at 390px, plus functional merge-pdf, compress-to-KB `[20, 50] KB`, WebP, passport `630×810`, and 14 verified PDF exam presets).
- **Live Lighthouse Mobile Performance (`https://filebrik.pages.dev`, Live QA `45776561136`)**: `/` = **99** (`FCP=1.0s, LCP=1.0s`), `/tools/compress-pdf/` = **100** (`FCP=0.8s, LCP=0.8s`), `/tools/exam-photo-signature-resizer/` = **100** (`FCP=0.8s, LCP=0.8s`).
- **GSC HTML Meta Verification Tag**: Live on `https://filebrik.pages.dev/` (`<meta name="google-site-verification" content="EuP7tR_9jMW5UuGvMcL4iTqmbOJUfRJT3FeuZgJbvj0">`, verified via `curl` exit 0).
- **Search Console & Bing Submission**: GSC URL-prefix property `https://filebrik.pages.dev/` **verified via HTML tag**; `https://filebrik.pages.dev/sitemap-index.xml` submitted to Google Search Console; property + sitemap imported into Bing Webmaster Tools.
- **Ad-Network Pre-Approval Readiness**: Removed placeholder `ads.txt` entries, added repo-driven `src/data/adZones.json` switch (`enabled: false`), and prepared `docs/after-approval.md`. Applications held until pages show as indexed in GSC.

## 5. Release Log
- `2026-11-26` · **P0 Preflight**: Verified `git pull`, `gh auth status`, Node `v22.23.2`, disk space; updated `.gitignore` (`secrets/`, `.env*`, `token*.json`, `client_secret*.json`, `.pw-profile*`, `handoff/`); extracted `tools/browser-kit.js` and copied to clipboard.
- `2026-11-26` · **P4/P5 GSC & Bing**: Verified GSC property via HTML tag, submitted `sitemap-index.xml` to Google Search Console, and imported property into Bing Webmaster Tools.
- `2026-11-26` · **P3/P6 Ad Prep**: Cleaned `public/ads.txt` placeholders, wired `src/data/adZones.json` (`enabled: false`) into `adManager.ts` / `Layout.astro` / `AdSlot.astro`, and created `docs/after-approval.md` (applications held until GSC indexing).
