#!/usr/bin/env python3
"""Compare real legacy output to the reviewed publication through capture interface."""
import argparse
import importlib.util
import json
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('output', type=Path)
args = parser.parse_args()
module_path = Path(__file__).with_name('legacy-capture.py')
spec = importlib.util.spec_from_file_location('legacy_capture', module_path)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
expected = json.loads((Path(__file__).parent.parent / 'docs/migration/legacy/published-manifest.json').read_text())
actual = module.capture(args.output)
for key in ('posts', 'feeds', 'indexRoutes', 'mediaSha256'):
    if actual[key] != expected[key]:
        raise SystemExit(f'Legacy publication parity failed: {key}')
print('Legacy publication parity passed: posts, feeds, archives and media hashes.')
