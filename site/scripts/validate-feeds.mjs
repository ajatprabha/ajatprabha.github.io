import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { XMLParser } from 'fast-xml-parser';
const dist = fileURLToPath(new URL('../dist/', import.meta.url));
let count = 0;
for (const endpoint of ['feed.xml','atom.xml']) {
 try { await access(`${dist}/${endpoint}`); } catch { if (process.env.VALIDATION_STAGE === 'composition') throw new Error(`Missing ${endpoint}`); console.log(`${endpoint}: not implemented at fixture/content/theme stage.`); continue; }
 const xml=await readFile(`${dist}/${endpoint}`,'utf8');
 const parsed=new XMLParser().parse(xml, true); if(!parsed.feed && !parsed.rss) throw new Error(`Unsupported feed root: ${endpoint}`); count++;
}
console.log(`Validated ${count} feed endpoints; historical identities require composition evidence.`);
