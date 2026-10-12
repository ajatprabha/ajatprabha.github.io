# Legacy output evidence

Captured on 12 October 2026 from the published `gh-pages` commit `1d98a4360478f467a2dd2427418f295c059986ba`.
`published-manifest.json` is actual generated output evidence, rather than routes inferred from Markdown filenames.
The publication predates the planning tip and is the last-known production baseline; independent rebuilt output is recorded separately when available.

## Reproduction

```sh
git clone --single-branch --branch gh-pages https://github.com/ajatprabha/ajatprabha.github.io.git /tmp/legacy-publication
git -C /tmp/legacy-publication checkout 1d98a4360478f467a2dd2427418f295c059986ba
python3 scripts/legacy-capture.py /tmp/legacy-publication --provenance 'Published gh-pages 1d98a4360478f467a2dd2427418f295c059986ba'
```

The capture reads HTML article canonical URLs, titles, display dates, body heading IDs, inline media, archive routes, feed IDs and publication timestamps, and media hashes.
It does not execute embedded scripts or require third-party services.
Local images/videos are inventoried independently of article references.

## Verified findings

- All 13 posts have extensionless canonical paths without trailing slashes, although published files end in `.html`.
- Home pagination `/page2/` and author pagination `/author/ajatprabha/page2/` exist.
- All 11 real tag archives exist; there are no published tag pagination pages.
- `/feed.xml` is Atom with the newest 10 posts, whose identifiers are the exact extensionless canonical URLs.
- `/atom.xml` is RSS with all 13 posts; preserve its actual item GUIDs and timestamps.
- Both 2026 posts publish at `2026-08-12T01:00:00+00:00`; historical dates must retain their original instants.
- GitHub Pages API confirms the main repository publishes `gh-pages` at `/`, with `ajatprabha.in` and HTTPS enabled.

## Isolated rebuild

The untouched workflow-equivalent Ruby `2.7.7` install was reproduced in the official `ruby:2.7.7` Docker image.
Image digest: `sha256:bcaad4dfd52b4805e9f8c5205be5aadb8c206813199a9aeae13793a93f2d7296`.
`bundle install` failed because dependency resolution selects `ffi 1.17.4`, which requires Ruby 3 or later.
The legacy repository has no committed Gemfile.lock.
A second attempt uses a throwaway copy with `gem "ffi", "< 1.17"` and Bundler's `force_ruby_platform`; this is a capture runtime adjustment, not a production change.
Existing Ruby/Jekyll source and production workflow remain untouched.
Published-output evidence remains valid even when a current-source rebuild is blocked.

## GSoC publishing

The separate `ajatprabha/gsoc-meta-k8s` repository exists and its Pages API confirms legacy publishing from its own `gh-pages` root.
Its default source branch is `master`, inspected at `ccd4d4257f41fb46493cd1acbd868981d84e7994`.
Its `.travis.yml` installs Hugo `0.52`, runs `make update-stats` and `hugo`, then publishes `public` using the Travis Pages provider.
Its README links `https://ajatprabha.in/gsoc-meta-k8s` and describes a Kubernetes Dashboard plugin mechanism.
The main publication does not contain that directory because GitHub Pages serves the separate project beneath the custom domain.
Preserve the external project link and separate repository publishing; do not generate a conflicting `/gsoc-meta-k8s/` page or redirect in the Astro output.
The launch-decisions document already records a successful live archive check on 12 October 2026.

Sources: [main Pages API](https://api.github.com/repos/ajatprabha/ajatprabha.github.io/pages), [GSoC source](https://github.com/ajatprabha/gsoc-meta-k8s/tree/ccd4d4257f41fb46493cd1acbd868981d84e7994), [GSoC Travis configuration](https://github.com/ajatprabha/gsoc-meta-k8s/blob/ccd4d4257f41fb46493cd1acbd868981d84e7994/.travis.yml).

## Comment preservation gate

All 13 published articles embed Disqus forum `ajat-prabha` with the same configured page URL `https://ajatprabha.in/` and identifier `Ajat Prabha`.
These values were confirmed in generated HTML, including the Ferry article; they are not hypothetical source-only defaults.
Comments may therefore belong to one shared thread, not independent article threads.
No authenticated Disqus export or complete thread listing was available in this capture environment.
Comment existence, count, and complete mappings remain unverified; do not interpret failed anonymous access as zero comments.
No comments or third-party widget are added to the preview.

Before production cutover, the forum owner must obtain a full Disqus XML export from the `ajat-prabha` administration export page or provide authenticated export access.
Retain the original downloaded bytes, download timestamp, forum, source URL, SHA-256 checksum, thread IDs, thread identifiers, thread URLs, post IDs, parent IDs, timestamps, author fields, and moderation state.
Inspect both the shared `Ajat Prabha` identity and any alternate historical threads.
Record explicit article mapping uncertainty for shared threads rather than assigning comments to guessed articles.
Keep archival data outside the public build, and verify export completeness before deciding the archive is satisfied.
Authenticated archival is a production gate and does not block the local preview.

## Selected project evidence

All five library/service READMEs were retrieved from their public default branches on 12 October 2026, and the GSoC README and build configuration were retrieved separately.
The revision table records repository HEADs at capture time.
Authorship is supplied by the user's launch decisions, not inferred from stars or repository ownership.

| Project | Revision | Verified description |
| --- | --- | --- |
| [Darkroom](https://github.com/gojek/darkroom/tree/cd57945161daa9ba59528eaa77bd79f17a85e417) | `cd57945161daa9ba59528eaa77bd79f17a85e417` | Image proxy combining interchangeable storage and image-processor interfaces, with Prometheus/StatsD metrics |
| [Tempogate](https://github.com/onhotpath/tempogate/tree/3af6a677ca67f3eb5e304b99cccc479b87c001c8) | `3af6a677ca67f3eb5e304b99cccc479b87c001c8` | Single-binary OIDC provider and OAuth2 server for Temporal browser SSO and JWT machine authentication; Google federation and JWKS publishing |
| [Ferry](https://github.com/onhotpath/ferry/tree/d946e6e261307a3be88ba99f194f264716635379) | `d946e6e261307a3be88ba99f194f264716635379` | Bidirectional mapping from a single annotated Go struct and tag grammar to source/sink drivers |
| [Dagger](https://github.com/ajatprabha/dagger/tree/68e6e0c743bdf9563e874192592ff7f6abc1fdf8) | `68e6e0c743bdf9563e874192592ff7f6abc1fdf8` | Generic typed DAG execution and composition, cycle detection, middleware, and graph visualization |
| [xrun](https://github.com/gojekfarm/xrun/tree/5b6c63f26536816ee15d761e1781f52eb472d244) | `5b6c63f26536816ee15d761e1781f52eb472d244` | Lifecycle utilities for long-running Go components such as HTTP servers and workers; credits controller-runtime manager source |
| [GSoC Dashboard work](https://github.com/ajatprabha/gsoc-meta-k8s/tree/ccd4d4257f41fb46493cd1acbd868981d84e7994) | `ccd4d4257f41fb46493cd1acbd868981d84e7994` | Dashboard plugin framework work to extend the UI using third-party APIs; separately published progress archive |
