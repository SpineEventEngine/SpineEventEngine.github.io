---
title: Concepts
headline: Documentation
bodyclass: docs
layout: docs
sidenav_list: guides
sidenav: doc-side-nav.html
type: markdown
---
# Concepts

<p class="lead">This document provides terminology used in the framework and its documentation.
You'll find most of the terms familiar from Domain-Driven Design, CQRS, Event Sourcing or Enterprise
Integration patterns. We give brief descriptions for those who are new to these concepts and tell
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

## Event Subscriber

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

## Event Reactor

Event Reactor is an object which usually produces one or more events in response to an incoming
event. Unlike [Event Subscriber](#event-subscriber), which always consumes events, a reacting object
generates events in response to changes in the domain.

<p class="note">In some cases, Event Reactor may ignore the event, returning `Nothing`.
    It usually happens when a method returns one of the
    [`Either`](https://spine.io/core-java/javadoc/server/index.html) types, with `Nothing` as
    one of the possible options: `EitherOf2<TaskReAssigned, Nothing>`.</p>


## Entities

### Aggregate

### ProcessManager

### Projection
