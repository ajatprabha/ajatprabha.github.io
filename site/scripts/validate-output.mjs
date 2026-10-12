import { readdir, readFile, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { load } from "cheerio";
import { validationStage } from "./validation-stage.mjs";
const dist = fileURLToPath(new URL("../dist/", import.meta.url));
const root = fileURLToPath(new URL("../../", import.meta.url));
const stage = await validationStage();
const strict = stage === "composition";
async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = `${dir}/${entry.name}`;
    if (entry.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}
const files = (await walk(dist)).filter((file) => file.endsWith(".html"));
if (!files.length)
  throw new Error(
    "No HTML output; run build:review for the foundation fixture.",
  );
const pages = new Map();
for (const file of files) {
  const $ = load(await readFile(file, "utf8"));
  if (!$("title").text() || !$('meta[name="description"]').attr("content"))
    throw new Error(`Missing metadata: ${file}`);
  if (
    !$("main").length ||
    (!file.endsWith("/theme-reference/index.html") && $("h1").length !== 1) ||
    !$("h1").length
  )
    throw new Error(`Expected main and one h1: ${file}`);
  const canonical = $('link[rel="canonical"]').attr("href");
  if (!canonical?.startsWith("https://ajatprabha.in/"))
    throw new Error(`Invalid canonical: ${file}`);
  for (const node of $('[src^="/assets/"], [poster^="/assets/"]').toArray())
    for (const attr of ["src", "poster"]) {
      const value = $(node).attr(attr);
      if (value)
        await access(`${dist}${decodeURIComponent(value.split("#")[0])}`);
    }
  const key = `/${file
    .slice(dist.length)
    .replace(/^\//, "")
    .replace(/index\.html$/, "")}`;
  pages.set(key, $);
  pages.set(new URL(canonical).pathname, $);
}
function pageFor(path) {
  return (
    pages.get(path) ??
    pages.get(`${path.replace(/\/$/, "")}/`) ??
    pages.get(path.replace(/\.html$/, ""))
  );
}
if (strict) {
  const manifest = JSON.parse(
    await readFile(
      `${root}/docs/migration/legacy/published-manifest.json`,
      "utf8",
    ),
  );
  for (const post of manifest.posts) {
    const path = new URL(post.canonical).pathname;
    const $ = pageFor(path);
    if (!$) throw new Error(`Missing historical article ${path}`);
    if ($("h1").text() !== post.title)
      throw new Error(`Changed historical title ${path}`);
    if ($('link[rel="canonical"]').attr("href") !== post.canonical)
      throw new Error(`Changed historical canonical ${path}`);
    for (const heading of post.headings)
      if (
        !$("[id]")
          .toArray()
          .some((node) => $(node).attr("id") === heading.id)
      )
        throw new Error(`Missing heading fragment ${path}#${heading.id}`);
    for (const media of post.media)
      if (
        media.src?.startsWith("/assets/") &&
        !$("[src]")
          .toArray()
          .some(
            (node) =>
              decodeURIComponent($(node).attr("src") ?? "") ===
              decodeURIComponent(media.src),
          )
      )
        throw new Error(`Missing historical media ${path}: ${media.src}`);
  }
  for (const path of [
    ...manifest.indexRoutes,
    "/writing/",
    "/projects/",
    "/about/",
    "/404.html",
  ])
    if (!pageFor(path)) throw new Error(`Missing required route ${path}`);
  for (const [key, $] of pages) {
    if (key === "/404.html") continue;
    for (const node of $("a[href]").toArray()) {
      const href = $(node).attr("href");
      if (!href || /^(?:mailto:|tel:)/.test(href)) continue;
      let url;
      try {
        url = new URL(href, `https://ajatprabha.in${key}`);
      } catch {
        throw new Error(`Malformed link ${key}: ${href}`);
      }
      if (
        url.origin !== "https://ajatprabha.in" ||
        url.pathname.startsWith("/gsoc-meta-k8s")
      )
        continue;
      const target = pageFor(decodeURIComponent(url.pathname));
      if (!target) {
        try {
          await access(`${dist}${decodeURIComponent(url.pathname)}`);
          continue;
        } catch {
          throw new Error(`Broken local link ${key}: ${href}`);
        }
      }
      const fragment = decodeURIComponent(url.hash.slice(1));
      if (
        fragment &&
        !target("[id]")
          .toArray()
          .some((el) => target(el).attr("id") === fragment)
      )
        throw new Error(`Broken fragment ${key}: ${href}`);
    }
  }
  console.log(
    `Composition parity passed: ${manifest.posts.length} historical articles, routes, heading fragments, media and local links.`,
  );
} else
  console.log(
    `Validated metadata, landmarks, canonical and media for ${files.length} HTML pages; historical parity is deferred at ${stage} stage.`,
  );
