#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["Pillow>=10,<13"]
# ///
"""Composite gopherkon's aligned PNG layers in the upstream drawing order."""

import argparse
import json
from pathlib import Path
import subprocess

from PIL import Image


DEFAULTS = {
    "ears": "normal",
    "torso": "normal",
    "hair": "none",
    "eyes": "normal_up",
    "extras": "none",
    "mouth": "none",
    "teeth": "classical",
    "undernose": "normal",
    "nose": "oval",
    "tattoo": "none",
    "hat": "none",
    "accessory": "none",
    "eyewear": "none",
    "pose": "dunno",
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="Upstream gopherkon checkout")
    parser.add_argument("output", type=Path, help="Output PNG path")
    parser.add_argument("--color", default="100", help="Existing color filename without .png")
    parser.add_argument("--set", action="append", default=[], metavar="LAYER=VARIANT")
    args = parser.parse_args()
    if args.output.suffix.lower() != ".png":
        parser.error("output must have a .png extension")

    selections = dict(DEFAULTS)
    for assignment in args.set:
        layer, sep, variant = assignment.partition("=")
        if not sep or layer not in selections or not variant:
            parser.error(f"invalid layer assignment: {assignment}")
        selections[layer] = variant

    sprites = (args.source / "sprites").resolve()
    if not sprites.is_dir():
        parser.error(f"source has no sprites directory: {args.source}")
    resolved = []
    for layer, variant in selections.items():
        if variant == "none":
            continue
        relative = Path(layer) / (f"{variant}/{args.color}.png" if layer in ("ears", "torso") else f"{variant}.png")
        sprite = (sprites / relative).resolve()
        if not sprite.is_relative_to(sprites) or not sprite.is_file():
            parser.error(f"sprite not found or outside source: {relative}")
        resolved.append(sprite)

    canvas = Image.new("RGBA", (490, 570), (0, 0, 0, 0))
    for sprite in resolved:
        with Image.open(sprite) as image:
            # Canvas drawImage clips layers at the native canvas boundaries.
            image = image.convert("RGBA")
            image = image.crop((0, 0, min(490, image.width), min(570, image.height)))
            canvas.alpha_composite(image, (0, 0))

    try:
        revision = subprocess.check_output(
            ["git", "-C", str(args.source), "rev-parse", "HEAD"], text=True, stderr=subprocess.DEVNULL
        ).strip()
    except (OSError, subprocess.CalledProcessError):
        revision = None
    args.output.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(args.output)
    manifest = {
        "upstream": "https://github.com/quasilyte/gopherkon",
        "revision": revision,
        "license": "CC0-1.0",
        "credit": "Based on original artwork by Renee French",
        "canvas": [490, 570],
        "color": args.color,
        "selections": selections,
        "sprites": [str(path.relative_to(sprites.parent)) for path in resolved],
    }
    args.output.with_suffix(".json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(args.output)


if __name__ == "__main__":
    main()
