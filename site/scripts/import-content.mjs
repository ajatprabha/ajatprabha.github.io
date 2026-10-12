import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { imageDimensions } from './content/images.mjs';
import { readLegacy, convertBody } from './content/convert.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const baselinePath = process.argv[2] ?? path.join(root, 'docs/migration/legacy/published-manifest.json');
const baseline = JSON.parse(await readFile(baselinePath, 'utf8'));
const capture = JSON.parse(await readFile(path.join(root, 'docs/migration/content/gists.json'), 'utf8'));
const gistSources = {};
for (const occurrence of capture.occurrences) {
  const content = await readFile(path.join(root, occurrence.path), 'utf8');
  if (createHash('sha256').update(content).digest('hex') !== occurrence.sha256) throw new Error(`Gist hash differs: ${occurrence.path}`);
  gistSources[occurrence.scriptUrl] = { ...occurrence, content };
}
const images = {};
for (const filename of await readdir(path.join(root, 'assets/images'))) {
  if (/\.(jpg|png|svg)$/.test(filename)) images[`/assets/images/${filename}`] = imageDimensions(await readFile(path.join(root, 'assets/images', filename)), filename);
}
const posts = [];
for (const filename of (await readdir(path.join(root, '_posts'))).sort()) {
  if (filename.endsWith('.md')) posts.push(readLegacy(await readFile(path.join(root, '_posts', filename), 'utf8'), filename));
}
const routes = Object.fromEntries(posts.map((post) => [post.id, post.route]));
const relatedProjects = {
  '2018-06-03-second-week-at-gojek': ['darkroom'],
  '2018-06-10-third-week-code-all-you-want': ['darkroom'],
  '2018-06-17-load-testing-vegeta-and-trip-to-pudducherry': ['darkroom'],
  '2020-06-24-k8s-operator-with-api-server-for-gui': ['darkroom'],
  '2023-05-25-intro-xrun-package-managing-component-lifecycle-go': ['xrun'],
  '2026-08-12-ferry-xload-learns-to-write': ['ferry'],
  '2026-08-12-what-the-windows-registry-taught-me': ['ferry'],
};
const target = path.join(root, 'site/src/content/writing');
await mkdir(target, { recursive: true });
const audit = [];
for (const post of posts) {
  const evidence = baseline.posts.find((item) => new URL(item.canonical).pathname === post.route);
  if (!evidence) throw new Error(`No actual legacy route: ${post.route}`);
  const body = convertBody(post.body, { routes, gistSources, headings: evidence.headings, images });
  const firstParagraph = post.body.trim().split(/\n\s*\n/)[0].replace(/^>\s*/gm, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*`_]/g, '').replace(/\s+/g, ' ').trim();
  const metadata = { title: post.title, description: firstParagraph.length > 190 ? `${firstParagraph.slice(0, 187).trimEnd()}...` : firstParagraph,
    publishedAt: post.publishedAt, route: post.route, tags: post.tags, projectIds: relatedProjects[post.id] ?? [], author: 'ajatprabha', cover: { ...post.cover, ...images[post.cover.src] }, legacySourceId: post.id };
  const frontmatter = Object.entries(metadata).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join('\n');
  await writeFile(path.join(target, `${post.id}.md`), `---\n${frontmatter}\n---\n${body}`);
  audit.push({ source: `_posts/${post.id}.md`, route: post.route, publishedAt: post.publishedAt, title: post.title,
    sourceBodySha256: createHash('sha256').update(post.body).digest('hex'), convertedBodySha256: createHash('sha256').update(body).digest('hex'),
    headingIds: evidence.headings.map((heading) => heading.id), liquidLinks: [...post.body.matchAll(/\{%\s*post_url\b/g)].length,
    gistOccurrences: capture.occurrences.filter((gist) => gist.post === `${post.id}.md`).length });
}
await writeFile(path.join(root, 'docs/migration/content/posts.json'), `${JSON.stringify(audit, null, 2)}\n`);
console.log(`Converted ${posts.length} posts, ${audit.reduce((n, p) => n + p.liquidLinks, 0)} internal Liquid links, ${capture.occurrences.length} Gist occurrences.`);
