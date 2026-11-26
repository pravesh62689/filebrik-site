# FileBrik Project Status & Architecture Report

**Current Status**: Audit Fixes & Live QA Complete • Deployed Live (`569c679`) • CI Green (`45831952415`) • Live QA Green (`45832528918`: Perf 100 / A11y 98–100 / BP 100 / SEO 100) • IndexNow Green (`45824397463`) • GSC Verified & Sitemaps Submitted (Google + Bing)  
**Design State**: **design to be swapped** (built using pure CSS design tokens and standalone preview screens in `design/exports`; pending Stitch zip import from `Downloads/stitch_*.zip`).  
**Production URL**: `https://filebrik.pages.dev` *(live on Cloudflare Pages Git integration from `main` @ `569c679`)*  
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
- **CI Push Pipeline (`45831952415` on `569c679`)**: All 3 jobs green (`build-and-test`: 6/6, `e2e`: 48/48 across Mobile/Desktop Chrome, `lighthouse` mobile: ≥90).
- **Live E2E Against `https://filebrik.pages.dev` (Live QA `45832528918` on deployed `569c679`)**: **48/48 passing** across Mobile Chrome (`390×844`) & Desktop Chrome (all routes + `404` + IndexNow key + `og-default.png`, JSON-LD, ≥400 words & ≥3 internal links per tool, zero upload requests across all 10 tools).
- **Live Lighthouse Mobile (`https://filebrik.pages.dev`, Live QA `45832528918`)**: `/` = `perf:100, a11y:100, bp:100, seo:100, cls:0, fcp:0.9s, lcp:0.9s`; `/tools/compress-pdf/` = `perf:100, a11y:98, bp:100, seo:100, cls:0, fcp:1.0s, lcp:1.0s`; `/tools/exam-photo-signature-resizer/` = `perf:100, a11y:98, bp:100, seo:100, cls:0, fcp:1.0s, lcp:1.0s`.
- **IndexNow (`45824397463`)**: Automated IndexNow ping workflow green after CI.
- **Audit Report**: Full checklist recorded in [docs/AUDIT-2026-11-26.md](docs/AUDIT-2026-11-26.md).
- **GSC HTML Meta Verification Tag**: Live on `https://filebrik.pages.dev/` (`<meta name="google-site-verification" content="EuP7tR_9jMW5UuGvMcL4iTqmbOJUfRJT3FeuZgJbvj0">`, verified via `curl` exit 0).
- **Search Console & Bing Submission**: GSC `siteOwner` verified via API (`gsc-audit.mjs`), `sitemap-index.xml` submitted (`errors: 0`), `56` sitemap URLs inspected (`1` `Submitted and indexed`, `55` `URL is unknown to Google`, `0` canonical mismatches); property + sitemap imported into Bing Webmaster Tools.
- **Ad-Network Status**: Adsterra (`6231440`) approved and live (`32499187` Popunder, `32499188` Native Banner, `32499189` Social Bar) with `adZones.json` `enabled: true`; Clickadu (`clckd` meta tag live, awaiting Verify click).

## 5. Release Log
- `2026-11-26` · **P0 Preflight**: Verified `git pull`, `gh auth status`, Node `v22.23.2`, disk space; updated `.gitignore` (`secrets/`, `.env*`, `token*.json`, `client_secret*.json`, `.pw-profile*`, `handoff/`); extracted `tools/browser-kit.js` and copied to clipboard.
- `2026-11-26` · **P4/P5 GSC & Bing**: Verified GSC property via HTML tag, submitted `sitemap-index.xml` to Google Search Console, and imported property into Bing Webmaster Tools.
- `2026-11-26` · **P3/P6 Ad Prep**: Cleaned `public/ads.txt` placeholders, wired `src/data/adZones.json` (`enabled: false`) into `adManager.ts` / `Layout.astro` / `AdSlot.astro`, and created `docs/after-approval.md` (applications held until GSC indexing).
