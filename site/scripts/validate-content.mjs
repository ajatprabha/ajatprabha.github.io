import { readFile, readdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { writingSchema, projectSchema, aboutSchema } from '../src/lib/schema.ts';
const site = fileURLToPath(new URL('../', import.meta.url));
const routes = new Set(); const projects = new Set(); const writing = [];
for (const [collection, schema] of [['projects', projectSchema], ['writing', writingSchema], ['about', aboutSchema], ['fixtures', writingSchema]]) {
 let files; try { files = await readdir(`${site}/src/content/${collection}`); } catch (error) { if (error.code === 'ENOENT') continue; throw error; }
 for (const file of files.filter(file => file.endsWith('.md'))) {
  const source = await readFile(`${site}/src/content/${collection}/${file}`, 'utf8');
  const data = schema.parse(parse(source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? ''));
  if (collection === 'projects') projects.add(file.replace(/\.md$/, ''));
  if (collection === 'writing') { if (routes.has(data.route)) throw new Error(`Duplicate route ${data.route}`); routes.add(data.route); writing.push({file,data,source}); }
  if ('cover' in data && data.cover) await access(`${site}/..${data.cover.src}`);
 }
}
for (const {file,data,source} of writing) {
 for (const id of data.projectIds) if (!projects.has(id)) throw new Error(`${file}: unknown project ${id}`);
 if (/\{%|\{\{|<script[^>]+gist\.github/.test(source)) throw new Error(`${file}: unconverted remote or Liquid markup`);
 const paths = [...source.matchAll(/src=["'](\/assets\/[^"']+)["']/g), ...source.matchAll(/\]\((\/assets\/[^)]+)\)/g)];
 for (const path of paths) await access(`${site}/..${decodeURIComponent(path[1].split('#')[0])}`);
}
console.log(`Validated schema, unique routes, project references and local media for ${writing.length} writing entries.`);
if (!writing.length) console.log('Foundation fixture stage: historical source parity is not yet covered.');
