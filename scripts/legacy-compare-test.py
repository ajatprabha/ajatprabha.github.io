#!/usr/bin/env python3
"""Exercise preservation policy through actual HTML/XML/media artifact capture."""
import importlib.util
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('legacy_compare', Path(__file__).with_name('legacy-compare.py'))
legacy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(legacy)


class LegacyArtifactPreservation(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory(prefix='legacy-parity-test-')
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        self.article = self.root / '2020/01/01/original.html'
        self.article.parent.mkdir(parents=True)
        self.article.write_text('''<link rel="canonical" href="https://example.test/2020/01/01/original">
<h1 class="post-full-title">Original article</h1><time datetime="1 January 2020"></time>
<div class="kg-card-markdown"><h2 id="original-heading">Original heading</h2>
<img src="/assets/images/original.png"></div>''')
        (self.root / 'index.html').write_text('<h1>Archive</h1>')
        (self.root / 'feed.xml').write_text('''<feed xmlns="http://www.w3.org/2005/Atom"><entry>
<title>Original article</title><id>https://example.test/2020/01/01/original</id>
<published>2020-01-01T00:00:00Z</published><link href="https://example.test/2020/01/01/original"/>
</entry></feed>''')
        (self.root / 'atom.xml').write_text('''<rss version="2.0"><channel><item>
<title>Original article</title><guid>historical-item-id</guid><pubDate>Wed, 01 Jan 2020 00:00:00 +0000</pubDate>
<link>https://example.test/2020/01/01/original</link></item></channel></rss>''')
        self.media = self.root / 'assets/images/original.png'
        self.media.parent.mkdir(parents=True)
        self.media.write_bytes(b'original-image-bytes')
        (self.root / 'assets/videos').mkdir()
        self.baseline = legacy.capture(self.root)

    def compare_artifact(self):
        return legacy.compare(self.baseline, legacy.capture(self.root))

    def test_unchanged_artifact_preserves_originals(self):
        report = self.compare_artifact()
        self.assertEqual(report['preservedMedia'], 1)
        self.assertEqual(report['additionalMedia'], [])

    def test_new_svg_files_are_captured_without_changing_frozen_originals(self):
        for name in ('wordmark', 'mark'):
            (self.media.parent / f'{name}.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0h1"/></svg>')
        report = self.compare_artifact()
        self.assertEqual(report['preservedMedia'], 1)
        self.assertEqual(report['additionalMedia'], ['assets/images/mark.svg', 'assets/images/wordmark.svg'])
        self.assertNotIn('assets/images/mark.svg', self.baseline['mediaSha256'])

    def test_missing_original_fails_with_its_path(self):
        self.media.unlink()
        with self.assertRaisesRegex(ValueError, 'missing historical media assets/images/original.png'):
            self.compare_artifact()

    def test_changed_original_fails_with_its_path(self):
        self.media.write_bytes(b'changed-image-bytes')
        with self.assertRaisesRegex(ValueError, 'changed historical media assets/images/original.png'):
            self.compare_artifact()

    def test_changed_article_content_still_fails(self):
        self.article.write_text(self.article.read_text().replace('Original article', 'Changed title'))
        with self.assertRaisesRegex(ValueError, 'parity failed: posts'):
            self.compare_artifact()

    def test_changed_feed_identity_still_fails(self):
        feed = self.root / 'atom.xml'
        feed.write_text(feed.read_text().replace('historical-item-id', 'replacement-id'))
        with self.assertRaisesRegex(ValueError, 'parity failed: feeds'):
            self.compare_artifact()

    def test_changed_archive_routes_still_fail(self):
        (self.root / 'page2').mkdir()
        (self.root / 'page2/index.html').write_text('<h1>Another archive</h1>')
        with self.assertRaisesRegex(ValueError, 'parity failed: indexRoutes'):
            self.compare_artifact()


if __name__ == '__main__':
    unittest.main()
