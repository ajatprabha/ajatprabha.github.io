---
layout: post
current: post
cover: assets/images/application-error-handling-hero.png
navigation: True
title: 'What an error means in your Go application'
date: 2026-10-13 12:00:00 +0530
tags: [golang]
class: post-template
subclass: 'post tag-golang'
author: ajatprabha
---

Suppose a user asks a service to attach `shop.example` as a custom domain.
The controller checks the Domain Name System (DNS), but the required CNAME record is missing.
A CNAME record points one domain name to another.
Until the user adds the correct record, the domain stays pending.

The next check finds the same problem.
If each check writes an error-level log, this expected condition can look like a service fault.
The log gets louder, but the record does not appear. 😅

The error still matters.
It explains why the domain is pending.
I want to keep that cause and give the application a common way to describe what it means.
Go supplies tools to create and inspect errors.
The application supplies the classification and decides how to respond.

## When the log function learns DNS rules

Start with a boundary: the function that runs an operation and reports its result.
Suppose a fictional DNS library, `example.com/dnscheck`, exports `dnscheck.ErrRecordMissing` for a missing record.
The DNS check returns that library error to the application.

The boundary can check that value before it chooses a log level.
Here, `err` is a known non-nil error, and `logger` is a `*slog.Logger` from `log/slog`:

```go
// Import "errors" and "example.com/dnscheck".
if errors.Is(err, dnscheck.ErrRecordMissing) {
	logger.Info("operation incomplete", "err", err)
} else {
	logger.Error("operation failed", "err", err)
}
```

This works for the missing record.
Then another expected condition needs a different log level, so the boundary gets another check.
Soon, the function that writes logs also needs rules from each operation it runs.
I'd rather keep those rules near the code that understands the workflow.

`errors.Is` answers whether an error matches a known cause, including through wrappers.
That is useful for a caller that must handle the missing record.
For log severity, I want a shared classification across operations.
I'll call that classification the error's *kind*.

## A small `internal/errs` package

The wrapper needs three fields: the failed operation, the kind and the cause.
This is the whole package for the example:

```go
package errs

import "errors"

type Kind uint8

const (
	Unknown Kind = iota
	Transient
)

type Error struct {
	Op   string
	Kind Kind
	Err  error
}

func (e *Error) Error() string {
	return e.Op + ": " + e.Err.Error()
}

func (e *Error) Unwrap() error { return e.Err }

func KindOf(err error) Kind {
	var e *Error
	if errors.As(err, &e) {
		return e.Kind
	}
	return Unknown
}
```

`Op` names the failed operation.
`Kind` stores its classification.
`Err` holds the original cause.
Only create this wrapper for a known non-nil error; `Error()` calls the cause's `Error()` method.
Return `nil` directly when an operation succeeds.

An error chain connects a wrapper to its cause, which can itself wrap another error.
`Unwrap` exposes that cause to Go's standard inspection tools.
`errors.Is` can still match the original value.
`errors.As` can still find an underlying error type, including this wrapper.
The [Go errors documentation](https://pkg.go.dev/errors) describes both searches.

`KindOf` returns the kind of the first `*errs.Error` that `errors.As` finds.
For these single-cause chains, that means the outermost application wrapper.
If there is no application wrapper, the result is `Unknown`.
An outer `Unknown` does not inherit an inner `Transient` automatically.
That rule matters when we add another operation later.

## Assign the kind where the workflow is clear

In this workflow, `Transient` means the service expects to check the configuration again.
The user can still need to add the record.
The kind does not promise success or decide when the next check runs.

The DNS library reports the missing record.
The domain code knows what that means for this workflow, so it assigns the kind there.
Assume the example module is `example.com/domainapp`, with the package above at `internal/errs`.
The fictional library's `CheckCNAME` function checks the required CNAME and returns `dnscheck.ErrRecordMissing` when it is absent.
Its DNS implementation is outside this example.

```go
package domain

import (
	"context"
	"errors"

	"example.com/dnscheck"
	"example.com/domainapp/internal/errs"
)

func checkDomain(ctx context.Context, domain string) error {
	err := dnscheck.CheckCNAME(ctx, domain)
	if err == nil {
		return nil
	}
	if errors.Is(err, dnscheck.ErrRecordMissing) {
		return &errs.Error{
			Op:   "check_domain",
			Kind: errs.Transient,
			Err:  err,
		}
	}
	return err
}
```

The wrapper keeps the library error as its cause.
A caller can inspect that cause while the boundary uses the application's `Transient` kind.
An unfamiliar failure passes through unchanged and gets the unknown kind at the boundary.
With the `fmt` import, other functions can add context with `fmt.Errorf("check configuration: %w", err)` after a non-nil check.
The `%w` verb preserves inspection of both the kind and cause, as [Go's error wrapping guide](https://go.dev/blog/go1.13-errors) explains.

Now the boundary can choose a log level without checking DNS error values.
It also records a Datadog span, which represents one operation within a trace.
This function uses Datadog's Go v2 tracer; tracer startup and shutdown happen elsewhere.
Like middleware, the boundary starts the span, calls the operation, then reports the result.

```go
package domain

import (
	"context"
	"log/slog"

	"example.com/domainapp/internal/errs"
	"github.com/DataDog/dd-trace-go/v2/ddtrace/tracer"
)

func runDomainCheck(
	ctx context.Context,
	logger *slog.Logger,
	domain string,
) error {
	span, ctx := tracer.StartSpanFromContext(ctx, "domain.check")

	err := checkDomain(ctx, domain)

	defer span.Finish(tracer.WithError(err))
	if err == nil {
		return nil
	}

	level := slog.LevelError
	kind := "unknown"
	if errs.KindOf(err) == errs.Transient {
		level = slog.LevelDebug
		kind = "transient"
	}
	span.SetTag("app.error.kind", kind)
	logger.Log(ctx, level, "domain check failed",
		"domain", domain,
		"kind", kind,
		"err", err,
	)
	return err
}
```

Put these two `package domain` snippets in separate files.
The caller names the operation directly:

```go
// Inside a caller with ctx and logger available.
err := runDomainCheck(ctx, logger, "shop.example")
```

I'd use debug for the expected repeat checks in this example.
Unknown errors use the error level.
The logger's handler must enable debug if you want to see those entries.
These levels and handler settings come from [Go's `slog` package](https://pkg.go.dev/log/slog).

Use the boundary once per operation.
Inner functions return errors without also writing logs.
The boundary owns log severity and returns the same error to its caller.
That keeps one failed check from producing a log at every layer.

We can generalise `runDomainCheck` into middleware that reports errors from other operations.
The application owns and controls the error vocabulary, so the boundary can use the same kinds across those operations.
Each operation maps library errors to those kinds where it knows the workflow.
The shared boundary needs no rules for individual libraries.
I keep the named function here so the call sequence stays easy to follow.

For every failure, `app.error.kind` has one of two values: `unknown` or `transient`.
This bounded tag lets a dashboard separate those failures without using error messages as categories.
`WithError(err)` records the returned error when the span finishes, according to the [Datadog tracer documentation](https://pkg.go.dev/github.com/DataDog/dd-trace-go/v2/ddtrace/tracer).
A debug log does not turn a failed span into a success.
The custom tag alone changes neither Datadog's error status nor its alert rules.

The caller can still use `errors.Is(err, dnscheck.ErrRecordMissing)` to record why the domain is pending.
Metrics still count the failed check.
The classification helps choose a response while keeping the failure visible.

## Keep the operation names

An outer function can add its own operation after it checks that `err` is non-nil:

```go
return &errs.Error{Op: "attach_domain", Kind: errs.KindOf(err), Err: err}
```

This preserves the existing kind explicitly.
The chain is `attach_domain -> check_domain -> record missing`.
Go already supports error chains, including ordinary `%w` wrappers.
Because the application owns `Op`, callers can read structured operation names for logs or traces without parsing messages.

## Know when to stop

If standard error values or types meet the application's needs, I'd use them directly.
A local package earns its place when several operations need shared classifications at a boundary.
Add another kind or field only when a caller needs it.

Keep logging, tracing, retry limits and state changes outside the error package.
Those decisions need workflow context and can change independently.
I want the package to remain small enough that I can read it without a second cup of coffee.

Back at `shop.example`, the record is still missing and the domain is still pending.
The service keeps the cause, counts the failed check and expects to check again.
Each expected check can use a debug log without looking like another service fault.
The user still has to fix DNS.
