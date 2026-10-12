# Font provenance

Both families are downloaded from Google Fonts revision `bd8f81ddb5c74d5c8897b36ad88b440266245103`.
The normal and real italic variable TTF files and complete OFL notices come from that same revision.
WOFF2 conversion uses fonttools 4.61.1 and brotli 1.2.0.
Latin, extended Latin, punctuation, currency, arrows and Unicode minus are preserved.
Source Serif optical-size and weight axes and IBM Plex width and weight axes remain available.
No prototype font assets are used.

Source paths: `ofl/ibmplexsans/` and `ofl/sourceserif4/` in [google/fonts](https://github.com/google/fonts/tree/bd8f81ddb5c74d5c8897b36ad88b440266245103/ofl).

The IBM Plex Sans subset is internally named Field Journal Sans because the upstream license reserves the name Plex.
The glyph designs, variable axes and real italics remain IBM Plex Sans.
Source Serif 4 declares no reserved name in the fetched license.
This follows the [OFL modification requirements](https://openfontlicense.org/how-to-modify-ofl-fonts/).

| Deployed file | SHA-256 |
| --- | --- |
| field-journal-sans-latin-italic.woff2 | `3eced4930337f9c93614b1bbaa83b9b00ccd96e3509df14afa1852ff674222e6` |
| field-journal-sans-latin.woff2 | `0cacbb386ca8e597c3f677b18d638dcfbd48a1d70971607f98d5918364e8afab` |
| ibm-plex-sans-OFL.txt | `7e6b2818edbd8f6a01ae80641cc8f16a51080d08fb4e532be3a0b6f74adb07da` |
| source-serif-4-OFL.txt | `5f94c3fd3a23131a417ab5a0c8452de57e70c3cfb9f604d88241f7065ebf9fd9` |
| source-serif-4-latin-italic.woff2 | `7e1bc73e4310b41868cdb2e1722fc71a54f3f5b4b6f48e946444a5c5b11c169b` |
| source-serif-4-latin.woff2 | `b7f956bbec0a69986cc670295584260c1e0cf5ea4434bc9dfaec568f51ae82d1` |

To regenerate, create an isolated Python environment with `fonttools==4.61.1` and `brotli==1.2.0`, then run `python site/scripts/prepare-fonts.py`.
Regeneration is optional maintenance tooling; normal installation and build use committed WOFF2 assets without network font downloads.
