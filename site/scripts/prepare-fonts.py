#!/usr/bin/env python3
"""Rebuild pinned OFL WOFF2 assets. Requires fonttools==4.61.1 brotli==1.2.0."""
import re
import tempfile
from pathlib import Path
from urllib.request import urlretrieve
from urllib.parse import quote
from fontTools import subset

REVISION = 'bd8f81ddb5c74d5c8897b36ad88b440266245103'
DEST = Path(__file__).parent.parent / 'public/fonts'
UNICODES = 'U+0000-024F,U+1E00-1EFF,U+2000-206F,U+20A0-20CF,U+2100-214F,U+2190-21FF,U+2212,U+FEFF,U+FFFD'
DEST.mkdir(parents=True, exist_ok=True)
with tempfile.TemporaryDirectory(prefix='ajat-fonts-') as directory:
    for family, label in [('ibmplexsans', 'field-journal-sans'), ('sourceserif4', 'source-serif-4')]:
        upstream = f'https://raw.githubusercontent.com/google/fonts/{REVISION}/ofl/{family}/'
        metadata = Path(directory) / 'METADATA.pb'
        urlretrieve(upstream + 'METADATA.pb', metadata)
        license_name = 'ibm-plex-sans' if family == 'ibmplexsans' else label
        urlretrieve(upstream + 'OFL.txt', DEST / f'{license_name}-OFL.txt')
        for filename in re.findall(r'filename: "([^"]+)"', metadata.read_text()):
            source = Path(directory) / filename
            urlretrieve(upstream + quote(filename), source)
            options = subset.Options()
            options.flavor = 'woff2'
            options.layout_features = ['*']
            options.name_IDs = ['*']
            options.name_legacy = True
            options.name_languages = ['*']
            font = subset.load_font(str(source), options)
            subsetter = subset.Subsetter(options=options)
            subsetter.populate(unicodes=subset.parse_unicodes(UNICODES))
            subsetter.subset(font)
            if family == 'ibmplexsans':
                # Respect IBM's reserved 'Plex' name in the modified subset.
                for record in font['name'].names:
                    if record.nameID in (1, 3, 4, 6, 16, 17):
                        name = record.toUnicode().replace('IBM Plex Sans', 'Field Journal Sans').replace('IBMPlexSans', 'FieldJournalSans')
                        record.string = name.encode(record.getEncoding())
            suffix = '-italic' if 'Italic' in filename else ''
            subset.save_font(font, str(DEST / f'{label}-latin{suffix}.woff2'), options)
