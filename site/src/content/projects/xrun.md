---
title: "xrun"
description: "Lifecycle management for long-running Go components."
tags: ["go", "services", "libraries"]
links: {"source": "https://github.com/gojekfarm/xrun"}
featured: true
---

xrun manages the lifecycle of long-running components such as HTTP servers and background workers.
It provides tools for coordinating their startup and shutdown inside a Go service.

## Approach

Components expose their lifecycle through a shared interface.
A manager coordinates them, helping keep service lifecycle handling separate from the components' own work.
The repository credits the Kubernetes controller-runtime manager as the source of modified manager code.

## Related writing

- [Introduction to xrun](/2023/05/24/intro-xrun-package-managing-component-lifecycle-go)
