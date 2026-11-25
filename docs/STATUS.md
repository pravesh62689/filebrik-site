# FileBrik Project Status & Architecture Report

**Current Status**: Phase 2 Complete • Production Ready
**Design State**: **design to be swapped** (built using pure CSS design tokens and standalone preview screens in `design/exports`; pending Stitch zip import from `Downloads/stitch_*.zip`).

## 1. Technical Architecture
- **Framework**: Astro 5 (Static Output, zero client JavaScript overhead for static pages)
- **Execution Mode**: 100% Client-Side. All file manipulation executes inside local browser memory via HTML5 Canvas, WebAssembly, and Web Audio API.
- **Privacy Standard**: Zero cloud ingestion. No backend storage, no file transit.
- **Security Headers**: Configured in `public/_headers` (No global COOP/COEP to permit third-party iframe integrations, strict nosniff, referrer protection).

## 2. Implemented Tools (10 Client-Side Utilities)
1. `compress-pdf`: Target KB presets (100KB, 200KB, 500KB) via client-side `pdf-lib`.
2. `merge-pdf`: Multi-file page assembly and reordering.
3. `split-pdf`: Page range extraction and single-page isolation.
4. `jpg-to-pdf`: Image sequence consolidation into printable PDF.
5. `pdf-to-jpg`: High-resolution canvas rendering of PDF pages.
6. `exam-photo-signature-resizer`: 20 official recruitment presets (UPSC, SSC, IBPS, RRB, NEET, Passport Seva) with binary-search JPEG compression and 200/300 DPI JFIF header injection.
7. `compress-image-kb`: Canvas quality iteration to hit exact target KB limits.
8. `image-converter`: Local format conversion (WebP, PNG, JPEG, AVIF).
9. `passport-photo-maker`: Biometric 2x2 inch and 35x45mm printable 4x6 sheet generator.
10. `audio-trimmer`: Client-side audio cutting via Web Audio API.

## 3. Monetization & Ad Standards
- **Manager**: `src/lib/adManager.ts`
- **Environmental Gate**: `PUBLIC_ADS_ENABLED=false` by default.
- **Formats**: Monetag pop-under (1/60min cooldown), Clickadu fallback, Adsterra Social Bar, HilltopAds desktop-only video slider.
- **CLS Safety**: All ad containers maintain pre-rendered min-height boundaries.
- **Exempt Pages**: Legal, terms, and contact routes maintain zero ad scripts.

## 4. Verification & Testing
- Automated test suite in `tests/site.test.mjs` (4/4 passing).
- Cloudflare Pages build verified for static export.
