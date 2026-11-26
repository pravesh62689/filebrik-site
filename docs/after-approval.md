# FileBrik Ad-Network Applications & After-Approval Playbook

**Current Gate:** **HOLD — DO NOT APPLY YET.** Submit ad-network applications only after pages on `https://filebrik.pages.dev/` show as **indexed in Google Search Console**.

---

## 1. Pre-Application Readiness Checklist
- [x] Permanent production URL live on HTTPS: `https://filebrik.pages.dev`
- [x] Google Search Console verified (HTML tag) and `sitemap-index.xml` submitted
- [x] Bing Webmaster Tools imported from GSC
- [x] Placeholder/dummy entries removed from `public/ads.txt` (comment-only until approved)
- [x] Repo-driven ad switch created in `src/data/adZones.json` (`"enabled": false`, `"networks": {}`) and wired through `src/lib/adManager.ts`, `src/layouts/Layout.astro`, and `src/components/AdSlot.astro` (`PUBLIC_ADS_ENABLED` overrides when set)
- [x] Legal pages live (`/privacy/`, `/terms/`, `/contact/`) and excluded from pop-unders/sliders via `isExemptRoute()`
- [ ] **Indexing Gate**: GSC **Indexing → Pages** shows live indexed pages on `https://filebrik.pages.dev/`

---

## 2. Prepared Applications (Submit in Order Once GSC Shows Indexed Pages)

Use the FileBrik Chrome profile and `tools/browser-kit.js` (`F12 → Ctrl+Shift+P → !filebrik`). **Zero cost only.** Never invent IDs or traffic numbers.

### Common Form Answers (Verbatim Reference)
- **Site URL**: `https://filebrik.pages.dev`
- **Site Name**: `FileBrik`
- **Category / Niche**: Utilities / Online Tools / Software
- **Description**: `FileBrik: free in-browser PDF and image tools (compress, resize, convert, exam photo resizer). Files never leave the device.`
- **Traffic Disclosure**: `New site, under 1,000 visits/month (organic search)`
- **Target Payout Method**: PayPal (human-entered only)

### Network Application Queue & Planned Zones

| Order | Network | Planned Zones / Formats | Notes |
| --- | --- | --- | --- |
| 1 | **Monetag** | MultiTag (or OnClick Pop-under + In-Page Push + Web Push) | Primary network; owns `public/sw.js` if Push is enabled |
| 2 | **Adsterra** | Popunder, Social Bar, Native Banner, Display Banners (`728×90`, `300×250`, `320×50`) | Fill `socialBarScriptUrl` and slot configs via `adZones.json` |
| 3 | **HilltopAds** | Popunder, In-Page Push, Desktop Video Slider (`>= 1024px` only) | Never load slider below `1024px` (`initDesktopVideoSlider` guard) |
| 4 | **Clickadu** | Popunder (fallback), In-Page Push | Skip Clickadu Web Push if Monetag already owns `/sw.js` |

### Application Workflow Per Network (When Gate Opens)
1. Sign up (human completes password, email verification, CAPTCHA, terms).
2. Add website `https://filebrik.pages.dev`.
3. Capture verification snippet/file via browser kit (`handoff/filebrik-ads-<net>-*.json`); apply verbatim `<meta>` into `src/layouts/Layout.astro` or static file into `public/`, push, wait for deploy, then click **Verify**.
4. Only after **official site approval**, open each zone's **Get code** dialog and save verbatim snippets via browser kit.

---

## 3. After-Approval Activation Checklist
Once at least one ad network approves `https://filebrik.pages.dev`:

- [ ] Approval confirmation received in network dashboard / email.
- [ ] Verbatim zone snippets & script URLs captured in `handoff/filebrik-ads-<net>-*.json`.
- [ ] Single-push-worker rule verified (`public/sw.js` kept for at most one push network).
- [ ] Update `src/data/adZones.json`: set `"enabled": true` and populate verbatim `networks` values.
- [ ] Update `src/lib/adManager.ts` / `src/components/AdSlot.astro` with verbatim zone bindings.
- [ ] Update `public/ads.txt` verbatim from each approved network's `ads.txt` page.
- [ ] Update `src/pages/privacy.astro` to list every active ad network and cookie/push usage.
- [ ] Run verification:
  - `npm test` (with `PUBLIC_ADS_ENABLED=false` / unit checks)
  - `npm run build`
  - Playwright E2E + Live QA Lighthouse (Mobile perf `>= 80`, Accessibility/Best Practices/SEO `>= 95`).

---

## 4. Core Web Vitals & UX Guardrails
- **CLS ~ 0**: Keep `AdSlot.astro` `min-height` reservations (`sidebar`, `banner`, `in-feed`) and `#fb-desktop-slider` (`300×250` desktop only).
- **Pop-under Cap**: Max 1 pop-under per 60 minutes across all networks (`POPUNDER_COOLDOWN_MS` in `adManager.ts`).
- **Mobile Protection**: Mobile `< 900px` slots capped at `max-height: 120px`; desktop video slider disabled below `1024px`.
- **Exempt Routes**: `/privacy/`, `/terms/`, and `/contact/` never trigger pop-unders, social bars, or video sliders.
- **Rejected Network**: Log rejection and set retry reminder `+14 days`; continue to the next network in queue.
