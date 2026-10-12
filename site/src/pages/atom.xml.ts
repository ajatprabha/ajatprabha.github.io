import type { APIRoute } from 'astro';
import { getWriting } from '../lib/content';
import { rssFeed } from './_feeds';
export const GET: APIRoute = async () => new Response(rssFeed(await getWriting()), { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
