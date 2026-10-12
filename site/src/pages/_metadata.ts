import { site } from "../data/site";
import { canonicalUrl } from "../lib/routes";
import type { PageMetadata } from "../lib/types";
export function metadata(
  title: string,
  description: string,
  path: string,
  extra: Partial<PageMetadata> = {},
): PageMetadata {
  return { title, description, canonical: canonicalUrl(path), ...extra };
}
export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}
export const introduction =
  "I'm Ajat, a software engineer who builds backend systems and open-source tools.";
export const journalDescription = site.description;
