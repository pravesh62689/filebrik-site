# FileBrik Zero-Budget Launch & Verification Guide

**Permanent Site URL**: `https://filebrik.pages.dev` (fallbacks if taken: `filebrik-tools.pages.dev`, `getfilebrik.pages.dev`)  
Domain: deferred, buy only from ad earnings

## 1. Cloudflare Pages Git Integration (Zero Cost)
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com).
2. Navigate to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
3. Select GitHub repository: `pravesh62689/filebrik-site`.
4. Name the project **`filebrik`** (so production URL is `https://filebrik.pages.dev`; if unavailable, use `filebrik-tools`, then `getfilebrik`).
5. Configure Build Settings:
   - **Framework Preset**: `Astro`
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
   - **Environment Variables**: `NODE_VERSION = 22`
6. Click **Save and Deploy**. Wait for deploy to succeed on `https://filebrik.pages.dev`.

## 2. Google Search Console & Bing Webmaster Submission
1. Open [Google Search Console](https://search.google.com/search-console) signed in with the FileBrik Google account.
2. Add a **URL-prefix** property: `https://filebrik.pages.dev/`.
3. Select **HTML tag** verification and copy the verbatim `<meta name="google-site-verification" content="..." />` tag.
4. Add that verbatim meta tag into `src/layouts/Layout.astro` `<head>`, push to `main`, and wait for Cloudflare Pages deploy to finish.
5. Click **Verify** in Google Search Console, then submit XML sitemap: `https://filebrik.pages.dev/sitemap-index.xml`.
6. Open [Bing Webmaster Tools](https://www.bing.com/webmasters) → **Import from Google Search Console** → verify import and submit `https://filebrik.pages.dev/sitemap-index.xml`.

## 3. Programmatic Ads & Distribution (Phase 6)
Use `https://filebrik.pages.dev` as the site URL for every ad network and directory submission:
1. Once traffic reaches 500+ daily unique visitors:
   - Register `https://filebrik.pages.dev` in Monetag, Clickadu, Adsterra, and HilltopAds.
   - Set `PUBLIC_ADS_ENABLED=true` in Cloudflare Pages Environment Variables.
   - Replace partner publisher IDs in `src/lib/adManager.ts` and `public/ads.txt`.
   - Trigger redeploy to activate monetization.
2. Directory, Telegram, WhatsApp, and Shorts links all point to `https://filebrik.pages.dev`.
