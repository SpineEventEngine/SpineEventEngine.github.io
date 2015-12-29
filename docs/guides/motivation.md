---
layout: docs
title: Motivation
icon: <i class="fa fa-rocket"></i>
---

<h2 class="page-header">Why We Created Spine?</h2>

<div id="toc"></div>

The demands on software projects increase rapidly as time progresses. It means not only codebase is constantly getting more complex, but also business logic constantly changes which require building new functionality, removing old one while serving thousands and billions of people. 
So scalability became an indisputable requirement.

Spine Event Engine is a multi-language, open-source, event sourcing framework that helps developers build scalable and extensible applications by addressing these concerns directly in the architecture. 
This section explains how Spine differs from other frameworks and why we decided to create it.
 

### Spine and Event Store
Spine Event Engine helps build scalable, extensible and maintainable applications by supporting developers apply the Command Query Responsibility Segregation [(CQRS)](http://martinfowler.com/bliki/CQRS.html) architectural pattern and [Event Sourcing](http://martinfowler.com/eaaDev/EventSourcing.html). It does so by providing implementations of the most important building blocks, such as aggregates, projections and event buses (the dispatching mechanism for events).
Furthermore, using Protocol Buffers, Spine allows easily generate code for multiple clients, hugely saving development team effort.
Spine is inspired by [Event Store](https://geteventstore.com/) with the difference that we do not use JSON Objects for data transmission, which allows to avoid additional transformation and thus has event better performance. Using [Protocol Buffers](https://developers.google.com/protocol-buffers/docs/overview) allows automatic code generation for events and commands on variety of platforms.

Spine Event Engine also allows to avoid standard DTO model by storing Aggregate State in proto files. That means that data is transferred from the server to client without losses, additional transformations, which also means excellent performance.
  
  






