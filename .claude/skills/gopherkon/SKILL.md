---
name: gopherkon
description: Create tailored Go gopher mascots with quasilyte/gopherkon for blog heroes, diagrams, avatars, and illustrations. Use when the user names gopherkon or wants its mix-and-match gopher artwork. Supports PNG sprites and PNG export; SVG scenes can embed the raster artwork.
---

# Gopherkon

Use [quasilyte/gopherkon](https://github.com/quasilyte/gopherkon) to assemble Go gophers from aligned PNG sprites.
The upstream tool is a static browser application, not a Go package or command-line tool.
It renders a transparent 490 x 570 canvas and offers **Download PNG**.
It has no SVG assets or vector export.

## Get the source

Clone the upstream into a temporary or cache directory, outside the project's working tree.
Record its commit for reproducibility.
The workflow below was verified against commit `61853e6fe6b303303e19c2d7ecd4174447ce2f10`.

```sh
git clone https://github.com/quasilyte/gopherkon /tmp/gopherkon
git -C /tmp/gopherkon rev-parse HEAD
```

The existing `app.js` runs without a build step.
For the browser constructor, serve the source and open the local URL with the session's browser tools.

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory /tmp/gopherkon
```

Select colors, facial features, accessories, and poses.
Save the share URL and download the PNG.
For source changes, edit `app.ts`, then regenerate `app.js` with TypeScript instead of editing compiled JavaScript.

## Reproducible local export

Use [scripts/render.py](scripts/render.py) to composite sprites without browser automation.
The helper needs `uv` with network access for Pillow, or Python with Pillow already installed.
The helper is bundled with this skill; it is not an upstream CLI.
Replace `SKILL_DIR` below with this skill's directory.

```sh
uv run "$SKILL_DIR/scripts/render.py" /tmp/gopherkon /tmp/dns-gopher.png \
  --color 100 --set eyes=confused --set pose=thinking.magnifier

uv run "$SKILL_DIR/scripts/render.py" /tmp/gopherkon /tmp/app-gopher.png \
  --color 40 --set eyes=happy --set pose=right_holding.wrench
```

Inspect available variants with `rg --files /tmp/gopherkon/sprites`.
Use `--set layer=variant` for ears, torso, hair, eyes, extras, mouth, teeth, undernose, nose, tattoo, hat, accessory, eyewear, and pose.
Use `--set hat=none` to omit a layer.
The color number selects an existing PNG; it is not a hue value or arbitrary CSS color.
Body and ear variants use the selected color.
Defaults match the upstream constructor.
The helper writes a PNG and a `.json` sidecar with the source revision and selected sprites.

## Compose the requested artwork

Inspect existing hero images for size, palette, framing, and text conventions.
Choose expressions and props that support the post's subject.
Keep props sparse so the mascot remains readable at thumbnail size.
Prefer direct PNG output when it satisfies the request.
Use a scene composition only when the final artwork needs a background, labels, or multiple mascots.

For an SVG-first scene, embed the generated PNG as a data URI inside the SVG.
Build labels, shapes, arrows, and the background with native SVG elements.
Keep the SVG source and export the final PNG or WebP with the project's available rasterizer.
Explain that the scene is SVG while its gopher artwork is raster.
For a request that requires fully vector gophers, draw original vectors instead of claiming gopherkon can export them.
Avoid enlarging these sprites far beyond their native resolution.

Inspect the mascot and final hero visually.
Verify dimensions, transparency, cropping, text readability, and the post's image reference.
Do not add dependencies to the blog just to create an asset.

## Attribution

The upstream [LICENSE](https://github.com/quasilyte/gopherkon/blob/master/LICENSE) is CC0 1.0 Universal.
Its README credits the original artwork to Renee French.
Record the project, commit, selected sprites, and credit in an asset source note or the helper's sidecar.
Use generic props unless the user requests a particular brand or character.
