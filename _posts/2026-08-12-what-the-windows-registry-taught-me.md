---
layout: post
current: post
cover:  assets/images/ferry-windows-hero.jpg
navigation: True
title: 'What the Windows Registry Taught Me'
date: 2026-08-12 00:30:00
tags: [golang]
class: post-template
subclass: 'post tag-golang'
author: ajatprabha
---

I built a Windows registry driver for [ferry](/2026/08/12/ferry-xload-learns-to-write), my two-way config library, so that an application could stop carrying registry API calls around inside its domain code.

The registry turns out to be a good home for configuration and a slightly hostile one for a library.
Windows had opinions.

Most of what follows applies whether or not you ever touch ferry.

## 🔐 Why the registry at all

The service that prompted this keeps its config on machines I don't control, installed by people who are not developers.
That config had been living in a YAML file next to the binary, in plain sight and editable by anybody on the machine.

The registry fixes that mostly by being boring.
An ordinary user will happily open a config file they can see; they are not going to go poking around in `regedit`.

But the real argument is the permissions, and this is the part I did not appreciate before.

**Put your config under `HKLM\SOFTWARE` and non-admin writes are denied for free.**
Users inherit `ReadKey`, Administrators and SYSTEM get `FullControl`, and you did not have to do anything to get that.
Compare it with a data directory under ProgramData, where the same protection depends on someone having set the ACL correctly at install time and nobody having loosened it since.

The registry's protection comes with the location.
The directory's depends on somebody having set it up correctly once, and nobody checking since.

The cost is that writing under `HKEY_LOCAL_MACHINE` needs administrator rights, so an unprivileged process is refused when the save starts rather than part way through it.

## 🗂️ The registry is a nicer tree than it looks

A config library needs to know where a struct field lands.
The registry makes that easy, because it keeps two namespaces under every key: **values**, which hold data, and **subkeys**, which hold more of both.

A struct maps onto that almost exactly:

| the struct says | the registry holds |
|---|---|
| `Host string` tagged `host` | the value `host` under the driver's key |
| `DB struct{...}` tagged `db`, with `Host` inside | the value `host` under the subkey `db` |
| `Tags []string` tagged `tags` | the subkey `tags`, holding the values `0`, `1`, `2` |
| `Envs map[string]struct{...}` tagged `envs` | the subkey `envs`, one subkey per map key |
| a config whose whole value is one leaf | the key's own unnamed value, which `regedit` shows as `(Default)` |

A value named `host` and a subkey named `host` under the same key are two different objects, and both are legal.
That is more structure than most config backends give you, and it means nothing has to be flattened into a delimited string on the way in.

**The registry folds key case, and it does it silently.**
Write `Host`, then write `host`, and you do not get two values.
You get one value named `Host` holding the second write's data, and no error is raised at any point.

For a library whose whole premise is that two different fields are two different places, that is a data-loss bug waiting to happen.
So the driver folds every part of an address to lower case before comparing two of them, and refuses a schema where two addresses collide, naming both:

```text
ferry: /Host: winreg gives this and /host the same name, "host", so one of the two would be lost
```

That lands when the load starts, before anything is read or written.
The case you actually wrote is still what gets stored, because the registry keeps whichever spelling created a name first; the fold is only for the check.

Two more things have no registry name at all and get refused the same way: an empty address part, and one containing a backslash.
There is no escape hatch for the backslash, for the same reason it is dangerous in the first place: any byte an escape used would be a byte a map key is entitled to contain.

## 🔢 REG_SZ is better at numbers than the number types

This is my favourite piece of Windows trivia from the whole exercise.

**`REG_SZ` preserves how a number was written, and `REG_DWORD` cannot.**
`007`, `3.14159265358979` and `18446744073709551615` all come back exactly as they went in.
Put any of those through a typed numeric value and you lose the leading zero, or the precision, or the whole thing.

So the driver writes numbers as `REG_SZ`, and there is no option to choose otherwise.

Reading is wide and writing is narrow, which is the shape most of these drivers end up with:

| read | becomes |
|---|---|
| `REG_SZ` | a string |
| `REG_EXPAND_SZ` | a string, exactly as stored, never expanded |
| `REG_DWORD`, `REG_QWORD` | a number |
| `REG_BINARY` | bytes |
| `REG_MULTI_SZ` | refused |

Two of those rows have stories.

**`REG_EXPAND_SZ` is read raw because expanding it is not reversible.**
`%SystemRoot%-literal` expands to `C:\WINDOWS-literal`, and a save afterwards would write that back over what the operator originally wrote.
It is also the one type a save preserves: text written where the registry already holds an expandable string is stored as one, because retyping it would destroy the expansion for every other reader of that key.
That costs one read per string a save writes, and it is worth it.

**`REG_MULTI_SZ` is refused** because it spells a whole sequence inside one value, and a sequence's elements each deserve their own address.

The cost of all this: an operator who hand-retyped a value to `REG_DWORD` gets it back as `REG_SZ` on the next save.
The data survives, the type annotation does not.

## 🛡️ Encrypting the parts that need it

Some config values are secrets, and on Windows the reflex is DPAPI.
Two things surprised me here, and the first one is the one I would most want a past version of me to read.

**DPAPI at machine scope is not encryption at rest.**
`CRYPTPROTECT_LOCAL_MACHINE` with NULL entropy decrypts for every principal on the machine, so any local account, any service, any scheduled task can read it back.
The only thing actually keeping anyone out is the ACL on whatever holds the ciphertext.
Encrypt with it if you like, but do not let it talk you out of getting the ACL right.

That is the mistake this whole area exists to retire: machine-scope DPAPI with no entropy, written to a file whose access list grants read to everyone, and inherited from a parent directory rather than chosen.

DPAPI-NG does better, but it has a trap of its own.

**The LocalSystem descriptor needs a domain.**
The obvious descriptor for a service running as LocalSystem is `SID=S-1-5-18`, and it looks correct right up until you install on a machine that is not domain-joined.
It resolves through Active Directory's key distribution service, there is nothing to resolve against, and `NCryptProtectSecret` fails at the first save with `NTE_ENCRYPTION_FAILURE`.

The three descriptors worth knowing:

| descriptor | rule | who can decrypt | needs a domain |
|---|---|---|---|
| `CurrentUser` | `LOCAL=user` | the account the process runs as, on this machine | no |
| `LocalMachine` | `LOCAL=machine` | every account on this machine | no |
| `LocalSystem` | `SID=S-1-5-18` | the local system account, on this machine | **yes** |

**Start from `CurrentUser`.**
A service running as the local system account and protecting under `LOCAL=user` gets exactly what `SID=S-1-5-18` promises, that the value is for SYSTEM on this machine and nothing else, and it gets it on a standalone box too.
The sharp edge is that the principal is whoever runs the process: run the same program by hand as an ordinary user and the value is protected to that user, and the service will not read it back.

`LocalMachine` is not an improvement on classic machine scope in access-control terms.
Windows documents `LOCAL=machine` as protecting content so that all users on the computer can decrypt it, which is the same grant `CRYPTPROTECT_LOCAL_MACHINE` gives.

And none of this is a vault.
An attacker who takes the machine's own key material recovers the value offline at their leisure, and anyone with administrator rights can simply run as the principal the descriptor names and ask for the plaintext, which is what the descriptor says they may do.
It is a large improvement over plaintext and it is not a secrets manager.

In ferry this lives in a decorator that wraps any plane and encrypts only the fields a struct marked, driven by a second struct tag.
[The ferry post](/2026/08/12/ferry-xload-learns-to-write) has the worked example.

## ⚠️ Where the registry runs out

Four limits worth knowing before you put a config store on it.

**There is no null.**
A registry value cannot exist without a type, and every type carries a payload, so there is no way to store "this is explicitly nothing" that is distinguishable from empty text.
Containers are different: a subkey that exists and holds nothing is a real object.

**A save is ordered and it is not atomic.**
Writes can be staged so that a refused save leaves the registry untouched, but once the commit starts, a machine that dies half way through is left half way through.
The registry does have transactions, and Microsoft deprecated them.

**Two Go strings have no `REG_SZ` spelling.**
A registry string is UTF-16 and ends at its first NUL, so a string holding a NUL, and one holding bytes that are not valid UTF-8, are both refused.
Put those in a `[]byte` field, which is written as `REG_BINARY` and carries every byte.

**On 64-bit Windows there may be two of your key.**
The registry keeps two copies of parts of the tree, and a 32-bit process is redirected into `WOW6432Node` without being told, so a 32-bit service and a 64-bit installer writing the same path write two different keys.
Name the view you want explicitly and give the same one to both halves, instead of inheriting whatever the process happens to be.

That last one is not a registry flaw so much as a twenty-year-old compatibility decision you inherit, and it is the kind of thing that produces a bug report saying "the installer wrote it but the service cannot see it".

## 🎉 Wrap up

The registry is a better configuration store than its reputation suggests: a real tree, permissions you get by inheritance rather than by remembering, and a string type that round-trips numbers more faithfully than the number types do.

It is also full of edges that fail without an error, and almost all of them fail the same way: two things become one.

The driver is `driver/windows/winreg` in [github.com/onhotpath/ferry](https://github.com/onhotpath/ferry), experimental for now, and the library it plugs into is the subject of [the other post](/2026/08/12/ferry-xload-learns-to-write).
If you are building something similar on Windows and hit an edge I have not listed, I would like to hear about it.

---

> Written while building [ferry](https://github.com/onhotpath/ferry). Happy coding, Gophers!
