import { getCollection, type CollectionEntry } from 'astro:content';
import { projectOrder } from '../data/site';
import { articlePath, projectPath } from './routes';
import type { ArticleSummary, ProjectSummary } from './types';
export type WritingEntry = CollectionEntry<'writing'>;
export type ProjectEntry = CollectionEntry<'projects'>;
export async function getWriting(): Promise<WritingEntry[]> { return (await getCollection('writing', ({ data }) => !data.draft)).sort((a,b) => Date.parse(b.data.publishedAt) - Date.parse(a.data.publishedAt) || a.id.localeCompare(b.id)); }
export async function getProjects(): Promise<ProjectEntry[]> { return (await getCollection('projects')).sort((a,b) => ((projectOrder.indexOf(a.id) < 0 ? 999 : projectOrder.indexOf(a.id)) - (projectOrder.indexOf(b.id) < 0 ? 999 : projectOrder.indexOf(b.id))) || a.id.localeCompare(b.id)); }
export function toArticleSummary(entry: WritingEntry | CollectionEntry<'fixtures'>): ArticleSummary { const d = entry.data; return { id: entry.id, title: d.title, href: articlePath(entry), publishedAt: d.publishedAt, description: d.description, tags: d.tags, cover: d.cover }; }
export function toProjectSummary(entry: ProjectEntry): ProjectSummary { const d = entry.data; return { id: entry.id, title: d.title, href: projectPath(entry.id), description: d.description, status: d.status, tags: d.tags, links: d.links, preview: d.cover ? { kind: 'image', image: d.cover } : { kind: 'none' } }; }
