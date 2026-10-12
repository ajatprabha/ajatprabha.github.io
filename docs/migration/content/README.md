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
Body heading levels begin at h2 and follow the source hierarchy without skipping levels; each page owns its h1 title.
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

## Verification

```sh
node --test site/scripts/content/convert.test.mjs
npm --prefix site run validate:content
```

The five fidelity checks cover unchanged fenced source code and ordinary prose, exact metadata and heading IDs, accessible heading levels, all five native videos, all Gist source hashes and attribution, and explicit failures for unavailable sources or unknown article links.

## Accessibility review corrections

All 23 originally alt-less body images were opened individually and reviewed against their surrounding source paragraphs on 12 October 2026.
Their visual and caption-backed alternatives are recorded in `site/scripts/content/media-alternatives.json` and supplied explicitly to the pure converter alongside image dimensions.
The alternatives describe the resize/crop comparison, DIY power supply assembly, monitoring displays, team presentation, and travel photographs without inferring people's identities.
No uncertain image alternative remains from this audit.
Decorative article covers retain an explicit empty alternative because the adjacent title provides their context.
An informative body image without an audited alternative now fails conversion instead of silently receiving an empty alternative.

All five historical video elements now preserve inline playback through `playsinline`, alongside native controls and conservative metadata preloading.
No video captions or transcripts were invented.
Accessible text alternatives for the original videos still require review of their audio and visual content before production cutover; the retained browser fallback text is not a transcript.
The sixth fidelity check verifies the audited alternatives, explicit failure for an unaudited image, decorative cover treatment, and all five inline video attributes.
