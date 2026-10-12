import { site } from '../data/site';
export function canonicalUrl(path: string): string { if (!path.startsWith('/') || path.startsWith('//') || /[?#]/.test(path) || path.split('/').includes('..')) throw new Error(`Expected local absolute path: ${path}`); return new URL(path, site.url).href; }
export function projectPath(id: string): string { if (!/^[a-z0-9-]+$/.test(id)) throw new Error(`Invalid project ID: ${id}`); return `/projects/${id}/`; }
export function tagSlug(tag: string): string { return tag.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
export function tagPath(tag: string): string { return `/tag/${tagSlug(tag)}/`; }
export function articlePath(entry: { data: { route: string } }): string { return entry.data.route; }
