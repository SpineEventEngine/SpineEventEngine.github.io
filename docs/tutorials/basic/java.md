---
layout: docs
title: Spine Event Engine Basics - Java
---

<h1 class="page-header">Spine Event Engine Basics: Java</h1>

<p class="lead">This tutorial provides a basic Java programmer's introduction to working with Spine. </p>


### Commands

TBD

### Events
TBD

### Aggregate
TBD

### Aggregate State

### Writing Command Handlers

For the majority of commands, a handler would be corresponding aggregate root object. Such a method takes two parameters: <code>Message</code> for command instance and <code>CommandContext</code> for meta-information on the command. The method can have any name. We recommend call them <code>handle</code>:

<pre>
@Assign
public void handle(Message command, CommandContext ctx) {
   ...
}
</pre>

To be dispatched to the aggregate root, the command must have an attribute with an ID of the aggregate. See Writing Aggregate Commands for details.

Notice the annotation @Susbscribe, which tells that the method participates in automatic dispatching of commands.

#### General Command Handlers

TODO: describe implementing an interface.

#### Registering Command Handlers

TODO: automatic registration of aggregate handlers by registering the corresponding repository. TODO: registering general command handlers with the engine.


<a name="Writing Aggregate Commands"></a>
Writing Aggregate Commands


TODO: Describe aggregate ID attributes. Must be 1st property, and name finish with 'id'




### Stream Projection

### Projection

### Process Manager

<a name="eventapplier"></a>
### Event Applier
Event applier is a method of an aggregate root which applies data from an event to the state of the aggregate.

Event appliers are part of the private API of aggregate roots. As such they are declared private by convention set in the Spine framework:
<pre>
 @Apply
 private void on(MyEvent event) {
     MyState newState = getState().toBuilder()
       .setMyProperty(event.getProperty())
       .build();
     validate(newState);
     setState(newState);
 }
</pre>

### Event Handler
Event Handler is a method which reacts on a domain event after it's posted to the Event Bus. Unlike [event appliers] (#eventapplier), event handlers must be declared public:

<pre>
@Subscribe
public void on(MyEvent event) {
    // do something
}

</pre>
### Command Handler

For the majority of commands, a handler would be corresponding aggregate root object. Such method takes two parameters: <code>Message</code> for command instance and [CommandContext] (#commandcontext) for meta-information on the command. The method can have any name. We recommend call them <code>handle</code>:

<pre>
@Assign
public void handle(Message command, CommandContext ctx) {
   ...
}

</pre>

To be dispatched to the aggregate root, the command must have an attribute with an ID of the aggregate. See [Writing Aggregate Commands](/docs/tutorials/basic/java.html) for details.

Notice the annotation <code>@Assign</code>, which tells that the method participates in automatic dispatching of commands. 

A command handler method can throw [business failures] (#bizfailure). This means the API of each command handler allows:

* Either produce an event (or a list of events). Or,
* It can throw one or more business failures (which are clearly visible in the method signature).



####  Multi Handler 

### Command Dispatcher
Command Dispatcher invokes a handler method for the received command.

There can be **only** one handler method for one command type.

### Event Bus.
EventBus allows publish-subscribe-style communication between components without requiring the components to explicitly register with one another (and thus be aware of each other).


### Command Store

### Event Store

### Storage

### Repository 

### Bounded Context 

Bounded Context is a central pattern in Domain-Driven Design. DDD deals with large models by dividing them into different Bounded Contexts and being explicit about their interrelationships.[by Fowler] (http://martinfowler.com/bliki/BoundedContext.html)


### Library

### Query

### Service

### Catchup Subscription

### Snapshot

### Command Validation

#### Command Validator

<a name = "commandcontext"></a>
### Command Context

<a name="bizfailure"></a>
### Business Failure 
 In Spine system errors are separated from business logic failures that can be fixed by user (e.g. not enough money on credit card). 
 Below you can see a sample of the aggregate that throws a business failure on a command, which cannot be performed.
<pre>
@Assign
public TaskCancelled handle(CancelTask command, CommandContext context) throws CannotCancelTaskInProgress {
    final Task task = getState();
    if (task.getStatus() == Task.Status.IN_PROGRESS) {
            throw new CannotCancelTaskInProgress(task.getId());
        }

       return TaskCancelled.newBuilder().setId(task.getId()).build();
    }
</pre>
