#!/usr/bin/env node
/**
 * Apply client slug / brand / model placeholders across the template.
 *
 * Usage:
 *   npm run new-site -- ora60a "ORA" "60A"
 *   npm run new-site -- acme-x1 "ACME" "X1" https://acme-x1.erythro.ai
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [slug, brand, model, siteUrlArg] = process.argv.slice(2).filter((a) => a !== '--');

if (!slug || !brand || !model) {
  console.error('Usage: npm run new-site -- <slug> "<Brand>" "<Model>" [https://slug.erythro.ai]');
  process.exit(1);
}

const siteUrl = (siteUrlArg || `https://${slug}.erythro.ai`).replace(/\/$/, '');
const pkgName = slug.replace(/[^a-z0-9-]/gi, '-').toLowerCase();

const replaceFile = (rel, fn) => {
  const p = join(root, rel);
  if (!existsSync(p)) return;
  writeFileSync(p, fn(readFileSync(p, 'utf8')), 'utf8');
  console.log('updated', rel);
};

replaceFile('package.json', (s) => s.replace(/"name"\s*:\s*"[^"]+"/, `"name": "${pkgName}"`));

replaceFile('lib/site.ts', (s) =>
  s
    .replace(/export const BRAND = '[^']*'/, `export const BRAND = '${brand.replace(/'/g, "\\'")}'`)
    .replace(/export const MODEL = '[^']*'/, `export const MODEL = '${model.replace(/'/g, "\\'")}'`),
);

replaceFile('app/layout.tsx', (s) =>
  s
    .replace(/title:\s*'[^']*'/, `title: '${brand} ${model} — product scroll landing'`)
    .replace(/description:\s*'[^']*'/, `description: 'Scroll-driven ${brand} ${model} landing: the product assembles itself part by part as you scroll.'`),
);

replaceFile('app/sitemap.ts', (s) =>
  s.replace(/'https:\/\/[^']+'/, `'${siteUrl}'`),
);

replaceFile('public/robots.txt', (s) =>
  s
    .replace(/Host:\s*.*/g, `Host: ${siteUrl}`)
    .replace(/Sitemap:\s*.*/g, `Sitemap: ${siteUrl}/sitemap.xml`),
);

replaceFile('public/llms.txt', () => `# ${brand} ${model}

> ${brand} ${model} is a product scroll-landing by Erythro.ai: a scroll-driven experience where the product assembles part by part.

- **Product:** ${brand} ${model}
- **Website:** ${siteUrl}
- **Agency:** Erythro.ai — https://erythro.ai
- **Languages:** English, Russian, Hebrew, Arabic

## Page sections

- [#top](${siteUrl}/#top): Hero + scroll-assembled product
- [#movement](${siteUrl}/#movement): Feature section A
- [#design](${siteUrl}/#design): Design carousel
- [#parts](${siteUrl}/#parts): Parts / specs table
- [#contact](${siteUrl}/#contact): Contact / reserve CTA

## Related

- [Erythro.ai](https://erythro.ai)
- [robots.txt](${siteUrl}/robots.txt)
- [sitemap.xml](${siteUrl}/sitemap.xml)
`);

console.log(`\nDone. Brand=${brand} Model=${model} URL=${siteUrl}`);
console.log('Still edit i18n/*.txt for copy, then: npm run i18n');
