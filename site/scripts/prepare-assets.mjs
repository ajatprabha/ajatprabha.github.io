import { mkdir, rm, cp, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../', import.meta.url));
const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
await mkdir(publicDir, { recursive: true });
await rm(`${publicDir}/assets`, { recursive: true, force: true });
await cp(`${root}/assets`, `${publicDir}/assets`, { recursive: true });
await writeFile(`${publicDir}/CNAME`, await readFile(`${root}/CNAME`));
console.log('Prepared ignored copies of root assets and CNAME.');
