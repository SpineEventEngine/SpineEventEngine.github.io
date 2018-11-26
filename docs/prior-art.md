---
title: Prior Art
headline: Prior Art
bodyclass: docs
layout: docs
type: markdown
---

# Prior Art

The demands for software projects increase rapidly as time progresses. 
So does the scope of architecture approaches to meet these needs.
This section will give you an overview of the concepts and implementations Spine has inherited, 
while bringing some important differences into play.

Spine is created for applications that follow the [CQRS](http://martinfowler.com/bliki/CQRS.html) 
and [Event Sourcing](http://martinfowler.com/eaaDev/EventSourcing.html) architectural patterns.

Spine didn’t appear out of the blue. While working on our own CQRS/ES based projects we were 
alarmed at how much manual effort is spent on creating events and commands, delivering events and data
to the web and mobile clients. It takes time, does not require much creativity from a developer,
whilst this energy could have been spent on productive 
[Event Storming](http://ziobrando.blogspot.com/2013/11/introducing-event-storming.html), 
detailing the Domain model and so on. Attempts to address this issue led to the Spine vision.

A major addition Spine brings to the existent variety of tools, libraries, and frameworks is 
automatic **code generation** for multiple application clients. 
It is reached by using [Protocol Buffers](https://developers.google.com/protocol-buffers/docs/overview).

When creating an Event Sourcing application, you need to write classes for commands, events, 
command handlers, aggregates, aggregate repositories, DTOs etc.
And if your organization wants an application on, let’s say, a couple of mobile platforms,
you would have to add a lot of work to deliver data to each client application.
So you need to make your code work on another platform by writing it in another language *manually*,
or translate it using tools like [J2ObjC](http://j2objc.org/), or resort to using only 
Json in the client apps.

Using [Protobuf](https://developers.google.com/protocol-buffers/docs/overview) for formulating 
the business domain allows us to make this language 
[ubiquitous](http://martinfowler.com/bliki/UbiquitousLanguage.html) not only in human interaction, 
but in communication of computing devices, too.

**Immutability** is another major concept we follow.
Spine uses typed commands and events. Having commands and events as first class citizens in the 
applications gives a lot of benefits in terms of business logic. Not having to convert back and 
forth with Json gives some performance advantage at the same time.

We are greatly inspired by [Redux](http://redux.js.org) — one of the most exciting things happening
in JavaScript at the moment. It stands out from the landscape of libraries and frameworks by 
getting so many things absolutely right: a simple, predictable state model; an emphasis on functional programming and immutable data.

In Spine Event Engine we combined all of our experience and observations of the best-breed market
products and solutions like [Axon](http://www.axonframework.org/), [Spring](https://spring.io/), 
[Event Store](https://geteventstore.com/), [InfluxDB](https://influxdata.com/), 
[Apache Zest](https://zest.apache.org/) and many others. 
Spine has yet to find its own niche.

Spine probably won’t be the best fit for trading or highly loaded applications, where, for example,
[LMAX](https://www.lmax.com/) does an excellent job. Our motivation is to make development of
modern applications easier and more efficient, and to offer a set of practical solutions to bring
this into life with a corresponding approach and terminology.

In terminology we heavily lean on [Domain-Driven Design (DDD)](https://en.wikipedia.org/wiki/Domain-driven_design)
and the [“Big Blue Book”](http://www.amazon.com/Domain-Driven-Design-Tackling-Complexity-Software/dp/0321125215) 
by Eric Evans.

We learned a lot from the book [“CQRS Journey”](https://msdn.microsoft.com/en-us/library/jj554200.aspx)
by Microsoft, and our choice of the term “Process Manager” over the commonly used “Saga” is 
based on the experience of Microsoft engineers. 
The “Process Manager” pattern was first defined and brought into common vocabulary by Kyle Brown
and Bobby Woolf under the guidance of Martin Fowler in the book 
[“Enterprise Integration Patterns”](http://www.enterpriseintegrationpatterns.com/patterns/messaging/ProcessManager.html).

Another great resource on object-oriented design worth mentioning here is 
[“Patterns of Enterprise Application Architecture”](http://www.martinfowler.com/books/eaa.html) 
by Martin Fowler. Many modern frameworks implement these patterns behind the scenes, and so does Spine.
But as [Martin Fowler](http://www.martinfowler.com/books/eaa.html) notes:

 >Frameworks still require you to make decisions about how to use them, 
 >and knowing the underlying patterns is essential if you are to make wise choices.

Systems built on top of Spine framework are flexible, loosely-coupled, scalable and open to change.
Here we should thank [Reactive Manifesto](http://www.reactivemanifesto.org/), 
which became one the corner stones and drivers of the Spine philosophy.

We are yet at the beginning of our journey of using Spine in the wild.
Join us and share how it goes!
