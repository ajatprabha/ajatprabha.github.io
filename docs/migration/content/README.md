# Content migration evidence

The 13 writing entries preserve legacy titles, front matter publication instants, and actual published canonical paths.
The xrun filename says 25 May, but its publication date and historical route use 24 May.
Both 2026 articles retain their distinct UTC instants: Ferry at 01:00 and Windows Registry at 00:30.

`gists.json` records all 24 embed occurrences across 23 script URLs.
The exact referenced files are captured under `gists/`, with pinned revision, source owner, source link, and SHA256 for each occurrence.
Python and Go formatting is preserved, including tabs and trailing source whitespace.
Fenced Markdown adds a terminal newline where the source file lacks one, without changing code text.
No external Gist script runs in the candidate site.

The migration adapter runs from any directory:

```sh
node site/scripts/import-content.mjs
```

Its default baseline is `docs/migration/legacy/published-manifest.json`.
An explicit baseline path can be supplied as the first argument.
The adapter reads legacy source, frozen Gist captures, media dimensions, and actual baseline headings, then calls the pure `readLegacy` and `convertBody` transforms.
It writes the imported Markdown and `posts.json` audit.
Imported writing remains ordinary Markdown that can be edited directly after migration.
Running the adapter again overwrites those historical entries, so use it only when deliberately repeating the migration.

## Rich content conventions

Historical heading IDs are explicit HTML headings, preserving inline strong and code semantics.
New writing can use ordinary Markdown headings.
Gallery containers use `<div class="gallery">` and native image or video elements, with no article-specific CSS.
Captions preserve real emphasis.
Local images include intrinsic dimensions, alt attributes, lazy loading, and asynchronous decoding.
Native videos preserve their original dimensions, controls, source paths, and fallback text, with `preload="metadata"`.
Nine Liquid post links become the verified dated paths.
Kramdown target attributes are removed; links use their ordinary browser behavior.
Fenced code is passed through byte-for-byte.

## Project and About evidence

Selected project order is Darkroom, Tempogate, Ferry, Dagger, xrun, then GSoC Kubernetes Dashboard work.
The project Markdown expands only the source-backed descriptions and verified README features.
Repository revisions and source summaries are recorded in `../legacy/README.md`.
No maintenance status, popularity metric, customer outcome, or current employment claim is inferred.
The GSoC page describes work within the upstream Dashboard project and links its separately published archive.
The xrun page preserves the README's controller-runtime manager credit.

The About entry follows the role-neutral introduction and resume-backed timeline recorded in `docs/design/launch-decisions.md`.
Public professional links are GitHub and LinkedIn.
The preview introduces no contact details or unreconfirmed personal-interest copy from the old biography.
