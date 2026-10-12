#!/usr/bin/env python3
"""Compare captured legacy output while preserving every historical media byte."""
import argparse
import importlib.util
import json
from pathlib import Path

module_path = Path(__file__).with_name('legacy-capture.py')
spec = importlib.util.spec_from_file_location('legacy_capture', module_path)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
capture = module.capture


def compare(expected, actual):
    """Require exact content/routes and historical media; return additive media paths."""
    for key in ('posts', 'feeds', 'indexRoutes'):
        if actual[key] != expected[key]:
            raise ValueError(f'Legacy publication parity failed: {key}')
    historical_media = expected['mediaSha256']
    current_media = actual['mediaSha256']
    for path, digest in historical_media.items():
        if path not in current_media:
            raise ValueError(f'Legacy publication parity failed: missing historical media {path}')
        if current_media[path] != digest:
            raise ValueError(f'Legacy publication parity failed: changed historical media {path}')
    return {
        'preservedMedia': len(historical_media),
        'additionalMedia': sorted(current_media.keys() - historical_media.keys()),
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    expected = json.loads((Path(__file__).parent.parent / 'docs/migration/legacy/published-manifest.json').read_text())
    try:
        report = compare(expected, capture(args.output))
    except ValueError as error:
        raise SystemExit(str(error)) from error
    additional = report['additionalMedia']
    print(f"Legacy publication parity passed: exact posts, feeds and archives; "
          f"{report['preservedMedia']} historical media hashes preserved; "
          f"{len(additional)} additional media files captured.")
    for path in additional:
        print(f'Additional media: {path}')


if __name__ == '__main__':
    main()
