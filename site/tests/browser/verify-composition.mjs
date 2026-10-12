// Validate published navigation and preservation contracts in actual built output.
import assert from 'node:assert/strict';
import { readFile, access, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';
import { XMLParser } from 'fast-xml-parser';
const root = fileURLToPath(new URL('../../../', import.meta.url));
const dist = `${root}site/dist/`;
const baseline = JSON.parse(await readFile(`${root}docs/migration/legacy/published-manifest.json`, 'utf8'));
async function outputPath(path) {
  const decoded = decodeURIComponent(path);
  for (const candidate of [decoded === '/' ? 'index.html' : `${decoded.replace(/^\//, '').replace(/\/$/, '')}/index.html`, decoded.replace(/^\//, '')]) {
    try { await access(`${dist}${candidate}`); return `${dist}${candidate}`; } catch { /* Try the static endpoint form. */ }
  }
  throw new Error(`Unresolved local output path ${path}`);
}
for (const post of baseline.posts) {
  const path = new URL(post.canonical).pathname;
  const $ = load(await readFile(await outputPath(path), 'utf8'));
  assert.equal($('main h1').length, 1, `${path}: one primary heading`);
  assert.equal($('main h1').text(), post.title);
  assert.equal($('link[rel="canonical"]').attr('href'), post.canonical);
  for (const heading of post.headings) assert.ok($(`[id="${heading.id}"]`).length, `${path}: missing historical anchor ${heading.id}`);
}
for (const route of [...baseline.indexRoutes, '/writing/', '/projects/', '/about/', '/404.html']) await outputPath(route);
const projectPaths = ['darkroom', 'tempogate', 'ferry', 'dagger', 'xrun', 'gsoc-kubernetes-dashboard'].map(id => `/projects/${id}/`);
for (const path of projectPaths) await outputPath(path);
const home = load(await readFile(await outputPath('/'), 'utf8'));
for (const href of [new URL(baseline.feeds['feed.xml'][0].url).pathname, ...projectPaths.slice(0, 3)]) assert.ok(home(`a[href="${href}"]`).length, `Home discovery link ${href}`);
assert.ok(home('a[href="https://ajatprabha.in/gsoc-meta-k8s/"]').length, 'Separate archive navigation');
const parser = new XMLParser();
for (const [name, entries] of Object.entries(baseline.feeds)) {
  const parsed = parser.parse(await readFile(`${dist}${name}`, 'utf8'));
  const actual = name === 'feed.xml' ? parsed.feed.entry : parsed.rss.channel.item;
  assert.equal(actual.length, entries.length);
  for (const [index, entry] of entries.entries()) {
    const item = actual[index];
    assert.equal(name === 'feed.xml' ? item.id : item.guid, entry.id, `${name}: ID at ${index}`);
    assert.equal(Date.parse(name === 'feed.xml' ? item.published : item.pubDate), Date.parse(entry.published));
    assert.equal(item.title, entry.title);
    assert.ok(name === 'feed.xml' ? item.content : item.description, `${name}: full content`);
  }
}
async function walk(directory) {
  const paths = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) paths.push(...await walk(path));
    else if (entry.name.endsWith('.html')) paths.push(path);
  }
  return paths;
}
const files = await walk(dist);
for (const file of files) {
  const $ = load(await readFile(file, 'utf8'));
  assert.equal($('main').length, 1, `${file}: main landmark`);
  assert.ok($('a[href="#main"]').length, `${file}: skip link`);
  assert.equal($('script[src*="disqus"], script[src*="gist.github"], script[src*="google-analytics"]').length, 0, `${file}: forbidden third-party integration`);
  const canonical = $('link[rel="canonical"]').attr('href');
  for (const node of $('a[href^="/"], a[href^="#"]').toArray()) {
    const href = $(node).attr('href');
    if (href.startsWith('//')) continue;
    const target = new URL(href, canonical);
    const targetFile = await outputPath(target.pathname);
    if (target.hash) {
      const targetPage = load(await readFile(targetFile, 'utf8'));
      const id = decodeURIComponent(target.hash.slice(1));
      assert.ok(targetPage('[id]').toArray().some(element => targetPage(element).attr('id') === id), `${file}: unresolved fragment ${href}`);
    }
  }
}
console.log(`Composition verified: ${files.length} pages, 13 historical article anchors, exact ordered Atom/RSS identities, navigation and local links/fragments.`);
