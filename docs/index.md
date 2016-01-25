---
layout: docs
title: Documentation
---

<h1>Getting started</h1>

<p class="lead">Welcome to the developer documentation for Spine Event Engine, a multi-language, open-source, event sourcing framework.</p>

This document introduces you to Spine Event Engine. You'll find more <a href="/docs/tutorials/principles.html/">tutorials</a> and <a href="/docs/reference/">reference docs</a> in this site - more documentation is coming soon!


## What is Spine Event Engine

Spine Event Engine is the framework that helps developers to build Command Query Responsibility Segregation (CQRS) and Event Sourcing applications. 

Spine is built on top of [Protocol Buffers] (https://developers.google.com/protocol-buffers/docs/overview) and [GRPS](http://www.grpc.io/docs/) to bring easiness and efficiency into development of the applications with a microservice-oriented architecture. All this allows you to focus on your business logic, instead of the plumbing.

<img src="../img/SpineEventEngine-diagram.svg" class="img-responsive" alt="Spine Event Engine diagram">


The Framework provides implementations of the most important building blocks, such as aggregates, repositories, command dispatchers, event buses and stream projections. 
You can find out more about Spine key concepts [here](/docs/guides/concepts.html).
 
#### Name Background 
 We want to be a framework that provides an infrastructure and connects so to say “service” parts of applications with their “brains” — business logic. 
 Find out how following [leading industry trends](/docs/guides/priorart.html) we were [inspired](/docs/guides/motivation.html) to create Spine. 

## Read more!

- Find out how to install Spine and get started in each language's [quick start](/docs/guides/start.html).
- Follow the [tutorial(s)](/docs/tutorials/principles.html) for your favorite language(s).
- Discover about <a href = "http://www.grpc.io/docs/">gRPC</a>.
- Read a detailed description of the <a href ="http://www.grpc.io/docs/guides/wire.html">gRPC over HTTP2 protocol</a>.