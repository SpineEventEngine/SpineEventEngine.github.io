---
layout: docs
title: Motivation
---

<h2 class="page-header">Why We Created Spine?</h2>
 Here is what we want to 

#### Less manual work 
When creating an Event Sourcing application, you need to write classes for commands, events, command handlers, aggregates, aggregates repository, DTOs etc. 
And if your organization wants an application on, let's say a couple of mobile platforms, you would have to add a lot of work to deliver data to each client application. 
So you need to make your code work on another platform by writing it in another language manually, or translate it using tools like [J2ObjC](http://j2objc.org/), or we resort to using just Json in client apps.

Spine aims to free up developers from creating boilerplate code as much as possible. 
Using [Protobuf](https://developers.google.com/protocol-buffers/docs/overview) for formulating business domain allows us
 to make this language [ubiquitous](http://martinfowler.com/bliki/UbiquitousLanguage.html) not only in human interaction, but in communication of computing devices too.


#### Less Infrastructure Code
Building modern web applications requires a lot of work for organising storage and data retrieval. As well as supporting communications with multi-platform mobile and browser clients, supporting scaling with microservice-oriented architecture, etc. 

Building on top of [Protobuf](https://developers.google.com/protocol-buffers/docs/overview) and [gRPS](http://www.grpc.io/docs/), Spine aims to provide many infrastructure solutions, so that developers can focus on business logic, effective web and mobile UI, etc.


Having absorbed leading [industry experience] (/docs/guides/priorart.html), following steps of [CQRS] (http://martinfowler.com/bliki/CQRS.html)and [Event Sourcing](http://martinfowler.com/eaaDev/EventSourcing.html), we blended multiple concepts and methodologies together to create neat and efficient framework. Key elements and terms we based framework on are reflected in Spine [Concepts](/docs/quides/concepts.html). 


This is an interesting journey for us, journey in progress...