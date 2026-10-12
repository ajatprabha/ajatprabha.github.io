import { readdir, readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';
const dist = fileURLToPath(new URL('../dist/', import.meta.url));
async function walk(dir) { const out=[]; for(const entry of await readdir(dir,{withFileTypes:true})) { const p=`${dir}/${entry.name}`; if(entry.isDirectory()) out.push(...await walk(p)); else out.push(p); } return out; }
const files=(await walk(dist)).filter(file=>file.endsWith('.html'));
if (!files.length) throw new Error('No HTML output; run build:review for the foundation fixture.');
for(const file of files) { const $=load(await readFile(file,'utf8')); if(!$('title').text() || !$('meta[name="description"]').attr('content')) throw new Error(`Missing metadata: ${file}`); if(!$('main').length || !$('h1').length) throw new Error(`Missing main/heading: ${file}`); if(!$('link[rel="canonical"]').attr('href')?.startsWith('https://ajatprabha.in/')) throw new Error(`Invalid canonical: ${file}`); for(const node of $('[src^="/assets/"]').toArray()) await access(`${dist}${$(node).attr('src')}`); }
console.log(`Validated metadata, landmarks, canonical and media for ${files.length} HTML pages. Full historical parity remains a composition-stage gate.`);
