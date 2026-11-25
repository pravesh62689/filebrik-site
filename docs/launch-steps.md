# FileBrik Launch & Cloudflare Pages Setup Guide

## 1. Cloudflare Pages Git Integration
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com).
2. Navigate to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
3. Select GitHub repository: `pravesh62689/filebrik-site`.
4. Configure Build Settings:
   - **Framework Preset**: `Astro`
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
   - **Environment Variables**: `NODE_VERSION = 20`
5. Click **Save and Deploy**. Cloudflare automatically provisions the preview and production `.pages.dev` domains.

## 2. Custom Domain Configuration
1. In Cloudflare Pages project settings, click **Custom domains** → **Set up a custom domain**.
2. Enter your apex domain: `filebrik.com` (and `www.filebrik.com`).
3. If the domain is already managed on Cloudflare DNS, CNAME flattening will be applied automatically.
4. SSL/TLS Certificate will issue within 10 minutes.

## 3. Google Search Console & Bing Submission
1. Add property `https://filebrik.com` to Google Search Console via DNS verification.
2. Submit XML sitemap: `https://filebrik.com/sitemap-index.xml`.
3. In Bing Webmaster Tools, import the verified property from Search Console.

## 4. Activating Programmatic Ads
1. Once traffic reaches 500+ daily unique visitors:
2. Add `PUBLIC_ADS_ENABLED=true` in Cloudflare Pages Environment Variables.
3. Replace partner publisher IDs in `src/lib/adManager.ts` and `public/ads.txt`.
4. Trigger redeploy to activate monetization.
