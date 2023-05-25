---
layout: post
current: post
cover:  assets/images/gophers.jpg
navigation: True
title: 'Introduction to xrun: A Flexible Package for Managing Component Lifecycles in Go'
date: 2023-05-24 01:00:00
tags: [golang]
class: post-template
subclass: 'post tag-golang'
author: ajatprabha
---

Hello, Go community! Today, I am excited to announce a Golang package I have been working on named `xrun`. This package provides a streamlined way of running multiple components, specifically long-running components like an HTTP server or background worker. In this blog post, I will walk you through the basic functionality of `xrun` and how it can help you manage your long-running components more efficiently.

# Introducing xrun

As the size and complexity of a Go service increase, managing the lifecycles of its various components becomes a daunting task. This post introduces `xrun`, a flexible and versatile Go package that simplifies this process, making it easier to reason about and manage your application's components.

The package provides a `Manager` struct that handles starting and stopping components, coordinating their lifecycles in a way that makes your application more maintainable and less prone to bugs.

The `Manager` works by starting each component in its own goroutine and waiting for them to either finish or fail. It also ensures that the stop signals are propagated in reverse order of the components' starting order, ensuring graceful shutdowns.

`xrun` is available at [github.com/gojekfarm/xrun](https://github.com/gojekfarm/xrun), and you can read the full documentation on [pkg.go.dev](https://pkg.go.dev/github.com/gojekfarm/xrun).

## Getting Started

Let's start by importing the `xrun` package:

```go
import "github.com/gojekfarm/xrun"
```

To illustrate how `xrun` works, let's create an instance of an HTTP server:

```go
import "net/http"

server := http.Server{Addr: ":9090"}
```

Next, create a new manager with `xrun.NewManager()`. Then use `m.Add()` to add the HTTP server to the manager:

```go
import (
	"github.com/gojekfarm/xrun"
	"github.com/gojekfarm/xrun/component"
)

m := xrun.NewManager()
_ = m.Add(component.HTTPServer(component.HTTPServerOptions{Server: &server}))
```

Finally, run the manager using `m.Run(ctx)`. If there is an error, the process will exit:

```go
import (
	"os"
	"os/signal"
)

ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
defer stop()

if err := m.Run(ctx); err != nil {
	os.Exit(1)
}
```

## Features of `xrun`

Now, let's dive into some features of `xrun`.

##### Component

The `Component` interface is the foundation of `xrun`. It allows you to start a component that will run until the context is closed or an error occurs:

```go
type Component interface {
    Run(context.Context) error
}
```

___

##### ComponentFunc

`ComponentFunc` is a helper that allows you to implement `Component` inline. It's perfect for writing custom components on the fly:

```go
type ComponentFunc func(ctx context.Context) error
```

___

##### Manager

The `Manager` type helps you to run multiple components and waits for them to complete. You can add components with the `Add()` method and run them with the `Run()` method:

```go
type Manager struct {
    // ...
}

func (m *Manager) Add(c Component) error {...}
func (m *Manager) Run(ctx context.Context) (err error) {...}
```

> Note: Since `Manager` has a `Run(context.Context) error` method, it is a `Component` in itself, and hence, it is possible to nest multiple `Manager(s)`.

## Creating and Using Components

A component in `xrun` is anything that implements the `Component` interface. This interface only requires a single method: `Run(context.Context) error`.

Here's an example of a basic component, a `ScheduledTask`:

```go
type ScheduledTask struct {
	Ticker *time.Ticker
	Task   func()
}

func (s *ScheduledTask) Run(ctx context.Context) error {
	for {
		select {
		case <-s.Ticker.C:
			s.Task()
		case <-ctx.Done():
			return nil
		}
	}
}
```

In the main function, you create a manager and add your components to it:

```go
m := xrun.NewManager()

tick := time.NewTicker(1 * time.Second)
task := func() { fmt.Println("Task executed") }
s := &ScheduledTask{Ticker: tick, Task: task}

_ = m.Add(s)

ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
defer stop()

if err := m.Run(ctx); err != nil {
    log.Fatal(err)
}
```

## Extending xrun: Custom Component Examples

While `xrun` provides some built-in components, you can create your own to suit your specific needs.

### HTTP Server

The `xrun` package includes an HTTP server component out of the box. It is available in the `xrun/component` subpackage.

### gRPC Server (Experimental)

For more advanced use cases, you can create custom components like a gRPC server. An experimental gRPC server component is available in the `component/x/grpc` subpackage.

Here's an example of how you might create such a component:

```go
package grpc

import (
	"context"
	"net"

	"github.com/gojekfarm/xrun"
	"google.golang.org/grpc"
)

// Options holds options for Server
type Options struct {
	Server      *grpc.Server
	NewListener func() (net.Listener, error)
}

// Server is a helper which returns a xrun.ComponentFunc to start a grpc.Server
func Server(opts Options) xrun.ComponentFunc {
	srv := opts.Server
	nl := opts.NewListener

	return func(ctx context.Context) error {
		l, err := nl()
		if err != nil {
			return err
		}

		errCh := make(chan error, 1)

		go func(errCh chan error) {
			if err := srv.Serve(l); err != nil && err != grpc.ErrServerStopped {
				errCh <- err
			}
		}(errCh)

		select {
		case <-ctx.Done():
		case err := <-errCh:
			return err
		}
		srv.GracefulStop()

		return nil
	}
}

func NewListener(address string) func() (net.Listener, error) {
	return func() (net.Listener, error) {
		return net.Listen("tcp", address)
	}
}
```

In this example, we define a new `Options` struct that includes our gRPC server instance and a `NewListener` function. This function creates a network listener on the given address.

Next, we define a `Server` function that takes an `Options` instance and returns a `xrun.ComponentFunc`. This `ComponentFunc` starts the gRPC server and manages its lifecycle. It starts the server in a goroutine and then enters a select block. If the context is done, the gRPC server is stopped gracefully. If an error occurs while serving, it's returned.

The `NewListener` function is a helper that generates a function for creating a network listener.

Here's how to use it:

```go
package main

import (
	"context"
	"net"
	"os"
	"os/signal"

	xgrpc "yourgrpcpackage"
	"github.com/gojekfarm/xrun"
	"google.golang.org/grpc"
)

func main() {
	s := grpc.NewServer()
	m := xrun.NewManager()

	grpcComponent := xgrpc.Server(xgrpc.Options{
		Server:      s,
		NewListener: xgrpc.NewListener(":8500"),
	})

	_ = m.Add(grpcComponent)

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()

	if err := m.Run(ctx); err != nil {
		os.Exit(1)
	}
}
```

## Conclusion

The `xrun` package makes it easier to manage component lifecycles in your Go applications. By allowing you to define and control how each component starts and stops, you can make your application more maintainable and robust.

Finally, I'd like to give credits to the authors at the Kubernetes community. The manager source of `xrun` has been heavily influenced by the [sigs.k8s.io/controller-runtime](https://github.com/kubernetes-sigs/controller-runtime/tree/a1e2ea2/pkg/manager) package.

Thanks for reading, and I hope you find `xrun` as useful as I do!

___

Contributions, questions, and feedback are most welcome on the xrun [GitHub](https://github.com/gojekfarm/xrun) repository. Happy coding, Gophers!
