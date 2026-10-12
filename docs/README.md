# Personal site migration planning

The site will move from Jekyll and Jasper2 to static Astro with an owned, compact engineering field journal theme.
Writing stays in Markdown in Git and publishing stays on GitHub Pages.
This phase provides the design and implementation plan for review; it does not implement or deploy the migration.

## Review order

1. Read the [field journal theme specification](design/field-journal-theme.md) for the selected visual direction, theme contract, and reviewable design defaults.
2. Read the [migration inventory](research/migration-inventory.md) for existing content, route, media, feed, and integration risks.
   Read the [launch decisions](design/launch-decisions.md) for the user's finalized feature scope, six projects, and sourced About copy.
3. On the next planning stack layer, read `docs/plans/astro-migration.md` for the task DAG, ownership, proposed commands, implementation PR stack, verification, and rollback.

The execution plan is added by the second planning PR; its link becomes available when that layer is included.
Future implementation begins after the planning/design PRs have been reviewed.
The planning stack is separate from the future implementation stack.

## Decisions

| Item | Decision | Status |
| --- | --- | --- |
| Framework | Astro static output | Selected |
| Authoring | Markdown in Git; no CMS | Selected |
| Hosting | GitHub Pages and existing custom domain | Selected |
| Theme ownership | Compact owned theme; no external theme fork | Selected |
| Architecture | Composability across UI, content, routing, integrations, and tooling | Required |
| Visual direction | Engineering field journal, balanced writing and projects | Selected |
| Delivery | Planning/design PRs first | Selected |
| Initial typography | IBM Plex Sans headings/UI, Source Serif 4 prose | Selected for first draft |
| Palette | Warm paper, forest, restrained rust | Selected for first draft |
| Color modes | Coordinated light/dark, system preference plus explicit override | Selected for first draft |
| Launch features | RSS; no newsletter signup, analytics, search, or public comments | Selected |
| Code embeds | Local attributed syntax-highlighted blocks | Selected |
| Launch signature | Small static SVG diagram motifs; no required artwork or demos | Design default for PR review |

Planning documents distinguish these defaults from user-selected requirements.
Exact dependency versions and runtime compatibility are verified and pinned during the foundation task.
Old research files and local Lavish exports are working references, not production site sources.

## Prototype archive

The three-direction prototype is preserved on [prototype/field-journal-options](https://github.com/ajatprabha/ajatprabha.github.io/tree/prototype/field-journal-options/.lavish).
It records the visual alternatives and the selected engineering field journal direction.
Its code and alternative fonts are excluded from the planning PRs and must not be copied into production.
See that branch's README for the local preview command.
