# Field journal theme

Import the focused layouts and primitives from `src/theme/index.ts`.
Normalized props live in `src/lib/types.ts`; routes provide all data and select their own records.
Layouts use named slots for optional metadata, outlines, previews and related content.
Optional regions are omitted by leaving the slot empty.
The reference fixture composes article and project layouts using the same Metadata piece.
It also renders an ordinary text-only project with no preview or related section.

## Styling and extension

`styles/tokens.css` owns semantic colors, typography, spacing, width, radius and motion.
`global.css` owns shell, layouts and focused entries.
`prose.css` owns Markdown media, code, galleries and tables.
All ordinary pages share this presentation, including historical HTML media.
Use documented finite variants from the approved field journal specification.
Add a variant only for a repeated, concrete presentation need and demonstrate it on ThemeReference before public use.
Keep factual metadata, collection access, URL construction and content selection outside the theme.

## Fonts and color mode

Fonts are self-hosted WOFF2 with real normal and italic faces, `font-display: swap`, stable system fallbacks and full licenses.
See deployed `public/fonts/README.md` for the pinned upstream revision and hashes.
The prepaint script restores valid explicit light/dark preference.
System preference is implemented in CSS and responds automatically when the system changes.
Without JavaScript the system preference and all navigation remain available; the inactive preference control is hidden.
Storage failures leave the current selection usable for the page.

## Preview checks

```sh
PATH=/tmp/ajat-node24/bin:$PATH npm --prefix site run check
PATH=/tmp/ajat-node24/bin:$PATH npm --prefix site run build:review
PATH=/tmp/ajat-node24/bin:$PATH npm --prefix site run validate:output
```

`/theme-reference/` is review-only, omitted from normal production builds and excluded from indexing.
Its projects are explicitly review fixtures and never loaded into real project collections.
Keyboard, mobile, desktop, light/dark and no-JavaScript acceptance are exercised against the integrated preview.
