#!/usr/bin/env node
/**
 * Simple sitemap generator for bapti.hu
 * Scans src/app/app.routes.ts for "path: '...'" patterns
 * and writes a sitemap.xml to the public folder.
 */

const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://bapti.hu';
const ROUTES_FILE = path.join(__dirname, '..', 'src', 'app', 'app.routes.ts');
const OUTPUT_FILE = path.join(__dirname, '..', 'public', 'sitemap.xml');

function extractRoutes(fileContent) {
  const routeRegex = /path:\s*'([^']*)'/g;
  const routes = new Set();
  let match;
  while ((match = routeRegex.exec(fileContent)) !== null) {
    const p = match[1].trim();
    // Exclude wildcard, admin & login routes from sitemap
    if (p === '**' || p.startsWith('admin') || p.startsWith('login')) continue;
    routes.add(p); // '' will represent root
  }
  return Array.from(routes);
}

function buildXml(urls) {
  const lastmod = new Date().toISOString().split('T')[0];
  const urlElements = urls
    .map((u) => {
      const loc = u ? `${DOMAIN}/${u}` : DOMAIN + '/';
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${urlElements}\n` +
    `</urlset>\n`;
}

function main() {
  const content = fs.readFileSync(ROUTES_FILE, 'utf8');
  const routes = extractRoutes(content);

  if (!routes.includes('')) routes.unshift('');

  const xml = buildXml(routes);
  fs.writeFileSync(OUTPUT_FILE, xml, 'utf8');
  console.log(`✅ Sitemap generated with ${routes.length} URLs -> ${path.relative(process.cwd(), OUTPUT_FILE)}`);
}

main(); 