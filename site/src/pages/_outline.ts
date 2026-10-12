import { load } from "cheerio";
export interface OutlineHeading {
  depth: number;
  slug: string;
  text: string;
}
// Read the actual rendered body so explicit historical anchors and Markdown agree.
export function extractOutline(html: string): OutlineHeading[] {
  const $ = load(html);
  return $("h2[id], h3[id]")
    .toArray()
    .map((heading) => ({
      depth: $(heading).is("h3") ? 3 : 2,
      slug: $(heading).attr("id")!,
      text: $(heading).text().trim(),
    }));
}
