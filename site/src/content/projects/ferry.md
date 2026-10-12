---
title: "Ferry"
description: "Two-way data mapping for Go structs: load from a source and dump to a sink."
tags: ["go", "configuration", "libraries"]
links: {"source": "https://github.com/onhotpath/ferry"}
featured: true
---

Ferry uses one annotated Go struct and one tag grammar for reading and writing data.
The same configuration type can load from environment variables or YAML and write back through a driver that supports dumping.

## Approach

A shared schema describes the struct's addresses and conversion rules.
Drivers connect that schema to individual data sources and sinks.
This keeps source-specific knowledge out of application code while preserving the same model across both directions.

## Related writing

- [Ferry: xload Learns to Write](/2026/08/12/ferry-xload-learns-to-write)
- [What the Windows Registry Taught Me](/2026/08/12/what-the-windows-registry-taught-me)
