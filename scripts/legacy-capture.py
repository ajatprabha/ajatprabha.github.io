#!/usr/bin/env python3
"""Capture migration evidence from an actual built Jekyll publication."""
import argparse
import hashlib
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote
import xml.etree.ElementTree as ET


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.canonical = None
        self.headings = []
        self.media = []
        self.dates = []
        self.tags = []
        self.heading = None
        self.title = None
        self.reading_title = False
        self.in_content = False
        self.content_depth = 0
        self.disqus = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonical = attrs.get('href')
        if tag == 'div' and 'kg-card-markdown' in attrs.get('class', '').split():
            self.in_content = True
            self.content_depth = 1
        elif self.in_content and tag == 'div':
            self.content_depth += 1
        if tag == 'h1' and 'post-full-title' in attrs.get('class', '').split():
            self.title = ''
            self.reading_title = True
        if self.in_content and tag in ('h1', 'h2', 'h3', 'h4', 'h5', 'h6'):
            self.heading = {'level': int(tag[1]), 'id': attrs.get('id'), 'text': ''}
        if self.in_content and tag in ('img', 'video', 'source'):
            self.media.append({'element': tag, 'src': attrs.get('src'), 'poster': attrs.get('poster')})
        if tag == 'time' and attrs.get('datetime'):
            self.dates.append(attrs['datetime'])
        if tag == 'a' and attrs.get('href', '').startswith('/tag/'):
            self.tags.append(attrs['href'])

    def handle_endtag(self, tag):
        if tag == 'h1':
            self.reading_title = False
        if self.heading and tag == 'h' + str(self.heading['level']):
            self.heading['text'] = self.heading['text'].strip()
            self.headings.append(self.heading)
            self.heading = None
        if self.in_content and tag == 'div':
            self.content_depth -= 1
            if self.content_depth == 0:
                self.in_content = False

    def handle_data(self, data):
        if self.reading_title:
            self.title += data
        if self.heading:
            self.heading['text'] += data


def capture(root):
    posts = []
    for path in sorted(root.glob('[0-9][0-9][0-9][0-9]/*/*/*.html')):
        page = Page()
        page.feed(path.read_text())
        posts.append({'output': str(path.relative_to(root)), 'canonical': page.canonical, 'title': page.title,
                      'displayDates': page.dates, 'headings': page.headings,
                      'media': page.media, 'tagRoutes': sorted(set(page.tags))})
    feeds = {}
    for name in ('feed.xml', 'atom.xml'):
        tree = ET.parse(root / name)
        ns = {'a': 'http://www.w3.org/2005/Atom'}
        entries = tree.findall('a:entry', ns) if name == 'feed.xml' else tree.findall('./channel/item')
        get = lambda entry, key: entry.findtext('a:' + key, namespaces=ns) if name == 'feed.xml' else entry.findtext(key)
        feeds[name] = [{'title': get(e, 'title'), 'id': get(e, 'id') if name == 'feed.xml' else get(e, 'guid'),
                        'published': get(e, 'published') if name == 'feed.xml' else get(e, 'pubDate'),
                        'url': e.find('a:link', ns).get('href') if name == 'feed.xml' else get(e, 'link')} for e in entries]
    routes = ['/' + str(p.relative_to(root)).removesuffix('index.html') for p in root.rglob('index.html')
              if not str(p.relative_to(root)).startswith(('assets/', '.git/'))]
    media = {str(p.relative_to(root)): hashlib.sha256(p.read_bytes()).hexdigest()
             for directory in ('assets/images', 'assets/videos') for p in sorted((root / directory).rglob('*')) if p.is_file()}
    return {'posts': posts, 'feeds': feeds, 'indexRoutes': sorted(routes), 'mediaSha256': media}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('output_directory', type=Path)
    parser.add_argument('--provenance', required=True)
    args = parser.parse_args()
    result = capture(args.output_directory)
    result['provenance'] = args.provenance
    print(json.dumps(result, ensure_ascii=False, indent=2))
