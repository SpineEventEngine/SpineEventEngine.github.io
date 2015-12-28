---
layout: docs
title: Documentation
icon: <i class="fa fa-book"></i>
---

<h1>Getting started</h1>

<p class="lead">Welcome to the developer documentation for Spine Event Engine, a multi-language, open-source, event sourcing framework.</p>

This document introduces you to Spine Event Engine. You'll find more tutorials and <a href="/docs/reference/">reference docs</a> in this site - more documentation is coming soon!

<div id="toc"></div>


## What is Spine Event Engine

Here we will place description of the  framework, what we are trying to bring to the world and how it will help dev organizations.


<a name="protocolbuffers"></a>

### Working with Protocol Buffers

By default Spine Event Engine uses *Protocol Buffers*, Google’s
mature open source mechanism for serializing structured data (although it
can be used with other data formats such as JSON). You
can find out lots more about Protocol Buffers in the [Protocol Buffers
documentation](https://developers.google.com/protocol-buffers/docs/overview).

#### Protocol Buffer versions

While Protocol Buffers have been available for open source users for some
time, Spine uses a new flavor of Protocol Buffers called proto3,
which has a slightly simplified syntax, some useful new features, and supports
lots more languages. This is currently available as an beta release in
Java and C++, with an alpha release for JavaNano (Android Java), Python, and
Ruby from [the Protocol Buffers Github
repo](https://github.com/google/protobuf/releases), as well as a Go language
generator from [the golang/protobuf Github repo](https://github.com/golang/protobuf), with more languages in development. You can find out more in the [proto3 language guide](https://developers.google.com/protocol-buffers/docs/proto3), and see
the major differences from the current default version in the [release notes](https://github.com/google/protobuf/releases). 

<a name="quickstart"></a>

## Quick start
To get up and running with Spine straight away, see the quick start for your chosen language, which provides links to installation instructions, quick instructions for building the example used in this guide, and more:

<!-- * [Java](https://github.com/SpineEventEngine/Lobby)-->
* Java  - *TBD*

You can find out about the Spine Event Engine source code repositories in
[Spine](https://github.com/SpineEventEngine).


<a name="setup"></a>

### Setup

This section explains how to set up your local machine to work with
the example code.


#### Install Spine

TBD

#### Get the source code
Here we will place links to the source code.


<a name="servicedef"></a>

### Defining an Aggregate
Aggregate is described as a separate Protocol Buffer package. You should create a file describing an Aggregate state and two .proto files called *Commands* and *Events*. 
This structure is important to follow for correct parsing by Spine. 

### Defining Services

## Read more!

- Find out how to install Spine and get started in each language's [quick start](#quickstart).
- Follow the tutorial(s) for your favorite language(s).
- Discover more about [gRPC concepts](/docs/guides/concepts.html), including RPC life-cycle, synchronous and asynchronous calls, deadlines, and more.
- Read a detailed description of the [gRPC over HTTP2 protocol](/docs/guides/wire.html).
