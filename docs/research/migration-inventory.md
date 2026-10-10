# Migration inventory

Audited 9 October 2026 from the local repository.
This is migration evidence and feature defaults for the implementation plan.
The local audit did not inspect live production output, Disqus threads, or external Gist contents.
On 10 October 2026 the coordinator verified GitHub Pages settings through the repository API: legacy publishing from `gh-pages` at `/`, serving https://ajatprabha.in/.
The selected design is defined in the [field journal theme specification](../design/field-journal-theme.md).

## Verified local facts

| Area | Evidence | Implication |
| --- | --- | --- |
| Generator | `Gemfile`: Jekyll 3.8.7, GitHub Pages 206 | Replace Ruby/Jekyll tooling with Astro |
| Theme | `package.json`: Casper 2.1.9; README credits Jasper2 | Ghost-derived appearance, not evidence of a running Ghost CMS |
| Source branch | Local branch `blog`; `.github/workflows/build.yaml` push trigger | Use `blog` as the provisional stack base |
| Deployment | Workflow builds `.build`, then pushes `gh-pages` | Existing publication should continue until cutover |
| Domain | `CNAME`, `_config.yml`: `ajatprabha.in` | Preserve custom domain and canonical host |
| Content | `_posts/`: 13 Markdown files; `about/index.md` | Small post count, rich-content compatibility required |
| Tags | Post front matter: 11 unique tags | Preserve tag slug mapping |
| Author | `_data/authors.yml`: `ajatprabha` | Preserve author archive compatibility |
| Media | `assets/images/`: 63 files, 11.22 MiB; `assets/videos/`: 5 files, 47.95 MiB | Preserve asset URLs and native video playback |
| Local media integrity | Article image/video references checked against local files | All identified local media references resolve |
| Tests and lint | No test/lint scripts in package configuration or test suite found | Add migration validation and PR build checks |
| Local runtime | Docker, Node, npm available; Ruby/Bundler absent | Generate baseline in an isolated Jekyll container/environment |

Actual tags are `DIY`, `agile development`, `gojek`, `golang`, `internship`, `kubernetes`, `sdlc`, `sound`, `tdd`, `travel`, and `waterfall`.
`_data/tags.yml` contains predominantly sample theme metadata, rather than definitions for these real tags.

## Assumptions requiring verification

- GitHub Pages is verified to serve `gh-pages` at `/`; capture settings again at implementation start to detect drift.
- Existing production routes are inferred from source configuration and generators, not captured from a running build.
- Gist scripts are assumed to be intended article content; their current availability and exact source need verification.
- Disqus configuration proves the widget is enabled in source, not whether readers posted comments or how those threads resolved.
- Astro static output, Markdown in Git, an owned compact theme, and the balanced engineering field journal direction are selected.
  Optional feature scope follows the explicit defaults and audit gates in the implementation plan.

## URL and feed risks

`_config.yml` defines post permalinks as `/:year/:month/:day/:title`.
Freeze exact generated post paths in a baseline manifest before migration.
Derive route slugs from actual legacy output or filename slugs, not display titles; several display titles differ substantially from filenames.
Preserve exact historical publication dates without timezone drift.

`_plugins/jekyll-tagsgenerator.rb` generates `/tag/<lowercase-space-to-hyphen>/` and `/tag/<slug>/page2/` for paginated archives.
`_plugins/jekyll-autgenerator.rb` generates `/author/ajatprabha/` and `/author/ajatprabha/page2/`.
`_includes/post_pagination.html` references `/page2/` for the home archive.
Preserve any existing reachable pagination paths even if the new writing index uses another structure.

`jekyll-feed` is configured at `/feed.xml`.
`atom.xml` is a separate RSS document despite its filename.
Preserve both endpoints, article links, and item identifiers so subscriptions do not duplicate old entries.
Verify baseline feed contents because `atom.xml` uses `site.name`, which is not defined in `_config.yml`.

`_includes/navigation.html` links `/gsoc-meta-k8s/`, but no corresponding source page was found.
Inspect production before deciding whether to restore, redirect, or remove that navigation entry.

Heading fragment identifiers may differ between Kramdown and the selected Astro Markdown parser.
Capture legacy heading IDs and preserve important externally linkable anchors.

## Markdown and media conversion risks

- Nine Liquid `post_url` references need exact route conversion.
- Kramdown `{:target="blank"}` link attributes need conversion or removal without leaving syntax visible.
- Older posts contain raw HTML galleries and inline widths, padding, and margins.
  Normalize mechanically into a documented content pattern, or provide a deliberate compatibility style inside the theme.
- There are five native video elements, including portrait videos.
  Preserve controls, responsive sizing, and conservative preload behavior.
- There are 24 Gist embed occurrences across 23 distinct script URLs.
  Proposed default: preserve referenced code locally as fenced blocks with attribution and source links.
  Fetching source is implementation work requiring content verification, not part of this audit.
- Modern posts include long Go/YAML/text code blocks and wide tables.
  Article CSS must handle overflow without widening the page.
- Kubernetes Operator includes an SVG diagram and screenshots with spaces in filenames.
  Keep exact media paths or introduce explicit compatibility aliases.

Representative article fixtures should include Ferry, Windows Registry, Kubernetes Operator, week-two Gojek, TDD, and DIY Sound System.
These cover long prose, tables, code, diagram, galleries, external code embeds, and portrait/landscape videos.

## Comments, analytics, and subscription risks

Disqus is enabled in `_config.yml`.
`_layouts/post.html` assigns the homepage URL to `this.page.url` and the site title to `this.page.identifier` for every post.
Existing comments may therefore share an identifier/thread.
Inspect actual thread mapping before preserving or replacing comments; do not invent per-article identifiers and call that parity.

`_includes/analytics.html` embeds a legacy Universal Analytics `UA-...` identifier.
Do not mechanically migrate this as the new analytics integration.
A provider selection is still needed if analytics are wanted.

Subscription UI is disabled in `_config.yml` and `_includes/subscribe-form.html` has no working backend.
RSS is the proposed initial subscription mechanism.

## Proposed defaults for upcoming choices

| Decision | Proposed default | Rationale |
| --- | --- | --- |
| Post URLs | Preserve dated routes | Avoid unnecessary redirects and SEO churn |
| Comments | Decide explicitly after checking existing thread mapping | Current configuration has shared-identifier risk |
| Analytics | None initially; optional configurable integration | Existing tracking should not determine the new provider |
| Newsletter | RSS only initially | No existing subscription service |
| Search | Add if the chosen theme offers a maintained static integration and the feature is selected | Useful, but not essential for 13 posts |
| Gallery and code presentation | Normalize into one shared theme content system | Avoid legacy inline styles clashing with the redesign |
| Projects | Curated Markdown project collection | No current project collection exists |
| About | Obtain current biography and work details | Existing copy describes entrepreneurship and a real-time SaaS idea; current accuracy is unverified |
| Deployment | Retain existing branch publishing initially unless another reason requires a change | Reduce coupled infrastructure changes |

Project selection and factual descriptions require user input or source-backed verification.
Do not synthesize current roles, employment, or project outcomes from old About text.

## Verification requirements for the eventual implementation

1. Generate baseline route, feed identifier, local media, heading-anchor, and article-metadata inventories from real current output.
2. Validate all 13 migrated posts retain titles, dates, expected URLs, substantive content, internal links, and working media.
3. Validate tag, author, feed, and archive compatibility and canonical URLs.
4. Compare locally captured code examples with the original referenced source.
5. Browser-check the six representative article types on narrow mobile and desktop widths.
6. Check keyboard navigation, visible focus, reduced motion, contrast, color-mode readability and persistence if included, and core navigation without JavaScript.
7. Require CI build and validation on each PR; deploy the integrated stack only after all selected requirements pass.
8. Preserve custom-domain configuration and record the last known-good deployment for rollback.

The final implementation DAG and stacked PR boundaries should follow the locked content schema, theme contract, and visual decisions.
Do not start independent page implementations before those contracts are shared.
