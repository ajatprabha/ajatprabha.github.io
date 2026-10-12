import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { parse } from 'yaml';
import { readLegacy, convertBody } from './convert.mjs';
const root = fileURLToPath(new URL('../../../', import.meta.url));
const hash = (text) => createHash('sha256').update(text).digest('hex');
const empty = { routes: {}, gistSources: {}, headings: [], images: {} };

test('code containing HTML and Liquid-looking text is preserved exactly', () => {
  const source = 'A paragraph.\n\n```go\nvar html = `<div style="width: 30%">`\nvar template = "{% post_url unknown %}"\n```\n\nClosing prose.\n';
  assert.equal(convertBody(source, empty), source);
});

test('Gist embeds preserve tabs, whitespace, repeated occurrences, and pinned attribution', () => {
  const url = 'https://gist.github.com/abc.js?file=example.go';
  const code = 'func example() {\n\treturn  // exact spacing  \n}';
  const gistSources = { [url]: { content: code, language: 'Go', filename: 'example.go', owner: 'author', sourceUrl: 'https://gist.github.com/author/abc/revision' } };
  const script = `<div><script src="${url}"></script></div>`;
  const converted = convertBody(`${script}\n\n${script}`, { ...empty, gistSources });
  assert.equal(converted.split(`${code}\n`).length - 1, 2);
  assert.equal(converted.split('[example.go by author](https://gist.github.com/author/abc/revision)').length - 1, 2);
  assert.ok(!converted.includes('<script'));
  assert.ok(!converted.includes('<div'));
});

test('missing capture and invalid internal references fail explicitly', () => {
  assert.throws(() => convertBody('<script src="https://gist.github.com/missing.js"></script>', empty), /Uncaptured Gist/);
  assert.throws(() => convertBody('[missing]({% post_url missing %})', empty), /Unknown post link/);
});

test('actual source metadata, code blocks, prose, heading IDs and five videos survive', async () => {
  const audit = JSON.parse(await readFile(path.join(root, 'docs/migration/content/posts.json'), 'utf8'));
  assert.equal(audit.length, 13);
  assert.equal(audit.reduce((sum, post) => sum + post.liquidLinks, 0), 9);
  assert.equal(audit.reduce((sum, post) => sum + post.gistOccurrences, 0), 24);
  const routes = new Set(); let videoCount = 0; let codeCount = 0; let proseCount = 0;
  for (const entry of audit) {
    const original = readLegacy(await readFile(path.join(root, entry.source), 'utf8'), path.basename(entry.source));
    const migrated = await readFile(path.join(root, `site/src/content/writing/${original.id}.md`), 'utf8');
    const metadata = parse(migrated.match(/^---\n([\s\S]*?)\n---/)[1]);
    assert.equal(metadata.title, original.title);
    assert.equal(metadata.publishedAt, original.publishedAt);
    assert.equal(metadata.route, entry.route);
    assert.deepEqual(metadata.tags, original.tags);
    assert.equal(hash(original.body), entry.sourceBodySha256);
    const body = migrated.replace(/^---\n[\s\S]*?\n---\n/, '');
    assert.equal(hash(body), entry.convertedBodySha256);
    assert.ok(!routes.has(metadata.route)); routes.add(metadata.route);
    for (const code of original.body.matchAll(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\s*$/gm)) {
      assert.ok(body.includes(code[0]), `Code altered: ${entry.source}`); codeCount++;
    }
    for (const paragraph of original.body.split(/\n\s*\n/)) {
      // Ordinary prose has no legacy adapters. It must remain verbatim.
      if (/^[A-Za-z]/.test(paragraph) && !/[<{]|\{%|```/.test(paragraph)) {
        assert.ok(body.includes(paragraph), `Prose altered: ${entry.source}: ${paragraph.slice(0, 40)}`); proseCount++;
      }
    }
    let previousLevel = 1;
    for (const heading of body.matchAll(/<h([2-6])\b/g)) {
      const level = Number(heading[1]); assert.ok(level <= previousLevel + 1, `Heading skips a level: ${entry.source}`); previousLevel = level;
    }
    assert.ok(!/<h1\b/.test(body));
    for (const id of entry.headingIds) assert.ok(body.includes(`id="${id}"`), `Missing anchor: ${id}`);
    for (const source of original.body.matchAll(/<source[^>]+src="([^"]+)"/g)) assert.ok(body.includes(`src="${source[1]}"`));
    videoCount += [...body.matchAll(/<video\b/g)].length;
    assert.ok(!/style=|<script/.test(body.replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\s*$/gm, '')));
  }
  assert.equal(videoCount, 5); assert.ok(codeCount > 30); assert.ok(proseCount > 150);
});

test('each pinned Gist hash matches captured source and every occurrence appears in its article', async () => {
  const { occurrences } = JSON.parse(await readFile(path.join(root, 'docs/migration/content/gists.json'), 'utf8'));
  assert.equal(occurrences.length, 24);
  assert.equal(new Set(occurrences.map((item) => item.scriptUrl)).size, 23);
  for (const occurrence of occurrences) {
    const code = await readFile(path.join(root, occurrence.path), 'utf8');
    assert.equal(hash(code), occurrence.sha256);
    const article = await readFile(path.join(root, `site/src/content/writing/${occurrence.post}`), 'utf8');
    assert.ok(article.includes(code)); assert.ok(article.includes(occurrence.sourceUrl));
    assert.match(occurrence.revision, /^[a-f0-9]{40}$/);
  }
  assert.equal((await readdir(path.join(root, 'site/src/content/projects'))).filter((file) => file.endsWith('.md')).length, 6);
});
