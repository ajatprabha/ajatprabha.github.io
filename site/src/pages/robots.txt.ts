import type { APIRoute } from "astro";
import { canonicalUrl } from "../lib/routes";
export const GET: APIRoute = () =>
  new Response(
    `User-agent: *\nAllow: /\nSitemap: ${canonicalUrl("/sitemap.xml")}\n`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
