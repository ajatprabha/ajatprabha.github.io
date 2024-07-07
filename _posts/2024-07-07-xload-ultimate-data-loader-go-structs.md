---
layout: post
current: post
cover:  assets/images/xload-gophers.jpg
navigation: True
title: 'Unleashing xLoad: Your Ultimate Data Loader for Go Structs!'
date: 2024-07-07 01:00:00
tags: [golang]
class: post-template
subclass: 'post tag-golang'
author: ajatprabha
---

Meet xLoad, your data-loading superhero 🦸‍♂️! It effortlessly brings data from various corners of the universe straight into Go structs. Whether you're juggling configurations, internationalization labels, or experiments, xload is your trusty sidekick.

## 🤷‍♂️ **Why xload?**

- **Diverse Data Sources**: Load data from environment variables, http requests, command-line arguments, files, or even remote sources like apis.
- **Avoid Boilerplate**: Say goodbye 👋 to repetitive code and hello to a cleaner, more maintainable and readable codebase.
- **Flexibility**: Inspired by [go-envconfig](https://github.com/sethvargo/go-envconfig) but with more muscle 💪! Customize struct tags and use custom data loaders.

## Getting Started 🛠️

```bash
go get github.com/gojekfarm/xtools/xload
```

## How does xload work its magic? 🎩✨

1. Feed xload a Go struct with annotations.
2. Let xload populate it with data from any source you want.
    - A source simply has to implement [`Loader`](https://pkg.go.dev/github.com/gojekfarm/xtools/xload#Loader) interface, or use one of existing ones!
3. Enjoy the separation of data loading from its usage.

Here's an example of the inbuilt `OSLoader`:

```go
type Config struct{ Key string `env:"KEY"` }

func main() {
	var cfg Config
	_ = xload.Load(context.TODO(), &cfg)
}
```

# **📝 Dive into Examples & Tutorials**

### 🌍 **1. Loading from Environment Variables**

Imagine you have an application that needs to fetch configurations from the environment it's running in. Instead of manually fetching each variable, xload lets you define a struct and populates it for you.

```go
type AppConfig struct {
    LogLevel string `env:"LOG_LEVEL"`
    // ...
    // your application config here
}
func main() {
    ctx := context.Background()
    cfg := DefaultAppConfig()
    err := xload.Load(ctx, &cfg, xload.OSLoader())
    // use cfg
}
```

### 🎨 **2. Using Custom Types**

With xload, you can also use custom types, such as Timeouts can be tricky. But with xload, you can directly specify durations like 5s without ambiguity. No more guessing if a timeout value is in seconds or milliseconds, and say goodbye to naming conventions like TIMEOUT_SEC!

```go
type AppConfig struct {
    Timeout time.Duration `env:"TIMEOUT"` // TIMEOUT=5s is 5 seconds
}
```

Or implement your own by defining one of the following methods for xload:
1. `interface{ Decode(string) error }`
2. `encoding.TextUnmarshaler`
3. `json.Unmarshaler`
4. `encoding.BinaryUnmarshaler`
5. `encoding.GobDecoder`

Example:

```go
// URL is a type alias for url.URL.
// The general form represented is: [scheme:][//[userinfo@]host][/]path[?query][#fragment]
type URL url.URL

func (u *URL) String() string { return (*url.URL)(u).String() }

func (u *URL) Decode(v string) error {
	parsed, err := url.Parse(v)
	if err != nil {
		return err
	}

	*u = URL(*parsed)

	return nil
}
```

### 🪄 **3. Nested Structs**

For complex applications, configurations can get intricate. With xload, you can nest structs,  making it easier to group, reuse, and maintain configurations.

```go
type HTTPConfig struct {
    Port int `env:"PORT"`
    Host string `env:"HOST"`
}

type AppConfig struct {
    Service1 HTTPConfig `env:",prefix=SERVICE1_"`
    Service2 HTTPConfig `env:",prefix=SERVICE2_"`
}
```

### 📦 **4. Inbuilt Loaders**

xload isn't just a tool; it's a toolkit. It comes with a set of inbuilt loaders to make your life easier:

- **OSLoader**: Perfect for fetching data from environment variables.
- **PrefixLoader**: Need to add prefixes to keys before loading? This is your go-to loader.
- **SerialLoader**: When you need to load data from multiple sources, with the last non-empty value taking precedence.

### 🛠️ **5. Custom Loaders**

For those special cases, xload allows you to craft custom loaders. As long as they implement the [`Loader`](https://pkg.go.dev/github.com/gojekfarm/xtools/xload#Loader) interface, you're golden. Similar Loader can be implemented for - In-memory Cached, Vault, S3, etc.

---

# 🔍 **Spotlight: CRUD-based List API**

Let's dive into a real-world example to see the transformation xload brings:

### **Before xload**:

Parsing request options was a multi-step process. The code was filled with multiple parsers and error handling, the code is verbose and a lot to read through.

```go
func GetList(w http.ResponseWriter, r *http.Request) {
	qry := r.URL.Query()

	search := qry.Get("search")
	page, err := strconv.ParseInt(qry.Get("page"), 10, 32)
	if err != nil {
	// handle error
	}
	size, err := strconv.ParseInt(qry.Get("size"), 10, 32)
	if err != nil {
	// handle error
	}

	field := qry.Get("sort")
	desc := false
	if strings.HasPrefix(field, "-") {
		field = strings.TrimPrefix(field, "-")
		desc = true
	}

	//
}
```

### **After xload**:

The code is streamlined. Define a struct, let xload populate it, and you're good to go! The result? Cleaner, more maintainable code that's a breeze to read.

```go
type RequestOptions struct {
	Search string `query:"search"`
	Page   int    `query:"page"`
	Size   int    `query:"size"`
	Sort   sort   `query:"sort"`
}

type sort struct {
	Field string
	Desc  bool
}

func GetList(w http.ResponseWriter, r *http.Request) {
	var opts RequestOptions

	if err := xload.Load(
		r.Context(),
		&opts,
		xload.FieldTagName("query"),
		xload.WithLoader(queryLoader(r.URL.Query())),
	); err != nil {
	// handle error
	}

	// opts contain typed requestOptions and
	// any errors would also be caught here.
}
```

The transformation is clear: xload simplifies the data-parsing process and error handling, making the codebase more readable and maintainable.

---

# 🌐 **Internationalization with Lokalize** 🌐

With xload, you can load internationalization labels from files and then tweak them for each request using a remote service. This ensures your application speaks the language of your users, wherever they are.

```go
type I18N struct {
    Title string `i18n:"TITLE"`
    CTA   CTA    `i18n:",prefix=CTA_"`
}

type CTA struct {
    Submit string `i18n:"SUBMIT"`
    Cancel string `i18n:"CANCEL"`
}
```

## 🎉 **Wrap Up**

That's xload for you! A robust tool designed to simplify your data loading needs in Go. Dive in, explore, and let the magic unfold! 🌟

Check out the docs at [pkg.go.dev](https://pkg.go.dev/github.com/gojekfarm/xtools/xload) for more examples.

> xLoad is the brainchild of [Ravi](https://raviatluri.in/) and I help out in maintaining it.
