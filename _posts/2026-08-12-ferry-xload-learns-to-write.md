---
layout: post
current: post
cover:  assets/images/ferry-hero.jpg
navigation: True
title: 'Ferry: xload Learns to Write'
date: 2026-08-12 01:00:00
tags: [golang]
class: post-template
subclass: 'post tag-golang'
author: ajatprabha
---

Two years ago I wrote about [xload](/2024/07/07/xload-ultimate-data-loader-go-structs), which fills an annotated Go struct from env vars, query params, files, anything you put behind a `Loader`.
It does that one job well.
It does exactly half of what I needed.

[ferry](https://github.com/onhotpath/ferry) is the other half: one annotated struct, one tag grammar, two directions.
Load from any source, dump to any sink.

Writing is not a thing ferry learned to do on top of reading.
It is the same machine, run backwards.

---

xload fills your struct and stops.
`Loader.Load(ctx, key string) (string, error)` is a read, and my first instinct was the obvious one: add a `Store` beside it and call it a day.

That does not work.
Finding out why is what turned this into a new library instead of a pull request.

A reader can discover the world one key at a time.
A writer cannot.
It needs the complete set of places up front, names that survive the trip out as well as the trip in, and one agreed spelling per type in both directions.

You cannot bolt that onto a reader as one more method, so ferry starts over: new repo, new core, no shared code.

What I needed was a handful of settings moved out of a YAML file and into the Windows registry.
What I built was a 90,000-line library with 21 design decisions behind it.

> Somewhere in there I stopped swatting the mosquito and started dropping a building on it. 😅

## 🩹 The breaking point

The project that prompted ferry is a long-lived privileged Windows service, shipped as an installer to machines I don't control.

Its config had been living in a YAML file next to the binary, editable by anybody on the machine.
Moving it into the Windows registry closed that, and everything else here came out of that decision.

The registry is arguably the right home for application config on Windows anyway.
Ordinary users will happily open a config file they can see; they will not go poking around in `regedit`.

Commit to the registry and three jobs land on your desk:

1. **Keep the registry out of the core domain.**
   Accept the registry and its API calls creep into code that has no business knowing what a registry is.
   I had an ad-hoc wrapper for exactly one key and a hand-rolled DPAPI wrapper, neither tested.
   Behind a driver interface with a conformance suite, that knowledge finally gets exercised.

2. **Move the YAML config into the registry without doing it by hand.**
   Not a one-off migration script that has to track the schema forever.
   Just: read the struct from there, write the struct to here.
   Two lines, one plane to another.

3. **Persist what the user changed.**
   A setting flips in the UI, the struct in memory changes, and that change has to outlive the process.
   xload has no answer here: `Load` fills the struct and the story ends.

In fairness, I could have hand-written the migration.
A few hundred lines, a weekend, done.
But I had wanted an excuse to build this properly, and a stack of freshly published agent skills to put through their paces.
More on that later.

Now put two and three side by side.

Porting YAML into the registry is *write the struct back*.
Persisting a user's change is *write the struct back*.

Two features, one missing capability.
The loader already knew how to read my struct; I was short the same machinery run in reverse.

---

## ⛴️ Meet ferry

> Two-way data mapping for Go structs: load from any source, dump to any sink.

Ferry is deliberately not a config library.
The rule I set on day one and never relaxed: core contains nothing that requires knowing the store is a configuration file.

A **plane** is whatever backend you are talking to, a YAML file, process env, a KV bucket, a query string.
Core knows nothing about any of them.

Six verbs, and that is the whole surface:

```go
cfg, err := ferry.Load[Config](ctx, src)       // fresh value from a source
cfg, err := ferry.LoadOver(ctx, seed, src)     // load over an existing value
err = ferry.Dump(ctx, cfg, sink)               // write a value to a sink
err = ferry.Compile[Config]()                  // check the type maps, no plane in sight

b, err := ferry.Bind[Config](src)              // hand the source the addresses once
cfg, err := b.Load(ctx)                        // ... and load through it as often as you like

w, err := ferry.BindSink[Config](sink)         // the same split on the write side
err = w.Dump(ctx, cfg)
```

Every exported field names its own segment or is marked `-`, and ferry never invents a name out of the Go field name, so exporting a field cannot silently change what your program writes.

Start with the third job, persisting what the user changed: someone flips a setting and it has to still be there tomorrow.
Here is a config file a person maintains, `app.yaml`:

```yaml
# the port the server listens on
port: 8080
label: "8080" # quoted, so it stays a string
debug: false
tags:
  - a
owner: platform-team
```

Load it, change what the user changed, write it back:

```go
type config struct {
	Port  int      `ferry:"port"`
	Label string   `ferry:"label"`
	Debug bool     `ferry:"debug"`
	Tags  []string `ferry:"tags"`
}

cfg, err := ferry.Load[config](ctx, yaml.NewSource(path))
// port=8080 label="8080" debug=false tags=[a]

cfg.Debug = true
cfg.Tags = append(cfg.Tags, "b")

err = ferry.Dump(ctx, cfg, yaml.NewSink(path))
```

And the file afterwards:

```yaml
# the port the server listens on
port: 8080
label: "8080" # quoted, so it stays a string
debug: true
tags:
  - a
  - b
owner: platform-team
```

The comment is still there, the key order is still there, `owner` is still there and no field ever mapped it, and `label` is still the string `"8080"` rather than the number 8080.
A dump merges into the document that is already on disk; it does not re-serialise your struct over the top of it.
That merge is not free, and I measured what it costs further down.

The second job, moving YAML into the registry, falls out of the same machinery: once both directions run off one schema, nobody has to build plane-to-plane transfer.
The struct mentions neither plane:

```go
// One type, two directions, and neither plane appears in it.
type Service struct {
	Host   string            `ferry:"host"`
	Port   int               `ferry:"port"`
	Tags   []string          `ferry:"tags"`
	Labels map[string]string `ferry:"labels"`
}
```

And the transfer is the whole of it:

```go
cfg, err := ferry.Load[Service](ctx, from.Source())
if err != nil {
	return err
}

err = ferry.Dump(ctx, cfg, to.Sink())
```

What lands in the destination plane:

```text
/host = string("db1.internal")
/labels/owner = string("platform")
/port = number("5432")
/tags#0 = string("primary")
/tags#1 = string("eu-west")
```

There is no intermediate format and no migration script, because the address set the load walked is the same one the dump walks.
Swap either side for a module under `driver/` and those two lines do not move: a YAML file into a Consul-shaped KV store is the same two calls.

---

## 🔌 A small core, everything else is a driver

Everything above is core, and core only grows for a mechanism drivers need, never a feature one of them wants.
It knows structs, addresses and values: no file formats, no key syntax, no idea any of this might be configuration.
Everything that touches a real backend sits outside it, behind two interfaces.

Five drivers ship today, each its own Go module:

| module | plane | directions |
|---|---|---|
| `driver/env` | environment variables, layered over `.env` files | load and dump |
| `driver/yaml` | a YAML file, edited in place | load and dump |
| `driver/kv` | a Consul-shaped key-value store, client supplied by you | load and dump, experimental |
| `driver/http` | one request's query params or header fields | load |
| `driver/windows/winreg` | the Windows registry | load and dump, experimental |

The last row is the first job closed: the registry knowledge my application used to carry now lives in a driver, and the application just says `Load` and `Dump`.
(On the env row, a dump writes a `.env` file, never your running process.)

Not every row goes both ways, on purpose.
Some planes have no honest write: you can read query params off a request, but writing config into a request the caller already built makes no sense.
So ferry puts that in the types.
Readable planes implement `Source`, writable ones implement `Sink`, and there is no `CanWrite()` bool to check at runtime.
Try to `Dump` into `driver/http` and your program does not compile.

Missing a backend you need? A driver is two required methods, plus optional capabilities you add by implementing more interfaces.
One call, `ferrytest.Driver(t, plane())`, runs it through the same conformance suite the built-in ones pass.

File-backed drivers can also watch.
`env.WatchFiles` and the yaml driver's watch report when the file moves, and `watch.Values` turns those into a stream of freshly loaded structs.

The file changes, your struct updates.

### Adding your own word to the tags

Drivers extend which planes ferry reaches.
Sometimes you want a new word instead: a way to say "this field is a secret" once, on the field, and have it hold wherever the struct gets written.

Ferry's tag vocabulary is closed, so another library claims a tag key of its own.
Core parses that key's words, attaches them to the address it found them on, and stops there.
`protect:"secret"` means as much to core as a `json` tag does, which is nothing.

`driver/windows/protect` is what that buys.
Not a plane but a decorator: it wraps somebody else's `Source` and `Sink` and encrypts the marked values on the way past, using Windows DPAPI-NG.
Every other address goes through untouched.

Mark one field, leave its neighbour ordinary:

```go
type Settings struct {
	Host string      `ferry:"host"`
	Auth Credentials `ferry:"auth"`
}

type Credentials struct {
	RefreshToken string `ferry:"refresh_token" protect:"secret"`
}
```

Declare the tag key on a registry, wrap the plane, then load and dump as before:

```go
reg := ferry.MustRegistry(ferry.WithTagKeys(protect.Extension()))

src := protect.Over(store, protect.CurrentUser, protect.FromTags())
cfg, err := ferry.Load[Settings](ctx, src, ferry.WithRegistry(reg))
```

What the plane holds afterwards:

```text
/host               = string("example.internal")
/auth/refresh_token = string("ferry-protect:1:AQAAANCMnd8BFdERjHoAwE/Cl+sBAAAA")
```

The unmarked field is stored as always.
The marked one is a marker plus the base64 DPAPI-NG ciphertext, and it loads back as the original string on the machine and under the account that wrote it.
The value's kind rides inside the ciphertext, so a protected number returns a number, not a string.
Which descriptor to pass, and why `CurrentUser` beats the obvious `LocalSystem` off a domain, is [its own story](/2026/08/12/what-the-windows-registry-taught-me).

One mistake it refuses to let you make: an undeclared tag key parses to nothing.
Wrap a plane in `protect`, forget the declaration, and every `protect:"secret"` goes inert and every secret gets written in the clear, which from inside the decorator looks exactly like a struct that marks nothing.
So it refuses at bind, before a single read or write.

---

## 🔬 What it does differently

I did a prior-art sweep before writing a line of engine.
I could not find an existing Go library that drives both directions off one tag grammar over pluggable backends, which is why ferry exists rather than a PR to something else.

**One compiled schema, cached.**
Your struct compiles once into the complete set of addresses it names, and the result is cached on the registry, so every load after the first skips the compile entirely.
That same address set drives both directions.

**Bind before I/O.**
The driver is handed that address set whole, before anything is read or written, in a step whose signature takes no `context.Context` because it does no I/O.
Core never joins segments into a key, since a separator is plane knowledge, so the driver flattens the set itself.
Two checks land there, both refusals: that the plane can name every address, and that no two addresses collide onto one key.

**Everything loud, nothing silent.**
Unrecognized tag content, out-of-set types, lossy dumps, discarded parse errors: all refusals.
And when a struct has several problems, the error carries all of them, so you are not fixing one to discover the next.

**Parse, don't validate.**
There is no `min=`, no `max=`, no `oneof=`; the type is the validation.
If you want a port that cannot be 70000, that is a type, not a tag.

A bare `type Port int` is admitted by its kind and gets you nothing, so give it a codec and the range check lives in the parse:

```go
type Port int

func encodePort(p Port) (string, error) {
	if p < 0 || p > 65535 {
		return "", fmt.Errorf("port %d is out of range", int(p))
	}

	return strconv.Itoa(int(p)), nil
}

func decodePort(text string) (Port, error) {
	n, err := strconv.Atoi(text)
	if err != nil {
		return 0, err
	}

	if n < 0 || n > 65535 {
		return 0, fmt.Errorf("port %d is out of range", n)
	}

	return Port(n), nil
}

var registry = ferry.MustRegistry(
	ferry.NumberValue(encodePort, decodePort),
)
```

Now a `Port` field loaded with `ferry.WithRegistry(registry)` cannot hold 70000, because there is no path into the struct that does not go through `decodePort`.
And the claim serves both directions, so `encodePort` guards the way out too: an out-of-range port can neither enter a struct through ferry nor leave one.
`NumberValue` is the constructor to reach for here rather than a `TextAppender` pair, because it writes the plane's number kind, and a port stored as `8080` rather than `"8080"` is the point.

**One decision per type, serving both directions.**
Ferry picks a representation once: a registered codec if you gave it one, else the `TextAppender` + `TextUnmarshaler` pair, else `reflect.Kind`.
That one choice covers load and dump, so anything ferry writes it can read back.
Which is why `fmt.Stringer`, `json.Marshaler` and gob are never consulted: `String()` says how to write a value and nothing about parsing it back, and a one-way representation is data written once and never loadable again.
`net.IP` travels as `"192.0.2.1"`, `slog.Level` as `"WARN"`.

**A typed boundary, and one coercion rule.**
`Loader.Load(ctx, key) (string, error)` funnels everything through a string, losing the plane's own idea of what it held before the struct side sees it.
Ferry's boundary value carries a kind, closed at six: absent, null, bool, number, string, bytes.
A YAML `true` arrives a bool, a `REG_DWORD` a number, and a number keeps the text the plane spelled it with, so no width is picked before a target type is in hand.
A leaf then accepts its own kind plus a string parsed by exactly that kind's parser, nothing more.
`"0080"` is 80 at an int and never 0, `"yes"` is not a bool, and a plane's number is refused at a Go string field, which keeps a quoted `8080` distinct from an unquoted one across a round trip.

That would be obnoxious on its own, since plenty of planes do spell a boolean `on` and `off`.
So core never guesses and the plane declares: a spelling is a `Parse` and a `Render` from the driver, spelled `env.BoolWords("on", "off", "true", "false")` from a caller's seat.
All four words are accepted, `on` is what a `true` writes back as, and the convention lives with the driver that knows it instead of as a per-field escape hatch in your struct.

**Zero dependencies in core.**
The `require` block is empty and CI asserts it stays that way.

### Back to the old pain

With the library on the table, the rest of what hurt is easier to answer:

- **Two decoders, two tag vocabularies.** xload could not load a list of structs, so [mapstructure](https://github.com/mitchellh/mapstructure) got bolted on for one file, with its own dialect over the same schema. The missing feature was the symptom; two vocabularies over one schema was the disease. Ferry sorts every address into a leaf, a section whose children the type knows, or a composite whose children come from the value. A list of structs is a composite of sections of leaves, addressed as `/servers#0/host`, so there was never a special case to bolt onto.
- **Defaults did not compose with layered config.** A per-field `default=30s` fires wherever a source is silent, and in a layered stack most sources are silent about most fields. The file sets `10s`, the env overlay says nothing, and loading the overlay puts `30s` back over the file's answer. Ferry has `default=` and the same collision, but a documented position instead of a silent one: a tag default re-fires on every load, so for a layered stack you seed the defaults in a plain Go value and `LoadOver` each source onto it. A layer that holds an address overwrites it; a silent layer leaves it alone.
- **I wanted a capability absent, not disabled.** The env route earns its keep in dev, where local runs and tests override config all day. A shipped binary has no such need, so build tags pick the source stack and a release never imports the env driver. Not switched off, not compiled in, and no flag can switch it back on.

### The collision nobody checks

Here is a struct with a bug in it that I would not spot in review:

```go
type Config struct {
	DBHost string `ferry:"db_host"`

	DB struct {
		Host string `ferry:"host"`
	} `ferry:"db"`
}
```

Two fields, two different places.
`/db_host` is one segment; `/db/host` is two.

Now load that from environment variables, where nesting joins with `_`.
Both of them spell `DB_HOST`.

One field gets the value and the other does not, and for most libraries nobody can tell you which, because the winner falls out of Go's map iteration order and changes between runs of the same binary over the same environment.

How the field handles it:

- **koanf** takes the last load, silently, with no error.
- **viper** collides at `_`, does not collide at `__`, and checks neither way.
- **xload** does catch it on the struct side, with a real message naming the key. But `SkipCollisionDetection` turns that off, and its map-flattening path never checks at all: run the same load again and again over the same data and the answer flips, with roughly one run in seven coming back with the other field's value, and no error either time.

And since I help maintain xload, that last one is mine to fix upstream.

Ferry cannot land in that spot, because core never flattens anything.
A separator is plane knowledge, so the driver owns the join, and `/db_host` and `/db/host` stay two distinct addresses under every circumstance.
The ambiguity only ever existed for designs that have to recover structure back out of a flattened string.

Core checks the driver's key rule over the whole address set at bind time, before a single variable is read:

```text
ferry: /db_host: env gives this and /db/host the same name, "DB_HOST", so one of the two would be lost
```

Both addresses named, the key that ate them quoted, nothing read and nothing written.
Every run, the same refusal, the same message.

The fix is yours to pick: rename a field, or hand the driver a join that keeps them apart with `env.Separator("__")`.

This is also why there are no runtime path accessors anywhere in ferry.
Once you offer `Get("db.host")` you are back to parsing structure out of a string, and the failures come with it: viper's two engines return different answers for one key and one of them is silent, and koanf's `Int64()` turns `18446744073709551615` into `9223372036854775807` with a nil error while `String()` on the same key is lossless.

---

## ⏱️ Performance, and the thing I found while measuring it

The harness refuses to run at all unless every library produces the identical struct from the identical source, asserted outside every timed loop against a hand-written expected value.
The baseline is the same job written by hand with no mapping layer, published as the floor rather than as a competitor, because nothing beats it.
The numbers are machine-generated into the README between markers, so I never type them.

Where it currently lands:

| scenario | ferry | fastest other | verdict |
|---|---|---|---|
| `yaml_small` | 24.3µs | 31.8µs (viper) | **1.31x faster** |
| `yaml_large` | 125µs | 219µs (viper) | **1.74x faster** |
| `dump_large` | 512µs | 421µs (koanf) | 1.22x slower |
| `dump_fresh` | 358µs | 396µs (koanf) | **1.11x faster** |

I have left the env rows out of that table, and not because they flatter me: ferry loses env loading today, by a good margin, and the full table in the README says exactly by how much.
That path is the one I am still working on.

The YAML wins come from the schema being compiled once per type and cached, so a warm load reads only the addresses the schema names instead of parsing a whole document into an intermediate map and mapstructure-decoding that into the struct.

The two dump rows are the interesting part.

`dump_large` writes over a file that already exists, and ferry loses by 1.22x.
`dump_fresh` writes where there is no file, and ferry wins by 1.11x.
The gap between those two rows is precisely the read-and-parse that in-place editing costs, which is work no other library does, because no other library keeps your comments.

### Nobody fsyncs

Staring at the dump numbers is how I found this: almost nobody syncs on every write.

koanf's write is `os.WriteFile`, neither atomic nor durable.
viper opens with `O_TRUNC` and ends `writeConfig` with `f.Sync()`, so it is durable but not atomic, and the slowest of the four on both dump rows.
That is the worst pairing available: a crash mid-write leaves the operator a truncated file, durably committed.

So the field splits into libraries that are fast because they skip durability, and one that pays for it and gets torn writes anyway.

Ferry is atomic and not durable.
A temp file beside the plane is renamed over it, so nothing reads a half-written config and a failed save leaves the file byte for byte as it was.
Nothing is flushed unless you ask, so the rows above measure koanf's durability and the baseline's, on equal terms.

Asking is `yaml.Durable()`, opt-in because the journal commit costs more than the rest of the save combined.
Durability is a real cost, so I would rather it be a choice than a tax you pay without noticing.

---

## 🪟 A note on the Windows driver

`driver/windows/winreg` is the one that started all of this, and building it turned up enough Windows-specific surprises to fill a post of their own.
Silent case folding that turns two config keys into one, `REG_SZ` preserving a number's spelling better than `REG_DWORD` does, and DPAPI descriptors that work on a domain-joined machine and fail on a standalone one.

They are in [What the Windows Registry Taught Me](/2026/08/12/what-the-windows-registry-taught-me), and most of it is useful whether or not you use ferry.

---

## 🤖 Built in 10 days with Claude

Ferry went from empty repo to the thing described above in ten days.

The first commit was not code but instructions for the agent: an AGENTS.md laying out how to work, what outranks what, and what to do when a lint rule fires.

Then three full days of nothing but design.
Every decision got argued out and written down as an ADR, an architecture decision record, and those 21 documents turned out to be the thing that made the whole approach work: they were the durable shared context between me and the agents, so a session that started cold could read where I had already steered and pick it up from there.
A prototype got built in that window too, audited against the ADRs, and thrown away.

> Then the whole engine, in a day.
> Walk, `Load`/`LoadOver`/`Dump`, tag grammar, schema compiler, codec chain, codec registry, error aggregation, `ferrytest`, the first four drivers, README, perf pipeline.

The `docs:` commits ended up outnumbering `feat:` two to one, which is not the ratio I expected going in.

Where it landed, as of 10 August:

- **224 commits**, and **89,580 lines of Go** across 275 files: 35,626 implementation, 53,954 test, so the tests outweigh the code about 1.5 to 1.
- **1,099 test functions and 54 examples.** CI gates core at 90% coverage and will not merge below it.
- **21 ADRs**, all accepted and all implemented, the longest running 1,381 lines.

The mosquito from the intro is, I am pleased to report, extremely dead.
And now I get to reuse the building.

The guardrails are what let an agent move that fast without the codebase quietly rotting:

- **A lint canary.** `lintcanary.go` plus `make lint-canary` assert that the `unused` linter still reports dead code, so the linter itself is tested. Thresholds are cognitive complexity 7, cyclomatic 10, function length 75/50, nesting 4, and AGENTS.md says: "When one fires, split the function. Never raise the number, never add a nolint."
- **godoc-check.** No exported doc comment may cite an ADR, issue or PR number. The boundary is literally "whether `go doc` prints it".
- **Examples that cannot rot.** Doc-comment code is promoted to `Example` functions with `// Output:`, and the driver READMEs quote those examples verbatim, so a README example that stops being true fails the build.
- **Machine-generated perf tables.** The harness lives on a separate `perf/` branch outside `go.work`, so koanf and viper never enter the dependency graph.

Two things outside my repo deserve credit.

Skills from [Matt Pocock's skills repo](https://github.com/mattpocock/skills), vendored and SHA-256 pinned, did much of the heavy lifting on process; the ones that saw real use were `/ask-matt`, `/wayfinder`, `/to-spec`, `/to-tickets`, `/implement`, `/tdd` and `/code-review`.
[Kun Chen's lavish-axi](https://github.com/kunchenguid/lavish-axi) is what I used to plan and review the design visually while those decisions were being argued out.

## 🎉 Wrap up

Ferry is still in experimentation.
A v1 will come soon enough, but before I cut it I want more users on the project: put it into something real, see if the design makes sense to you, tell me where it does not.
If the design holds up, I bump it to v1; if it does not, I keep working on it.

I am also moving the project that prompted it onto ferry, which is the best way I know to find out which of those 21 decisions were wrong.

Code is at [github.com/onhotpath/ferry](https://github.com/onhotpath/ferry), docs at [pkg.go.dev](https://pkg.go.dev/github.com/onhotpath/ferry).
If you try it, the most useful thing you can send me is the thing it refused to do that you thought it should have done.
Issues and questions very welcome.

---

> Ferry stands on [xload](https://pkg.go.dev/github.com/gojekfarm/xtools/xload), which is the brainchild of [Ravi](https://raviatluri.in/) and which I help maintain. A nod as well to [Kailash Nadh](https://nadh.in/), whose [koanf](https://github.com/knadh/koanf) was the closest existing library to what I had in mind for ferry, and the best candidate to compare against on both performance and usability. Happy coding, Gophers!
