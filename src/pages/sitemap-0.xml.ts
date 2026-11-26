import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

export const GET: APIRoute = ({ site }) => {
  const origin = (site?.origin || 'https://filebrik.pages.dev').replace(/\/$/, '');
  const pagesDir = path.resolve(process.cwd(), 'src/pages');

  const routes: string[] = ['/'];
  for (const entry of fs.readdirSync(pagesDir)) {
    if (entry.endsWith('.astro') && entry !== 'index.astro') {
      routes.push(`/${entry.replace(/\.astro$/, '')}/`);
    }
  }
  const toolsDir = path.join(pagesDir, 'tools');
  if (fs.existsSync(toolsDir)) {
    for (const entry of fs.readdirSync(toolsDir)) {
      if (entry.endsWith('.astro')) {
        routes.push(`/tools/${entry.replace(/\.astro$/, '')}/`);
      }
    }
  }

  const urls = routes
    .sort()
    .map((route) => `  <url>\n    <loc>${origin}${route}</loc>\n  </url>`)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
