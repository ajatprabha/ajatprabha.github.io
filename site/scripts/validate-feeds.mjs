import { readFile, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { XMLParser } from "fast-xml-parser";
import { SyntaxValidator } from "fast-xml-validator";
import { validationStage } from "./validation-stage.mjs";
const dist = fileURLToPath(new URL("../dist/", import.meta.url));
const root = fileURLToPath(new URL("../../", import.meta.url));
const strict = (await validationStage()) === "composition";
const baseline = JSON.parse(
  await readFile(
    `${root}/docs/migration/legacy/published-manifest.json`,
    "utf8",
  ),
);
let count = 0;
for (const endpoint of ["feed.xml", "atom.xml"]) {
  try {
    await access(`${dist}/${endpoint}`);
  } catch {
    if (strict) throw new Error(`Missing ${endpoint}`);
    console.log(`${endpoint}: deferred before composition stage.`);
    continue;
  }
  const xml = await readFile(`${dist}/${endpoint}`, "utf8");
  if (SyntaxValidator.validate(xml) !== true)
    throw new Error(`Invalid XML: ${endpoint}`);
  const parsed = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@",
    parseTagValue: false,
  }).parse(xml);
  const entries =
    endpoint === "feed.xml" ? parsed.feed?.entry : parsed.rss?.channel?.item;
  if (!Array.isArray(entries))
    throw new Error(`Incorrect feed format: ${endpoint}`);
  if (strict) {
    const expected = baseline.feeds[endpoint];
    if (entries.length !== expected.length)
      throw new Error(`Changed item count: ${endpoint}`);
    for (let i = 0; i < entries.length; i++) {
      const actual = entries[i],
        record = expected[i];
      const id =
        endpoint === "feed.xml"
          ? actual.id
          : typeof actual.guid === "string"
            ? actual.guid
            : actual.guid?.["#text"];
      const date = endpoint === "feed.xml" ? actual.published : actual.pubDate;
      const link =
        endpoint === "feed.xml" ? actual.link?.["@href"] : actual.link;
      if (
        id?.trim() !== record.id?.trim() ||
        actual.title?.trim() !== record.title?.trim() ||
        link?.trim() !== record.url?.trim() ||
        Date.parse(date) !== Date.parse(record.published)
      )
        throw new Error(
          `Changed feed identity/date/title/link ${endpoint} item ${i}`,
        );
    }
  }
  count++;
}
console.log(
  `Validated ${count} feed endpoints${strict ? " with exact baseline formats, counts, identities, dates and links" : ""}.`,
);
