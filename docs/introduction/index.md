---
title: Why we created Spine
headline: Documentation
bodyclass: docs
layout: docs
type: markdown
---

# Why we created Spine

We started working on Spine after two CQRS/ES projects and having the experience
of tons of manual work for:
 - creating commands, events, etc.
 - delivering events and data to web and mobile clients.

We decided to create a framework that can help us and development groups like us
building apps using Domain-Driven Design. These are the principles our framework is based on:

 - Events and Commands should be **strongly typed**.
 - It should be **easy to pass data** between different programming languages and platforms. 
   We want a domain language to become truly Ubiquitous.
 - Objects must be **immutable** unless there is a good reason not to do so.
 - Developers should spend more time on business logic rather than plumbing related to storage
   matters or server environment aspects.
 - The code should be easier to test.
 
