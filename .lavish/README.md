# Archived theme direction prototype

This throwaway prototype compares three coordinated personal-site systems using existing project and article content.
It is preserved on the prototype branch and must not be promoted into the production application.
The user selected the engineering field journal direction and an owned compact Astro theme.
The production implementation must follow the reviewed theme specification and migration plan.

Run from this branch's repository root:

```sh
python -m http.server 4388 --directory .lavish
```

Open http://localhost:4388/prototype-theme-choices.html?variant=A.
Variants A, B, and C are shareable query parameters.
The bottom controls also switch between home and article samples and light/dark palettes.
No data is persisted and no application mutations are connected.

All included fonts have their original OFL notices under choice-fonts/.
The source font files in this prototype are TrueType; production should self-host only the selected fonts in WOFF2.
The prototype's supporting copy and Go snippet are illustrative, not a publication-ready article or verified library usage example.
