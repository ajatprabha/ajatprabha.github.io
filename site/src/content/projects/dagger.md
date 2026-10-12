---
title: "Dagger"
description: "A typed Go DAG library for composing and executing steps."
tags: ["go", "workflows", "libraries"]
links: {"source": "https://github.com/ajatprabha/dagger"}
featured: true
---

Dagger models execution as a directed acyclic graph of typed steps.
Go generics carry a shared state type through the graph.

## Approach

Composition primitives cover sequential execution, conditional branches, and routines that continue while collecting errors.
Graph construction checks for cycles before execution.
Middleware adds concerns such as tracing, logging, and retries around steps.

The repository also includes graph visualization and tools for inspecting composed workflows.
This project is the Go library at `github.com/ajatprabha/dagger`.
