---
title: "Tempogate"
description: "An OIDC provider and OAuth2 server for authentication in self-hosted Temporal."
tags: ["go", "authentication", "temporal"]
links: {"source": "https://github.com/onhotpath/tempogate"}
featured: true
---

Tempogate supplies the OIDC issuer needed to authenticate people and services in a self-hosted Temporal cluster.
It runs as a single binary.

## Approach

Browser sign-in federates to Google through OIDC.
Tempogate issues short-lived JWTs and publishes the signing keys through JWKS for Temporal's frontend to verify.
The same issuer supports machine authentication without a fork of Temporal Server or a sidecar proxy.

The repository includes command-line login and token tools, a Helm chart, and a SQLite-backed default state store.
Its README records the implemented authentication flows and authorization limitations.
