import { readFile, readdir, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import {
  writingSchema,
  projectSchema,
  aboutSchema,
} from "../src/lib/schema.ts";
const site = fileURLToPath(new URL("../", import.meta.url));
const routes = new Set();
const projects = new Set();
const writing = [];
for (const [collection, schema] of [
  ["projects", projectSchema],
  ["writing", writingSchema],
  ["about", aboutSchema],
  ["fixtures", writingSchema],
]) {
  let files;
  try {
    files = await readdir(`${site}/src/content/${collection}`);
  } catch (error) {
    if (error.code === "ENOENT") continue;
    throw error;
  }
  for (const file of files.filter((file) => file.endsWith(".md"))) {
    const source = await readFile(
      `${site}/src/content/${collection}/${file}`,
      "utf8",
    );
    const data = schema.parse(
      parse(source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? ""),
    );
    if (collection === "projects") projects.add(file.replace(/\.md$/, ""));
    if (collection === "writing") {
      if (routes.has(data.route))
        throw new Error(`Duplicate route ${data.route}`);
      routes.add(data.route);
      writing.push({ file, data, source });
    }
    if ("cover" in data && data.cover)
      await access(`${site}/..${data.cover.src}`);
  }
}
for (const { file, data, source } of writing) {
  for (const id of data.projectIds)
    if (!projects.has(id)) throw new Error(`${file}: unknown project ${id}`);
  if (/\{%|\{\{|<script[^>]+gist\.github/.test(source))
    throw new Error(`${file}: unconverted remote or Liquid markup`);
  const paths = [
    ...source.matchAll(/src=["'](\/assets\/[^"']+)["']/g),
    ...source.matchAll(/\]\((\/assets\/[^)]+)\)/g),
  ];
  for (const path of paths)
    await access(`${site}/..${decodeURIComponent(path[1].split("#")[0])}`);
}
console.log(
  `Validated schema, unique routes, project references and local media for ${writing.length} writing entries.`,
);
if (!writing.length)
  console.log(
    "Foundation fixture stage: historical source parity is not yet covered.",
  );
const baseline = JSON.parse(
  await readFile(
    `${site}/../docs/migration/legacy/published-manifest.json`,
    "utf8",
  ),
);
if (writing.length) {
  if (writing.length !== baseline.posts.length)
    throw new Error(
      `Expected ${baseline.posts.length} historical writing entries, got ${writing.length}`,
    );
  for (const post of baseline.posts) {
    const path = new URL(post.canonical).pathname;
    const entry = writing.find(({ data }) => data.route === path);
    if (!entry || entry.data.title !== post.title)
      throw new Error(`Changed historical route/title: ${path}`);
    const date = baseline.feeds["atom.xml"].find(
      (item) => item.url.trim() === post.canonical,
    )?.published;
    if (!date || Date.parse(date) !== Date.parse(entry.data.publishedAt))
      throw new Error(`Changed historical publication instant: ${path}`);
  }
  const { spawnSync } = await import("node:child_process");
  const result = spawnSync(
    process.execPath,
    ["--test", `${site}/scripts/content/convert.test.mjs`],
    { stdio: "inherit" },
  );
  if (result.status !== 0)
    throw new Error("Content transformation/source fidelity tests failed");
  console.log(
    "Historical source metadata and substantive conversion fidelity passed.",
  );
} else {
  const { validationStage } = await import("./validation-stage.mjs");
  if ((await validationStage()) === "composition")
    throw new Error("Composition stage has no historical writing");
}
