---
layout: docs
title: Spine Event Engine Concepts and Terms
---

<h2 class="page-header">Spine Event Engine Concepts and Terms</h2>

<p class="lead"> This document introduces some key Spine architecture concepts and terms usage specifics.</p> It assumes that you've read the [Overview](/docs/index.html). For language-specific details, see the [Quick Start](/docs/guides/start), [tutorial](/docs/tutorials/basic/java.html), and reference documentation for your chosen language(s).


**Command**  - is an instruction to do something. 
Command is any method that mutates state. In Spine [command](/docs/tutorials/basic/java.html) is as protobuf message. 

**Event** - is something that happened in the past.
Capture all changes to an application state as a sequence of events. In Spine events are defined as prorobuf messages. Find out more about [Eriting an Event](/docs/tutorials/basic/java.html).

**Aggregate** -  is a pattern in Domain-Driven Design. According to  [Martin Fowler](http://martinfowler.com/bliki/DDD_Aggregate.html), a DDD aggregate is a cluster of domain objects that can be treated as a single unit. 

Concretely, an aggregate will handle commands, apply events, and have a state model encapsulated within it that allows it to implement the required command validation, thus upholding the invariants (business rules) of the aggregate.
Read more on [Aggregate definition](/docs/tutorials/basic/java.html) in Spine.

**Aggregate State** - each aggregate has a state, which represents Aggregate structure. Aggregate State is defined as protobuf message in Spine. 

**Stream Projection**  - Stream Projection is a subset of Events from the Events Stream. 

**Projection** — (here we use traditional term from Relational Algebra) is subset of columns for use in operations, i.e. a projection is the list of columns selected.
Read more about [Projection] (/docs/tutorials/basic/java.html) usage in Spine.

**Process Manager** -  


**Event Applier** is a method of an aggregate root which applies data from an event to the state of the aggregate.
Event appliers are part of the private API of aggregate roots.

**Command Handler** - for the majority of commands, a handler would be corresponding aggregate root object. Such method takes two parameters: <code>Message</code> for command instance and [CommandContext] (#commandcontext) for meta-information on the command. 
A command handler method can throw [business failures] (#bizfailure). This means the API of each command handler allows either produce an event (or a list of events). Or, it can throw one or more business failures.

**Command Dispatcher**
Command Dispatcher invokes a handler method for the received command.

There can be **only** one handler method for one command type.

**Event Bus** - EventBus allows publish-subscribe-style communication between components without requiring the components to explicitly register with one another (and thus be aware of each other).

**Event Handler** is a method which reacts on a domain event after it's posted to the Event Bus.

* **Multi Handler**



**Command Store**

**Event Store**

**Storage**

**Repository**

**Bounded Context** Bounded Context is a central pattern in Domain-Driven Design. DDD deals with large models by dividing them into different Bounded Contexts and being explicit about their interrelationships. (http://martinfowler.com/bliki/BoundedContext.html)

**Library** - is a Storage. In Spine it implements read side of CQRS and serves for Aggregate States Storage, from where you can query any subset of the parameters.

**Query** - is implemented through FieldMask 

**Service**

**Catchup Subscription**

**Snapshot**  -  is a projection of the current state of an aggregate at a given point in time. It represents the state when all events to that point in time have been replayed. Rolling Snapshots are used as a heuristic to prevent the need to load all events for the entire history of an aggregate

**Command Validation**

* **Command Validator**

<a name = "commandcontext"></a>
**Command Context** -  is a meta information that is not directly belongs to a command, but provides you an important context of usage (who requested a command, when etc.)

**Business Failure** - 
 