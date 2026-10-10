# Field journal theme specification

Status: selected direction and theme ownership, with proposed design defaults for planning review.
Prepared 2026-10-10.
This document specifies the future theme; it does not implement application code or authorize production cutover.

## Decisions and defaults

The user selected a compact owned Astro theme, an engineering field journal identity, and a homepage balanced between writing and projects.
The user requested planning/design PRs before application implementation.
No external base theme or starter fork supplies the theme interface.

IBM Plex Sans with Source Serif 4, coordinated light/dark modes, and static SVG motifs are recommended defaults for review, rather than separately confirmed user choices.
Plain CSS custom properties and native Astro components are implementation defaults.
Do not add React, Tailwind, a component kit, client routing, or an animation library without a concrete requirement that justifies its maintenance cost.

The identity combines warm paper, forest ink, restrained rust details, clear rules, and occasional technical diagrams.
Use the same system for engineering, travel, DIY, and personal writing.
Avoid fake terminal furniture, dashboard density, mandatory project demos, and mandatory article cover art.

## Theme boundary and interface

Keep the theme in `site/src/theme/`, with tokens, global styles, components, layouts, and a small public export surface.
Keep content loading, routing, legacy URL mapping, feeds, project selection, and factual biography outside the theme.
Site routes adapt validated content into documented view props and compose theme layouts.
Theme components do not query collections, infer route slugs, or read arbitrary frontmatter.

| Interface | Inputs | Responsibility |
| --- | --- | --- |
| SiteShell | Site identity, navigation, page metadata, active section, content slot | Shared document, navigation, footer, fonts, color-mode initialization |
| HomeLayout | Intro slot, selected project summaries, recent article summaries, personal note slot | Balanced homepage composition |
| IndexLayout | Title, description, entry summaries, optional tag/navigation controls | Writing, projects, and compatible archive presentation |
| ArticleLayout | Title, publication date, optional updated date, tags, headings, related entries, body slot | Calm reading layout and optional TOC |
| ProjectLayout | Name, summary, optional status, verified links, optional preview, related writing, body slot | Consistent project context and detail |
| Content primitives | Typed props, finite variants, content slots where needed | Reusable media, entries, controls, and article presentation |

Define normalized summary types once and share them with routes.
Article summaries contain title, destination URL, date, optional excerpt, and tags.
Project summaries contain name, destination URL, summary, optional status, optional verified external links, and optional preview metadata.
Preview metadata uses a discriminated kind rather than arbitrary HTML or CSS.
Do not expose raw style props or open-ended variant strings as the theme API.

Shared site configuration controls identity, navigation, footer links, and optional features.
Publishing a normal article or project requires Markdown and metadata, without layout changes or agent-authored components.
MDX remains optional for a future article whose explanation benefits from a supported interactive component.

## Color tokens

Use the exact names below as CSS custom properties prefixed with `--color-`.
Components refer to semantic tokens rather than literal colors.
Dark mode changes token values rather than implementing a second set of component styles.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| canvas | #F7F6F1 | #171E1A | Page background |
| surface | #FFFFFF | #222C25 | Cards and media frames |
| surface-subtle | #ECEEE5 | #2B372E | Code and quiet secondary surfaces |
| text | #202925 | #EDF1E9 | Main text |
| text-muted | #626B62 | #AEB9AF | Dates, captions, secondary text |
| border-subtle | #D5DACF | #3A493E | Decorative section rules |
| border-control | #7A8877 | #718578 | Control boundaries when needed |
| accent | #28614D | #9AD2B4 | Links and primary interaction |
| accent-on | #FFFFFF | #171E1A | Text on accent backgrounds |
| accent-soft | #E2EDE4 | #283F32 | Quiet accent surfaces |
| motif | #9B5138 | #E3AA8C | Sparse decorative diagram details |
| focus | #28614D | #9AD2B4 | Visible focus outline |

Canvas contrast calculations are 13.81:1 and 14.84:1 for main text, 5.11:1 and 8.37:1 for muted text, and 6.68:1 and 9.90:1 for links in light and dark modes respectively.
These calculations are preliminary and do not replace checks of actual rendered surface combinations.
Validate text, button states, syntax highlighting, diagrams, and focus indicators on their actual backgrounds.
Subtle borders are decorative and must not be the sole indication of an interactive control.
Keep article links underlined so that meaning does not depend on color.

## Typography, spacing, and shape

| Role | Default |
| --- | --- |
| Headings, navigation, controls, project summaries | IBM Plex Sans, system sans fallback |
| Article prose and substantive personal narrative | Source Serif 4, Georgia fallback |
| Code and optional short technical metadata | System monospace |
| Prose size and leading | 18px on narrow screens, up to 20px on wide screens; line height about 1.65 |
| Main page heading | Responsive 36-64px; weight 500-600 |
| Interface text | 16px; secondary metadata no smaller than 14px |
| Article measure | About 68ch |
| General layout maximum | 70rem, approximately 1120px at the default root size |
| Spacing scale | 0.25rem, 0.5rem, 0.75rem, 1rem, 1.5rem, 2rem, 3rem, 4rem, 6rem |
| Shape | 0.375rem control radius, 0.75rem media/card radius; no routine floating shadows |
| Motion | 150ms standard interaction transition; movement optional and bounded |

Define font, space, radius, duration, and width tokens beside color tokens.
Do not use monospace for long prose or essential navigation.
Use heading hierarchy and whitespace before introducing another font size or color.
Keep narrative prose in the serif face and compact project facts in the sans face.
Enable optical sizing for Source Serif 4.

Self-host WOFF2 assets for the used language subsets and weights.
Ship real italic faces when article prose or interface content uses italics; do not rely on synthetic italics.
Set `font-display: swap`, provide stable fallbacks, and avoid preloading every weight or italic file.
Preload only fonts required for visible initial text after measuring their loading behavior.
Preserve complete font license notices with the deployed assets.

Both families have OFL licenses and variable fonts in primary Google Fonts metadata: [IBM Plex Sans](https://raw.githubusercontent.com/google/fonts/main/ofl/ibmplexsans/METADATA.pb) and [Source Serif 4](https://raw.githubusercontent.com/google/fonts/main/ofl/sourceserif4/METADATA.pb).
Fetch the complete license notices from the same pinned upstream revisions used to obtain each family's production font files.
The prototype archive contains reference notices, but its local font directory is not a production dependency or an assumed input in a fresh checkout.

## Components and finite variants

| Component | Supported variants or states | Contract |
| --- | --- | --- |
| PageIntro | home, compact | One heading, concise introduction, optional contextual links |
| Section | plain, ruled, surface | Shared section spacing and heading alignment |
| ContentEntry | article-row, project-card, featured | Uses normalized summary data; no mandatory image |
| ProjectPreview | diagram, image, none | Shared aspect/size constraints and optional caption |
| Figure | inline, wide, with-caption | Intrinsic dimensions, meaningful alt text, optional caption |
| Gallery | two-column, three-column | Same figure primitive; responsive grid, source order preserved |
| Video | landscape, portrait | Native controls, optional poster and caption-track metadata |
| CodeBlock | plain, highlighted | Shared colors, overflow behavior, optional copy control |
| Callout | note, warning, tip | Visible label, prose slot, meaning independent of color |
| TagLink | default, active | Actual navigation links with visible active state |
| Action | primary, quiet | Native anchor or button based on behavior |
| TableOfContents | rail, disclosure | Same heading data; keyboard-accessible links |
| ColorModeControl | system, light, dark | Labeled native control with persistent explicit choice |

Variant names are documented boundaries, not an invitation to generate new variants for individual pages.
Add a variant only when an actual repeated content requirement cannot fit an existing one.
A future demo variant must define loading, keyboard/touch interaction, reduced-motion behavior, and a static fallback before entering the public API.
No interactive demo is required at launch.

## Page structure and responsive behavior

The homepage starts with a brief identity statement and direct routes to Writing, Projects, and About.
Follow with selected projects and recent writing at comparable visual priority, then a short personal note and footer.
Do not turn the intro into a full-screen hero.
Use actual project names and verified descriptions; the design must not invent employment, outcomes, or metrics.

The writing index uses readable dated rows with title, optional excerpt, and modest tag context.
Tag and legacy author/archive pages use the same entry system.
The projects index uses cards with a concise description and optional shared preview.
Project detail pages contain purpose, approach, verified source/documentation links, substantive body content, and related writing.
Projects lacking artwork use a deliberate text presentation rather than a placeholder illustration obligation.

Article pages use one reading column for the title, metadata, and body.
At sufficiently wide viewports, an optional TOC occupies a separate rail without narrowing prose below a comfortable measure.
On narrow screens, the TOC becomes a native disclosure above the article body.
Allow wide figures inside the layout container while keeping ordinary prose at its reading measure.
Preserve heading anchors and scroll offsets when introducing any sticky navigation.

Use content-driven layout breakpoints, with approximately 48rem for multi-column indexes and 72rem for an article rail as initial defaults.
At 320px, all ordinary content and navigation fit without horizontal page overflow.
Use a wrapped visible navigation row if it fits; introduce a native disclosure menu only if real navigation density requires it.
Cards become a single column on narrow screens.
Never put essential information exclusively in hover content.

## Rich content and migration compatibility

The inventory includes long Go/YAML code, wide tables, SVG diagrams, HTML galleries, screenshots, and portrait/landscape native videos.
Validate the same theme against Ferry, Windows Registry, Kubernetes Operator, week-two Gojek, TDD, and DIY Sound System articles.
These are representative fixtures rather than reasons to create article-specific styling.

Normalize legacy galleries into one documented Markdown-compatible pattern during content migration.
Support that pattern through the same gallery CSS and figure rules as new content.
Remove or deliberately reconcile legacy inline widths, margins, and padding so that they do not override the new layout.
Do not impose fixed cropping on technical diagrams or screenshots.
Use intrinsic image dimensions to limit layout shift and lazy-load below-fold images.
Gallery images link directly to full-size assets when useful; a custom lightbox is not a launch requirement.

Code blocks and wide tables scroll within their own containers without widening the page.
Use readable code sizing, preserve whitespace, and avoid forced wrapping of code by default.
Syntax colors must be defined and checked for both modes.
Optional copy buttons remain enhancements and expose success through an accessible status message.
Tables retain semantic headers and a discoverable, keyboard-reachable scroll region when overflow occurs.
Existing code embeds are a content migration concern; the theme displays local code with provenance links rather than executing remote embed scripts.

Video uses native controls, `playsinline`, no autoplay, and conservative `preload="metadata"` or `none`.
Portrait video preserves its aspect ratio and receives a bounded maximum width/height so that it does not dominate the article.
Use provided captions or transcripts where available and flag missing alternatives during the content review rather than inventing transcripts.
Preserve existing asset URLs or use verified compatibility aliases.

## SVG identity

Use small static diagrams based on nodes, paths, annotations, and restrained ruled frames.
Use a consistent stroke scale, corner treatment, semantic tokens, and sparse rust accents.
Keep diagram linework out of the prose background.
Decorative SVGs are hidden from assistive technology; informative diagrams include an accessible name and a prose explanation of their meaning.
Project diagrams represent an actual verified idea rather than an invented architecture.
SVG motifs remain optional theme assets and never become a prerequisite for publishing.
This specification does not request AI artwork generation.

## Accessibility, motion, and color mode

Use semantic landmarks, one page-level heading, logical heading order, a skip link, native controls, and visible keyboard focus.
Keep interactive targets comfortably usable on touch, aiming for at least 44px where practical.
Related links, callouts, project status, and active navigation never communicate solely through color.
Check 200% text zoom, narrow viewport reflow, keyboard navigation, and both color modes against representative pages.
Provide meaningful alternative text for informative images and empty alternative text for decoration.

Limit routine transitions to color, opacity, or small nonessential movement around 120-180ms.
Optional explicit diagram interactions may use 240-300ms transitions after they become a defined variant.
Under `prefers-reduced-motion: reduce`, remove nonessential movement, transitions, and smooth scrolling.
Do not hide article text behind scroll-reveal effects or delay access with animated navigation.

With JavaScript disabled, select light/dark tokens through `prefers-color-scheme` and preserve all reading and navigation behavior.
With JavaScript enabled, a minimal inline head script reads a validated persisted preference before first paint and applies the document mode before styles render.
Handle unavailable storage without throwing, and allow only system/light/dark values.
An explicit choice overrides system preference; system mode continues to follow operating-system changes.
Use the CSS `color-scheme` property to coordinate native form controls and browser-rendered UI.
Show the mode control only when it can operate, or disable it with an accessible explanation.
Avoid a theme flash and avoid animating the initial mode application.
Accommodate the initializer in any future CSP rather than silently blocking it.

## Reference page and acceptance

Maintain a local theme reference page containing every supported component variant and meaningful state.
Include light/dark views, long titles, missing previews, empty related lists, keyboard focus, galleries, portrait video, wide tables, code, and a representative article section.
Use fixtures or clearly labeled examples rather than fabricated public project claims.
Keep the reference page out of public navigation and indexing; omit it from production output unless there is a deliberate reason to publish it.

Accept the theme only when home, writing index, article, project index/detail, and About share the same typography, tokens, spacing, and component system.
Publishing a new ordinary Markdown article or project must work without editing layouts or CSS.
Core pages remain usable without client JavaScript.
Validate exact asset paths, article fragments, rich-content readability, mobile reflow, both modes, focus, and reduced motion before cutover.
Review every new component or variant on the reference page before using it in production pages.

The [migration inventory](../research/migration-inventory.md) governs content compatibility evidence.
The [prototype archive](https://github.com/ajatprabha/ajatprabha.github.io/tree/prototype/field-journal-options/.lavish) preserves the earlier alternatives.
This specification is the selected design direction for planning review; prototype code is not a production theme dependency.
