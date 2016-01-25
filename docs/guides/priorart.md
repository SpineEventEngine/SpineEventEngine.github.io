---
layout: docs
title: Prior Art
---


The demands on software projects increase rapidly as time progresses. So do architecture approaches to meet these needs. 
This section will give you an overview of the concepts and implementations Spine has inherited, while brought some important differences into play.

While creating Spine Event Engine we followed steps of [(CQRS)](http://martinfowler.com/bliki/CQRS.html) architectural pattern and [Event Sourcing](http://martinfowler.com/eaaDev/EventSourcing.html). 

We were inspired by major frameworks on the market like [Axon](http://www.axonframework.org/) and [Event Store](https://geteventstore.com/). 
The important difference though is that we decided not to use JSON Objects for data transmission. This allows to avoid additional transformation and thus has event better performance. 

Using [Protocol Buffers](https://developers.google.com/protocol-buffers/docs/overview) allows automatic code generation for events and commands on variety of platforms.

Currently to transform code from one language to another you have to use translators, or back-and-force with JSON. We also want to make a ubiqutous language ubiquites in technical
 
Immutability is one of the corner concepts used in Spine. 

Spine uses typed commands and events. JSON is nice, but having commands and events as first class citizens in the applications gives a lot of benefits in business logic. Not having to convert back-and-forth with Json gives some performance advantage.







