import { defineConfig } from 'astro/config';
import { rm } from 'node:fs/promises';
export default defineConfig({
 site: 'https://ajatprabha.in', output: 'static', trailingSlash: 'ignore',
 markdown: { shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' }, defaultColor: false } },
 integrations: [{ name: 'review-route-gate', hooks: { 'astro:build:done': async ({ dir }) => { if (process.env.THEME_REFERENCE !== '1') await rm(new URL('theme-reference/', dir), { recursive: true, force: true }); } } }],
});
