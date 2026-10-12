# First-draft launch decisions

Recorded from the user's choices on 12 October 2026.
These decisions supersede conflicting earlier feature defaults in planning documents.

## Design and features

- Use the field journal specification's warm paper/forest/rust palette, IBM Plex Sans headings/UI, Source Serif 4 prose, and coordinated light/dark modes for the first draft.
- Keep RSS and both historical feed endpoints.
- No newsletter signup, analytics, or search at initial launch.
- No public comments or Disqus embed on the new site.
- Audit existing Disqus comments and preserve an archive if any exist before removing the live integration at cutover.
- Preserve original thread identity, article mappings where known, and export provenance in the archive.
- Keep the comment archive as a preservation artifact; public display was not requested.
- If authenticated Disqus export is required, prepare the instructions and ask for that specific missing access or export rather than silently skipping preservation.
- Replace Gist embeds with local syntax-highlighted code blocks, retaining source links and attribution.

An availability check on 12 October 2026 found all 23 referenced files across four Gists accessible through GitHub's Gist API.
There are 24 embed occurrences because one referenced file is used twice.
Implementation must still capture and compare the actual code, record source/revision evidence, and preserve formatting.
Availability alone is not a completed content migration.

The [GSoC archive](https://ajatprabha.in/gsoc-meta-k8s/) was verified live on 12 October 2026.
Its source is outside this blog checkout.
Preserve the reachable archive and navigation link; confirm how the separate project is published before changing branch output.

## Project selection and order

The user selected all six projects below in this order and stated that the selected work was solely built by them.
Use this as first-person authorship evidence for the selected work; do not turn Kubernetes Dashboard contribution ownership into a claim of sole authorship of the entire upstream project.
Do not introduce repository star counts, numerical impact claims, or maintenance statuses without separate evidence.
The homepage may show the first three with a link to all six, while the full projects index keeps this ordering.

| Order | Project | Source | Initial description |
| --- | --- | --- | --- |
| 1 | Darkroom | [gojek/darkroom](https://github.com/gojek/darkroom) | On-demand image processing proxy built during Gojek work |
| 2 | Tempogate | [onhotpath/tempogate](https://github.com/onhotpath/tempogate) | OIDC provider and OAuth2 server for self-hosted Temporal |
| 3 | Ferry | [onhotpath/ferry](https://github.com/onhotpath/ferry) | Bidirectional data mapping for Go structs |
| 4 | Dagger | [ajatprabha/dagger](https://github.com/ajatprabha/dagger) | Typed Go DAG library for composing execution steps |
| 5 | xrun | [gojekfarm/xrun](https://github.com/gojekfarm/xrun) | Go component lifecycle management |
| 6 | GSoC Kubernetes Dashboard work | [Project archive](https://ajatprabha.in/gsoc-meta-k8s/) | Custom plugin loading and related Kubernetes work during GSoC 2019 |

Descriptions are grounded in existing writing, the resume, and linked project sources.
Implementation should review the source README for technical details before expanding each project page or drawing architectural diagrams.
Dagger here means the user's Go DAG library, not the unrelated Dagger CI product.

## About source and draft copy

The user authorized `/home/ap/workspace/ajatprabha/resume/main.tex` or LinkedIn as biography sources.
The local resume was read and supplied the facts below; LinkedIn was not needed or used.
Implementation does not require that separate checkout because the necessary biography facts are recorded here.

- IIT Jodhpur, B.Tech. in Computer Science, graduated 2020.
- Gojek internships in summers 2018 and 2019; engineering roles from July 2020 to June 2024.
- Senior Software Engineer at Kong, September 2024 to September 2025.
- Co-Founder and CTO at Fenmo, June 2025 to May 2026, building AI-powered finance automation.
- GSoC 2019 work on custom plugin loading and Kubernetes contributions.
- Public professional links: [GitHub](https://github.com/ajatprabha) and [LinkedIn](https://www.linkedin.com/in/ajatprabha).

The resume has no role marked current as of this review.
Use a role-neutral introduction until the user supplies a current role or focus.
Do not present Fenmo CTO as a current position or repeat the obsolete real-time communication SaaS venture from the old About page.
Do not copy phone numbers, grades, customer counts, revenue figures, or other resume details merely because they appear in the source.
Leave old personal-interest copy out of the first draft until it is reconfirmed.

Suggested first-draft About copy:

> I'm Ajat, a software engineer who builds backend systems and open-source tools.
> My work spans Go libraries, real-time messaging, API infrastructure, and developer tooling.
> I studied Computer Science at IIT Jodhpur, worked at Gojek and Kong, and co-founded Fenmo, where I led engineering for AI-powered finance automation.
> This site is my field journal: projects I've built, technical decisions I've worked through, and things I've learned along the way.

This is draft prose for preview review, grounded in the authorized source rather than a claim that the user approved these exact words.

## Remaining work

The feature and first-draft visual choices are settled.
Remaining gates are implementation evidence: actual comment archival if needed, code capture, route/feed/media parity, and browser/independent review.
Current role wording is optional for the preview because a factual role-neutral introduction is available.
