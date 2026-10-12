import type { WritingEntry } from "../lib/content";
import { site } from "../data/site";
import { articlePath, canonicalUrl } from "../lib/routes";
export function escapeXml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[character]!,
  );
}
function feedContent(entry: WritingEntry): string {
  const html = entry.rendered?.html;
  if (!html) throw new Error(`No rendered HTML for feed entry ${entry.id}`);
  return html.replace(
    /\b(href|src|poster)=(['"])(\/[^'"]*)\2/g,
    (_, attribute: string, quote: string, path: string) =>
      `${attribute}=${quote}${new URL(path, site.url).href}${quote}`,
  );
}
export function atomFeed(entries: WritingEntry[]): string {
  const updated =
    entries[0]?.data.updatedAt ??
    entries[0]?.data.publishedAt ??
    "2026-10-12T00:00:00Z";
  return `<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>${escapeXml(site.name)}</title><subtitle>${escapeXml(site.description)}</subtitle><id>${canonicalUrl("/feed.xml")}</id><link href="${canonicalUrl("/feed.xml")}" rel="self" type="application/atom+xml"/><link href="${canonicalUrl("/")}" rel="alternate"/><updated>${updated}</updated><author><name>${escapeXml(site.author)}</name></author>${entries
    .slice(0, 10)
    .map((entry) => {
      const url = canonicalUrl(articlePath(entry));
      return `<entry><title>${escapeXml(entry.data.title)}</title><id>${url}</id><link href="${url}" rel="alternate"/><published>${entry.data.publishedAt}</published><updated>${entry.data.updatedAt ?? entry.data.publishedAt}</updated><summary>${escapeXml(entry.data.description)}</summary><content type="html" xml:base="${url}">${escapeXml(feedContent(entry))}</content>${entry.data.tags.map((tag) => `<category term="${escapeXml(tag)}"/>`).join("")}</entry>`;
    })
    .join("")}</feed>`;
}
export function rssFeed(entries: WritingEntry[]): string {
  return `<?xml version="1.0" encoding="utf-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${escapeXml(site.name)}</title><description>${escapeXml(site.description)}</description><link>${canonicalUrl("/")}</link><atom:link href="${canonicalUrl("/atom.xml")}" rel="self" type="application/rss+xml"/>${entries
    .map((entry) => {
      const url = canonicalUrl(articlePath(entry));
      return `<item><title>${escapeXml(entry.data.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><pubDate>${new Date(entry.data.publishedAt).toUTCString().replace(" GMT", " +0000")}</pubDate><description>${escapeXml(feedContent(entry))}</description>${entry.data.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("")}</item>`;
    })
    .join("")}</channel></rss>`;
}
