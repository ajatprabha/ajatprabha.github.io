import type { APIRoute } from "astro";
import { getWriting, getProjects } from "../lib/content";
import { articlePath, projectPath, tagPath, canonicalUrl } from "../lib/routes";
import { escapeXml } from "./_feeds";
export const GET: APIRoute = async () => {
  const [writing, projects] = await Promise.all([getWriting(), getProjects()]);
  const paths = [
    "/",
    "/writing/",
    "/projects/",
    "/about/",
    "/author/ajatprabha/",
    ...writing.map(articlePath),
    ...projects.map((project) => projectPath(project.id)),
    ...new Set(writing.flatMap((article) => article.data.tags.map(tagPath))),
  ];
  const xml = `<?xml version="1.0" encoding="utf-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${escapeXml(canonicalUrl(path))}</loc></url>`).join("")}</urlset>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
