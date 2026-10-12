# Frozen preview module interfaces

Schemas and normalized view types live in `site/src/lib/schema.ts` and `types.ts`.
Content adapters expose `getWriting`, `getProjects`, `toArticleSummary` and `toProjectSummary` from `content.ts`.
Canonical helpers expose `articlePath`, `projectPath`, `tagSlug`, `tagPath` and `canonicalUrl` from `routes.ts`.
Dates remain validated ISO strings with explicit offsets; routes retain exact legacy paths.
Writing sorts newest first then stable ID; projects follow `data/site.ts` selected order then stable ID.

| Theme module | Typed props | Slots |
| --- | --- | --- |
| SiteShell | site, navigation, metadata, optional activeSection | default, head, footer |
| HomeLayout | none | intro, projects, writing, note |
| IndexLayout | none | intro, controls, entries, pagination |
| ArticleLayout | article: ArticleSummary | default body, metadata, outline, cover, related |
| ProjectLayout | project: ProjectSummary | default body, metadata, preview, related |
| ArticleRow | article: ArticleSummary, optional headingLevel: 2 or 3 | none |
| HomeHero | image: Cover, title, optional headingLevel: 1 or 2 | default introduction, eyebrow, actions |
| FeaturedArticle | article: ArticleSummary, optional headingLevel: 2 or 3 | none |
| ArticleCard | article: ArticleSummary, optional headingLevel: 2 or 3 | none |
| ProjectCard | project: ProjectSummary | default |

The theme does not query content or infer slugs.
Routes compose metadata, optional previews, outlines and related sections through named slots.
The normalized preview discriminant is image, diagram, or none.
Metadata accepts title, description, canonical, optional image/noindex/publishedAt/updatedAt/type.
Theme refinement may add focused primitives using the finite visual vocabulary of the approved specification.
Contract changes require foundation owner coordination and affected callers must be verified together.
About is an ordinary Markdown collection with title and description, entry ID `profile`.
The theme-owned reference fixture receives an article summary and the rendered Markdown body through its default slot.
The coordinator-owned reference route is gated by `THEME_REFERENCE=1` during review builds and remains excluded from normal production output.

Image alt is required, with an empty string permitted for decorative images redundant with nearby context.
Informative images require meaningful descriptions supplied by the content author.

Identity layouts and PageIntro accept a finite `headingLevel: 1 | 2`, defaulting to 1 for ordinary pages.
The review route provides its own single h1 and composes identity demos with level 2.
ArticleRow and ProjectCard accept `headingLevel: 2 | 3`, defaulting to 3 for entries beneath titled sections.
Index and archive callers use level 2 for entries immediately beneath the page introduction.

The image-led review retains original cover assets on the homepage, writing grids, archive thumbnails and related stories.
`HomeLayout` places intro, writing, projects and note in that order.
Routes own `article-card-grid` composition and choose entries, while individual cards own their media and metadata presentation.
`ArticleMedia` and `ArticleDetails` are internal shared primitives, not exported theme APIs.
Image links are hidden from the accessibility tree and keyboard order because each card's title is its descriptive navigation link.
Missing covers produce a deliberate text card rather than placeholder artwork.
The hero and page identity are centered, and prose remains left-aligned within a centered reading column.
The article cover slot and direct rich body blocks use the wider centered page frame.
The outline is a centered native disclosure; no asymmetric reading rail narrows or shifts prose.

The reading body resolves its ordinary text measure to a shared `42.5rem` length.
Headings, paragraphs, lists and rules inherit that same length rather than recomputing a `ch` measure against each element's font.
Rich media keeps the wider page frame, and blockquote surfaces extend four rem beyond the text measure while containing their prose.
