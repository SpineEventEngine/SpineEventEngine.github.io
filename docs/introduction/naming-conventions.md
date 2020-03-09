---
title: Naming Conventions
headline: Documentation
bodyclass: docs
layout: docs
---
# Naming Conventions

<p class="lead">This document covers naming conventions for the code. Some of these conventions are
used by the framework and code generation, and as such are required. Others are our recommendations
that we find useful for making the code easier to understand.</p>

## Proto files

Proto files are named using the `snake_case`, as defined by Protobuf. There are several special
kinds of files.

### Identifiers   

Commands and events reference model entities using their identifiers. 
Having typed identifiers makes a model type safe.
Although the framework also supports `String`, `Integer`, and `Long` as valid ID types, 
we strongly recommend defining custom ID types like `CustomerId`, `OrderId`, `ShipmentId`,
and others. You can find similar cases in the framework API which has `EventId`, `CommandId`,
`UserId`, `TenantId`, and others. 

We find it convenient to define ID types in one file called `identifiers.proto`. 
A typical project is likely to have more than one Bounded Context, thus you will have several
`identifiers.proto` files. 
Each of them resides under the directory with proto files defining the data model of the
corresponding Bounded Context.   

### Command definitions

Commands are defined in a file ending with `commands.proto`. 
It can be simply `commands.proto` but usually commands are handled by different entities. 
Thus, it is convenient to name such a file after the type of the target entity, 
for example, an aggregate: 

 * `blog_commands.proto` 
 * `order_commands.proto` 
 * `customer_commands.proto`

### Event definitions

Similarly to commands, events are defined in files which names have the `events.proto` suffix:

 * `blog_events.proto` 
 * `order_events.proto`
 * `customer_events.proto`.

### Rejection definitions

`Rejection` is a special “negative” kind of events supported by the framework. 
A rejection is thrown if a command cannot be handled. You may think of them as of exceptions with
non-technical flavor.

Similarly to events, rejections are defined in files ending with `rejections.proto`:

  * `blog_rejections.proto` 
  * `order_rejections.proto`
  * `customer_rejections.proto`.

For each aggregate you are likely to have all three kinds of files because a command leads to
an event, and it is likely there are conditions under which a command cannot be handled.

### Entity states

We recommend gathering definition of related entity states in a file named after a business model
thing. Suppose we have a `Task` aggregate, `TaskItem` and `TaskDetails` projections, and
a Process Manager which is responsible for movement of a task from one project to another, there
would be `task.proto` file, with all Task-related data types definitions. A project-related data
types would be defined in a `project.proto` file. 

As it was already mentioned, `TaskId` and `ProjectId` are defined in the `identifiers.proto` file,
and `task.proto` and `project.proto` import this file.

## Data types

Data types are defined as Protobuf messages using `TitleCapitalization`.

### Identifiers

Identifiers are usually defined after the name of the entity with the `Id` suffix:

  * `ProjectId`
  * `TaskId`
  * `CommentId`
  
You will find such naming pattern in the framework API. For example, `EventId`, `CommandId`,
`UserId`, `TenantId`, and others.    

<p class="note">This convention is not a requirement. We find `Id` suffix short yet meaningful for
    building a rich type-safe API. You can also select another convention that fits your domain
    best. Please note that future version of the framework tools will use the `Id` suffix of the
    types and `_id` suffix of proto field names for code scaffolding and improving intelligence of
    code generation.</p>  

### Commands

A command is defined as an imperative:

 * `CreateProject`
 * `AssignTask`
 * `RemoveComment`
 
### Events

Events are named as facts formulated as past participles, for example:

  * `ProjectCreated`
  * `TaskAssigned`
  * `CommentRemoved`   

### Rejections

A rejection is named after a reason of why a command cannot be handled. In fact, rejection notifies
on a state of the domain model, for example:

  * `TaskAlreadyExists`
  * `InsufficientFunds` 
  * `ProjectAlreadyCompleted`

### Entity states

Protobuf messages for entity states are defined using nouns, for example:

  * `Project`
  * `Task`
  * `Comment`
  
Avoid using suffixes like `Aggregate`, `Projection`, `ProcessManager` when defining a proto type for
the following reasons:
 1. You may want to use such word when creating an entity Java class which _uses_ 
    a generated data type for holding the state of the entity.
 2. Such data structure does not represent a whole `Aggregate` or `ProcessManager` thing anyway. 
    It is just data.

<p class="note">For details on aggregates usage, refer to a
    [Defining Aggregate Guide](/docs/guides/defining-aggregate.html).</p>  
 
## Packages

Packages allow to form namespaces for types and avoid clashes. It is customary to have a “root” 
package for an organization or a service name. Most likely each Bounded Context would have 
a dedicated package.

Examples in this guide assume that a fictitious company called 
[Acme Corporation](https://en.wikipedia.org/wiki/Acme_Corporation) creates a SaaS solution.
The company has a web presence site with the domain name `acme.io`.
The solution is a task management application called "Todo List" 
which will be hosted at`todolist.acme.io`.    

### Proto packages

Packages in Protobuf do not follow the reverse Internet domain name convention, 
which is customary in Java. It would make sense to have a root package for all types defined
in an organization under the root package with a lowercase company name.

For the fictitious SaaS project of the Acme Corporation it would be:

```proto
package acme.todolist;
```

### Java packages

Java does not have the notion of package nesting. Packages in Java are separated namespaces,
which seem hierarchical for convenience. When it comes to placing source code files
in a project, there is usually nesting formed by the directories in a file system.

Spine framework uses this notion of “nesting” for marking multiple packages of a server-side code 
[belonging to a Bounded Context](https://spine.io/core-java/javadoc/server/io/spine/server/annotation/BoundedContext.html)
easier. But this is a convenience feature, not a requirement.
   
Please see our recommendations for organizing generated and handcrafted code in sections below.

#### Have package per data type

It is easier to see everything related to a type, if all the generated code comes under a 
“home” package of a data type. For example: 

 * `io.acme.todolist.task`
 * `io.acme.todolist.project`
 * `io.acme.todolist.comment` 

This package would be a part of API shared between client- and server-side code of your 
application.

#### Commands

We recommend putting command classes under a package which ends with `command`:

 * `io.acme.todolist.task.command`
 * `io.acme.todolist.project.command`
 * `io.acme.todolist.comment.command` 

The package name is singular because it reads better in a fully-qualified class name of 
a command message. 

#### Events

 Similarly to commands, we recommend putting events generated by an entity under the `entity`
 sub-package:
 
 * `io.acme.todolist.task.event`
 * `io.acme.todolist.project.event`
 * `io.acme.todolist.comment.event` 

#### Rejections

Similarly to events, rejections are placed under the package called `rejection`:

 * `io.acme.todolist.task.rejection`
 * `io.acme.todolist.project.rejection`
 * `io.acme.todolist.comment.rejection` 

<!-- TODO:2018-11-21:alexander.yevsyukov: Make the text below a Note block with a link to guide on defining rejectiosn.proto file -->

Unlike commands and events, rejection messages are generated under a file named `Rejections`. 
The class is placed into a `rejection` package of the corresponding type.
 
The package also contains generated `Throwable` _top-level_ classes that match rejection messages. 
These classes are used in the `throws` clause of command handling methods.

The arrangement with message classes nested under `Rejections` class and top-level `Throwable`s
is required to avoid name clashes while keeping these generated classes under the same package.

<p class="note">For details on rejections usage, refer to
    [Defining Rejections Guide](/docs/guides/creating-rejection-messages.html).</p>

#### Server-side code

To avoid unwanted dependencies we find it useful to put server-side code under 
a sub-package called `server` with sub-packages for corresponding entity types: 

 * `io.acme.todolist.server.task`
 * `io.acme.todolist.server.project`
 * `io.acme.todolist.server.comment`
  
## Handcrafted Java Classes

### Entities 

When naming entities we find it natural to start with a name of a state class and then
add a suffix which tells the type of the entity:

  * `ProjectAggregate`
  * `OrderProcessManager`
  * `TaskItemProjection`  

The suffix helps for observing together with other entities in a package. 

For process managers it may be enough to have the `Process` suffix dropping `Manager` 
which frequently worked for us too. Other options for suffixes are `Pm` or `Procman`.
 
<p class="note">It would be a good idea to decide on such suffix as a team standard before you
    start coding.</p>  
  
#### Repositories

We recommend _not_ using a type infix for naming repository classes. Alphabetical sorting would
make a repository class be next to an entity class, and you would not deal much with repository 
classes anyway. Thus, it is just `SomethingRepository` rather than `SomethingAggregateRepository`:

  * `ProjectRepository`
  * `OrderRepository`
  * `TaskItemRepository` 

### Bounded Contexts

#### Names

Bounded Contexts names follow `TitleCapitalization` favoring plurals:

  * `Users`
  * `Tasks`
  * `DeliveredOrders`
    
Although, singular names are perfectly fine too, for example:

  * `Billing`
  * `Shipping`
  * `DynamiteProduction`

#### Packages

If a name of a Bounded Context is used in a package, its name is transformed according to the rules
of a programming language.

#### Factory classes

A Java class that creates and configures an instance of a `BoundedContext` is named after the
name of the context with the `Context` prefix:

  * `UsersContext`
  * `DeliveredOrdersContext`
  * `OnboardingContext`
