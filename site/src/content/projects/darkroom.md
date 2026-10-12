---
title: "Darkroom"
description: "An image proxy built around composable storage and image processing interfaces."
tags: ["go", "images", "infrastructure"]
links: {"source": "https://github.com/gojek/darkroom"}
featured: true
---

Darkroom processes images on demand instead of requiring a separate image for every size and platform.
It combines a storage backend with an image processor behind an HTTP image proxy.

## Approach

Storage and processing use separate interfaces, so a custom backend or processor can reuse the rest of the server.
The project supports image operations such as resizing and cropping, and exposes metrics through Prometheus and StatsD.

My writing follows the image service work from internship experiments through a Kubernetes operator and API server for deploying Darkroom.

## Related writing

- [Exploring Golang and the image service](/2018/06/03/second-week-at-gojek)
- [Writing a Kubernetes operator with an API server](/2020/06/24/k8s-operator-with-api-server-for-gui)
