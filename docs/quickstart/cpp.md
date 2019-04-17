---
title: Getting Started with Spine in C++
headline: Getting Started with Spine in C++
bodyclass: docs
layout: docs
sidenav: doc-side-quickstart-nav.html
type: markdown
---
<p class="coming-soon">Coming soon...</p>

<p>This guide lets you get started with Spine client-side application written in C++.</p>
<hr>

## Before you begin

### Prerequisites

#### Install gRPC

To install gRPC on your system, follow the instructions to build from source
[here](https://github.com/grpc/grpc/blob/master/INSTALL.md).

#### Install Protocol Buffers v3

While not mandatory, gRPC usually leverages Protocol Buffers v3 for service
definitions and data serialization. If you don't already have it installed on
your system, you can install the version cloned alongside gRPC. First ensure
that you are running these commands from within your cloned gRPC repository
from the previous step.

```sh
$ git submodule update --init
$ cd grpc/third_party/protobuf
$ ./autogen.sh
$ ./configure
$ make
$ sudo make install
```

See [the official Protocol Buffers install
guide](https://github.com/google/protobuf/blob/master/src/README.md){:target="_blank"} for
details.

Note that you also need `pkg-config` installed on your system. On Ubuntu/Debian
systems, this can be done via `sudo apt-get install pkg-config`.

## Build the example

TBD

## Run the example

TBD

## What's Next

- Detailed tutorial in [Spine Client App Basics: C++][]
- [Spine Client App Basics: C++]:../tutorials/basic/cpp.html
