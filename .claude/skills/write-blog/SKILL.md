---
name: write-blog
description: Write, revise, or review a blog post for this Jekyll site in Ajat's voice and style. Use whenever the user wants to draft a new post, announce a library or project, rework a section of an existing post, or audit a draft before publishing - even if they don't say "blog" explicitly (e.g. "write something about X", "announce ferry", "review this draft"). Encodes the repo's mechanics, the post structure that works, and hard-won taste rules about voice, evidence, and AI-tell language.
---

# Writing a blog post for ajatprabha.github.io

This skill captures the author's taste, learned through a long feedback loop on a real post.
The rules below are not generic writing advice; each one exists because its violation was specifically flagged.
When in doubt, the test is always: **would a reader care, or does this only prove the author kept receipts?**

## Repo mechanics

- Posts live in `_posts/YYYY-MM-DD-slug.md`. Jekyll + Casper theme.
- Frontmatter template (match exactly, including two spaces after `cover:`):

```yaml
---
layout: post
current: post
cover:  assets/images/<image>.jpg
navigation: True
title: '<title>'
date: YYYY-MM-DD 01:00:00
tags: [golang]
class: post-template
subclass: 'post tag-golang'
author: ajatprabha
---
```

- `subclass` mirrors the primary tag by hand (`post tag-<tag>`). Keep in sync with `tags:`.
- Cover images: 1440x900 JPEG, flat in `assets/images/`. Go posts use gopher-illustration covers; match the proportions of the canonical Go gopher (one bean-shaped mass, all head, huge separated eyes, stubby limbs) if drawing new ones.
- Internal links to older posts use the permalink style `/YYYY/MM/DD/slug` (check `_config.yml`).
- Local preview: `make start` (Docker; the container needs `--force_polling` for hot reload because inotify does not cross the VM mount). Verify the served page, not just the file.

## Source formatting

- Never use an em dash. Use "-" instead. Check with grep before finishing: `grep -c '—' <file>` must be 0.
- Put each sentence on its own line in the Markdown source.
- Fenced code blocks always carry a language tag (` ```go `, ` ```yaml `, ` ```text `).
- Use `---` for horizontal rules consistently, not `___`.
- Emoji: one per `##` heading is the house style for technical posts, used sparingly. A single laughter emoji on a self-deprecating joke is fine. No emoji strings.

## Structure that works

1. **Hook in the first five lines.** Before the first scroll the reader must know: what the thing is, why it exists, and one arresting line they will remember. Long wind-ups get cut in review, so do not write them.
2. **Short paragraphs, visual variety.** 1-3 sentences per paragraph. Bold lead-in phrases for bullet runs. Numbered lists when items are genuinely ordered, tables for enumerable facts (a driver matrix, a benchmark), blockquotes for the one-line pitch and for punch lines worth setting apart.
3. **Motivate before mechanism.** Never present a mechanism and then explain why it matters. State the need in reader terms first ("sometimes you want a new word in the tags, not a new backend"), then the mechanism, then a concrete payoff.
4. **Examples are before/after, cause and effect.** The strongest example shows the input, the small code that acts, and the output with the differences visible (a YAML file before and after, with comments and unmapped keys surviving). Wiring/setup calls are weak examples; effects are strong ones.
5. **Named callbacks, not numbered ones.** If an early list is referenced later, name the item ("the third job, persisting what the user changed"), never "need three" - readers will not scroll back to decode a private index.
6. **Self-deprecating humor: one well-placed hit.** Set up the joke once (ideally in the intro, as a blockquote), and at most one short callback later. Never run a joke at full length twice.
7. **Length: target 2,000-2,500 words of prose.** Posts grow silently across editing passes; recount after every pass. Fenced blocks read fast, prose does not.
8. **Close with links, an invitation, and credits.** Credits go in a final blockquote after a rule. Credit people generously and by name, but keep job titles out unless asked. Frame v0/experimental status as an invitation: try it, tell me where the design fails, that decides v1.

## Voice: what this author sounds like

Casual, first-person, direct. A competent engineer writing quickly - not prose that admires itself.

- Plain statements over cleverness. If a sentence exists only to sound quotable, delete it.
- Concessions are stated honestly and briefly ("I could have hand-written that migration. It would have been fine.").
- Strictness gets softened by explaining where the knowledge belongs, not by apologizing.
- One or two approved hook couplets per post maximum (e.g. an "is not X, it is Y" construction). More than that is a tic.

## The AI-tell ban list

These patterns were each specifically flagged as "this gives the post away as AI-written". Hunt for them before calling any draft done:

- **Meta-commentary about the writing itself.** "Every fact below is...", "I am writing this down because...", "worth reading twice", "here is that sentence cashed", "I should be upfront about...". A human just says the thing.
- **Minted aphorisms.** "Inheritance is a property; assertion is a habit." If a factual claim hides inside one, keep the fact in plain words and delete the coin.
- **"X is not Y, it is Z" more than twice per post.** Flatten the rest.
- **Portentous one-line paragraphs** that exist only for drama. Keep one-liners that do structural work ("The file changes, your struct updates."), cut the poses.
- **A sentence explaining why the previous sentence was good.**
- **Methodology self-narration.** "I probed every claim against a real installed system", "one hypothesis got retracted when measured". The facts carry themselves; the evidence log does not belong in the post.
- **Timeline archaeology.** No commit-message quotes, no timestamps, no "day 5 was 60 commits" ledgers. Tell the arc (design first, then the engine in a day); keep only counts that land a point.
- **Repo-internal citations.** No "ADR-0003 says" in technical prose. State the claim directly or as "a rule I set on day one". Exception: a section where the design-record process IS the story may name ADRs, spelled out once.
- **Word-tics.** Count "rather than" (and similar crutches) - more than ~5 per post reads as generated. Vary or cut.

## Numbers and evidence

- **Humanize run-tallies.** "258/42 over 300 runs" means nothing to a reader; "roughly one run in seven comes back with the other value" lands, and says why it matters (frequent enough to bite, rare enough that tests pass).
- **Explain the shape of a problem before any measurement.** A minimal concrete example the reader can hold (two struct fields that spell the same key), the consequence in words, then the landscape, then the numbers as support. Never open with a comparison table.
- **Quote real error messages.** One verbatim refusal is worth a paragraph of description.
- **Every fact verified against the source of truth at write time.** Check `origin/main`, not a possibly-stale local checkout. Compile-verify code examples; run them end-to-end if the claims are behavioural. Regenerate statistics (LOC, commits, coverage) at publish time and anchor them to a date ("as of 10 August"). Only publish claims you can re-derive; soften the rest (a coverage gate you can point at beats a percentage you cannot).
- **Honesty must be checkable.** Publish losses next to wins. Never state an omission reason that one click can falsify; if numbers are omitted, admit the loss exists and point at the full table.
- **Benchmarks-adjacent prose:** verify multipliers against the table in the same section ("order of magnitude" when the table says 1.5x will be caught).

## Talking about other people and their libraries

- Do not impute intent ("quietly skips durability" becomes "does not fsync"). Criticize behavior, factually, and only with a measurement behind it.
- If you co-maintain a library you are criticizing, say so and own the fix ("since I help maintain xload, that one is mine to fix upstream"). Candour converts a dig into maintenance.
- People being credited or tagged in the announcement read the post; audit every sentence near their name.

## Talking about private projects

When a post's motivation comes from a non-public project:

- One approved anonymized surface, reused verbatim: describe the class of system, never the domain, name, stack, file paths, env var names, or issue numbers.
- **Past-and-closed framing for weaknesses.** Never state in present tense that a shipping product is currently weak ("its config had been living in a YAML file... moving it to the registry is what closed that"). "Untested" style criticism gets the same treatment ("not covered by any test at the time").
- Security lessons must stand on public documentation (OS API semantics), stated generically, never attributable to the product.
- Do not claim the private project has adopted the new thing unless it has; "I am now moving it onto X" is the honest form.

## Workflow

1. **Research before drafting.** Read 1-2 existing posts for voice. Verify every library fact against its repo's `origin/main`. If the post succeeds an earlier post/library, read that post and state the succession explicitly.
2. **Draft against this skill**, then do a dedicated pass for the AI-tell ban list - it catches things drafting does not.
3. **Read it as a first-time reader.** Anything explained after it is used, any private index, any section that is "all over the place" gets restructured motivate-first.
4. **Adversarial audit before publishing.** A fresh reviewer (not the drafting context) verifying: facts vs repo, anonymization, residual AI-tells, link/rendering mechanics, and anything that would embarrass on a widely-shared thread. Present findings to the author as adopt/reject choices - do not silently apply.
5. **Verify the rendered page** locally (cover loads, links resolve, fences highlight) before calling it done.
