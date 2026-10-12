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
| ArticleLayout | article: ArticleSummary | default body, metadata, outline, related |
| ProjectLayout | project: ProjectSummary | default body, metadata, preview, related |
| ArticleRow | article: ArticleSummary | none |
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
