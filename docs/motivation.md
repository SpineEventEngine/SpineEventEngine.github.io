---
bodyclass: docs
headline: Motivation
layout: docs
title: Why we created Spine
type: markdown
---

# Why we created Spine

We started working on Spine after two CQRS/ES projects and having the experience
of tons of manual work for:

 - creating commands, events, etc.
 - delivering events and data to web and mobile clients.

Being a team that strives for efficiency in each product we create, implementing a great deal of
cutting edge technologies to make development process easier and more productive, we could not just accept it.
Instead, we decided to create a framework that can help us and development groups like us to build CQRS/ES apps easier.

There are four fundamental principles Spine is based on:

 - Events and Commands should be **strongly typed**.
 - It should be **easy to pass messages** between different programming languages and platforms. We want a domain language become really Ubiquitous.
 - Classes must be **immutable** unless there is a good reason not to do so.
