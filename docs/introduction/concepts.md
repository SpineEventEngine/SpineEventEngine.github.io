---
title: Concepts
headline: Documentation
bodyclass: docs
layout: docs
---
# Concepts

<p class="lead">This document provides terminology used in the framework and its documentation.
You'll find most of the terms familiar from Domain-Driven Design, CQRS, Event Sourcing or Enterprise
Integration patterns. 
<br><br>
We give brief descriptions for those who are new to these concepts and to tell
how they are implemented in our framework.
Terms extending the industry-set terminology are designated as such.</p>

## Messaging

### Command

Commands are messages that instruct an entity within Spine framework to perform a certain action.
Compared with events, command is not a statement of fact. They are a request, and, thus, can be
refused. A typical way to convey refusal is to throw an error or rejection. 

In Spine, commands are defined as Protocol buffer messages in the file which name ends with
`commands.proto`.

### Event

Event is something that happened in the past. All changes to an application state are captured as
a sequence of events. Events are the main “database” of the application. 

In Spine, events are defined as Protobuf messages in the file which name ends with `events.proto`.
 
### Rejection

Rejections is a special “negative” kind of events that we introduce to differentiate them from 
regular events. If an event is a fact of something that happened to a domain model, a rejection is
a fact that states the reason why a command was not handled.  

Consider the following examples of rejections: 
* `CreditCardValidationDeclined`, 
* `OrderCannotBeEmpty`, 
* `InsufficientFunds`.

In Spine, rejections are defined as Protobuf messages in the file which names ends with
`rejections.proto`. 

For detailed instructions on defining rejections, please refer to
[“Working with Rejections”](/docs/guides/rejections.html) guide.

### Acknowledgement

Acknowledgement is an outcome of sending a [Command](#command) to the [Command Service](#command-service).

It tells whether the Command has been accepted for handling. 

### Command Handler

Command Handler is an object which receives commands, modifies the state of the application, and
generates events if the modification was successful.

[`Aggregate`](#aggregate) and [`ProcessManager`](#process-manager) are examples one of such classes. 
The code snippet below given an example of handling a command by an aggregate:

```
final class TaskAggregate
    extends Aggregate<TaskId, Task, Task.Builder> {
    ...
    @Assign
    TaskCreated handle(CreateTask cmd, CommandContext ctx) {
        return TaskCreated
                .newBuilder()
                .setId(cmd.getId())
                .setName(cmd.getName())
                .setOwner(ctx.getActor())
                .vBuild();
    }
    ...
}
```

### Event Subscriber

Event Subscriber is an object which subscribes to receive events.

The example below shows how a [Projection](#projection) class subscribed to the `TaskCompleted`
event.

  ```
  final class TaskProjection
      extends Projection<TaskId, TaskItem, TaskItem.Builder> {
      ...
      @Subscribe
      void on(TaskCompleted e, EventContext ctx) {
          builder().setWhenDone(ctx.getTimestamp());
      }
  }
  ```

### Event Reactor

Event Reactor is an object which usually produces one or more events in response to an incoming
event. Unlike [Event Subscriber](#event-subscriber), which always consumes events, a reacting object
generates events in response to changes in the domain.

<p class="note">In some cases, Event Reactor may ignore the event, returning `Nothing`.
    It usually happens when a method returns one of the
    [`Either`](https://spine.io/core-java/javadoc/server/index.html) types, with `Nothing` as
    one of the possible options: `EitherOf2<TaskReAssigned, Nothing>`.</p>

## Value Objects

Value Object describe things in a domain model and do not have identity. 
Value Objects are also immutable. Some examples are:
  * `PhoneNumber`
  * `EmailAddress`
  * `BarCode`
  
In Spine, Value Objects are defined as Protobuf messages.

## Entities

Entities are main building blocks of a domain model. They have unique identity and modify their 
state during the lifecycle.

### Identifier
 
The framework supports the following types of identifiers:

* `Integer`,
* `Long`,
* `String`,
* A generated Java class implementing the `Message`.

Examples of entity IDs used by the framework: `CommandId`, `EventId`, `UserId`, `TenantId`.

<p class="note">We highly recommend using message-based IDs to make your API strongly pronounced
    and type-safe.</p>

### Aggregate

Aggregate is the main building block of a business model. 
From the application point of view it consists of the following:
1. Commands which arrive to it. 
2. Events which appear in response to these commands. 
3. How these events influence the state of an aggregate.

[Aggregates](http://martinfowler.com/bliki/DDD_Aggregate.html) guarantee consistency of data
modifications in response to commands they receive. Aggregate is the most common case of
Command Handler. It modifies its state and produces one or more events in response to a command.
These events are used later to restore the state of the aggregate.

In Spine, aggregates are defined as Java classes, and their states are defined as Protobuf messages.

### Process Manager

Process Manager is an independent component that reacts to domain events in a cross-aggregate
eventually consistent manner. It serves as a centralized processing unit that maintains the state
sequence and defines the next processing step based on intermediate results. 

Process Manager can be both [Command Handler](#command-handler) and [Event Reactor](#event-reactor).

In Spine, Process Managers are defined as Java classes, and their states are defined as
Protobuf messages.

### Projection

Projection is an [Event Subscriber](#event-subscriber) which transforms multiple events data into
a structural representation. Projections are the main building blocks of the Query side of
the application.

In Spine, Projections are defined as Java classes, and their states are defined as
Protobuf messages.

### Repository

Repository  is a mechanism for encapsulating storage, retrieval, and search behavior which emulates
a collection of objects. It isolates domain objects from the details of the database access code. 

The applications you develop using Spine usually have the following types of repositories:
* [`AggregateRepository`](https://spine.io/core-java/javadoc/server/io/spine/server/aggregate/AggregateRepository.html),
* [`ProcessManagerRepository`](https://spine.io/core-java/javadoc/server/io/spine/server/procman/ProcessManagerRepository.html),
* [`ProjectionRepository`](https://spine.io/core-java/javadoc/server/io/spine/server/projection/ProjectionRepository.html).

### Snapshot

Snapshot is a state of an Aggregate. A snapshot ”sits” in between events in the history of
the Aggregate to make restoring faster.

When an Aggregate is loaded, the `AggregateStorage` reads events backwards until encounters
a snapshot. Then the snapshot is applied to the Aggregate, and trailing events are played to
get the current state.

## Services

Services are used by a client application for sending requests to the backend. 

### Command Service

The Command Service accepts a command from a client-side application and redirects it to
the [Bounded Context](#bounded-context) to which this command belongs. This means that there
is a context in which there is a [handler](#command-handler) for this command. Otherwise, 
the command is not [acknowledged](#acknowledgement).

### Query Service

Query Service returns data to the client applications in response to a query. 
The query is a request for the following: 
* state of one or more aggregates or their fragments; 
* one or more projection states or their fragments.
* one or more process manager states or their fragments.

### Subscription Service

Subscription Service allows to subscribe to something happening inside a Bounded Context.

There are two options for subscription:
* receive changes of an Entity state for Projections, Process Managers and Aggregates; 
* be notified of domain Events.

## Architectural

### Bounded Context

Bounded Context is an autonomous component with its own domain model and its
own Ubiquitous Language.Systems usually have multiple Bounded Contexts. 

For example, `Orders`, `UserManagement`, `Shipping` as examples of the contexts of an
online retail system.

### Message Buses

#### Command Bus

This is a message broker responsible for routing the command to its handler.
Unlike a [Command Handler](#command-handler), it does not modify the application business model
or produces events.

There can be only one handler per command type registered in a Command Bus.

#### Event Bus

This bus dispatches events to entities that are [subscribed](#event-subscriber) to these
events or [react](#event-reactor) on them.

### Message Stores

#### Command Store

This store keeps the history of all the commands of the application and statuses of
their execution. 

#### Event Store

This store keeps all the events of the application in the chronological order, which also called
Event Stream. This is the main “database” of the Bounded Context. 

New projections are built by passing the event stream “through” them.

### Integration Event

Integration Events are [events](#event) used to communicate between different Bounded Contexts. 

In Spine, every domain Event may become an Integration Event, if it is emitted by the given
Bounded Context and consumed by another Bounded Contexts. 

### Aggregate Mirror

In Spine, Aggregate Mirror contains the latest state of an Aggregate.
It “reflects” how it “looks” at the time of the last update.

### Stand

In Spine, Stand is a read-side API façade of a BoundedContext.
 
### System Context

System Context orchestrates the internal Spine framework entities that serve the goal of monitoring,
auditing, and debugging of domain-specific entities of the enclosing Bounded Context.
Users of the framework do not interact with this component.
