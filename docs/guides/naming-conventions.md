---
title: Naming Conventions
headline: Naming Conventions
bodyclass: docs
layout: docs
sidenav: doc-side-guides-nav.html
type: markdown
---

<p>This document covers the naming conventions for the code. Some of these contentions are used by 
the framework and code generation, and as such are required. Others are our recommendations that 
we find useful for making things clear and structuring the code.</p>

## Proto files

Proto files are named using the `snake_case`, as defined by Protobuf. There are several special
kinds of files.

### Identifiers   

Commands and events reference model entities via their identifiers. 
Having typed identifiers makes a model type safe.
Although the framework also supports `String`, `Integer`, and `Long` as valid ID types, 
we strongly recommend defining custom ID types like `CustomerId`, `OrderId`, `ShipmentId`, etc. 
You can find similar cases in the framework API which has `EventId`, `CommandId`, `UserId`, 
`TenantId`, etc. 

We found it convenient to define ID types in one file called `identifiers.proto`. 
A typical project is likely to have more than one Bounded Context, so you
are going to have several `identifiers.proto` each residing under the directory with proto
files defining the data model of the corresponding Bounded Context.   

### Command definitions

Commands are defined in a file which names end with `commands.proto`. 
It can be simply `commands.proto`, but usually commands are handled by different entities. 
So, it's convenient to name such a file after the type of the target entity, 
for instance, an aggregate: 

 * `blog_commands.proto` 
 * `order_commands.proto` 
 * `customer_commands.proto`

### Event definitions

Similarly to commands, events are defined in files which names has the `events.proto` suffix:

 * `blog_events.proto` 
 * `order_events.proto`
 * `customer_events.proto`.

### Rejection definitions

`Rejection` is a special — so to say, “negative” — kind of events supported by the framework. 
A rejection is thrown if a command cannot be handled. Think exceptions, but of non-technical flavor.

Similarly to events, rejections are defined in files ending with `rejections.proto`:

  * `blog_rejections.proto` 
  * `order_rejections.proto`
  * `customer_rejections.proto`.

For each aggregate you are likely to have all the three kinds of files because a command leads to
an event, and it's likely there are conditions under which a command cannot be handled.

### Entity states

We recommend gathering definition of related entity states in a file named after a business model
thing. Suppose we have a `Task` aggregate, `TaskItem` and `TaskDetails` projections, and
a Process Manager which is responsible for movement of a task from one project to another, there
would be `task.proto` file, with all Task-related data types definitions. A project-related data
types would be defined in a `project.proto` file. 

As we wrote earlier, `TaskId` and `ProjectId` are defined in the `identifiers.proto` file, and
`task.proto` and `project.proto` import this file.

## Data types

Data types are defined as Protobuf messages using `TitleCapitalization`.

### Identifiers

Identifiers are usually defined after the name of the entity with the `Id` suffix:

  * `ProjectId`
  * `TaskId`
  * `CommentId`
  
You'll find such naming pattern in the API of the framework. For example, `EventId`, `CommandId`,
`UserId`, `TenantId`, etc.    

<!-- TODO:2018-11-21:alexander.yevsyukov: Make this as a Note block. -->

This convention is not a requirement. We find `Id` suffix short yet meaningful for building a rich
type-safe API. You may select another convention that fits your domain best. But please be informed
that future version of the framework tools will use the `Id` suffix of the types and `_id` suffix
of proto field names for code scaffolding and improving intelligence of code generation.  

### Commands

A command is defined as an imperative:

 * `CreateProject`
 * `AssignTask`
 * `RemoveComment`
 
### Events

Events are named as facts formulated as past participles:

  * `ProjectCreated`
  * `TaskAssigned`
  * `CommentRemoved`   

### Rejections

A rejection is named after a reason of why a command cannot be handled. It's a fact about a state
of a domain model:

  * `TaskAlreadyExists`
  * `InsufficientFunds` 
  * `ProjectAlreadyCompleted`

### Entity States

Protobuf messages for entity states are defined using nouns:

  * `Project`
  * `Task`
  * `Comment`
  
Avoid using suffixes like `Aggregate`, `Projection`, `ProcessManager` when defining a proto type,
because:
 1. You may want to use such a word when creating an entity Java class which _uses_ 
    a generated data type for holding the state of the entity.
 2. Such a data structure does not represent a whole `Aggregate` or `ProcessManager` thing anyway. 
    It's just data.
 
## Packages

Packages allow to form namespaces for types, avoiding clashes. It is customary to have a “root” 
package for an organization or a service name. Most likely, each Bounded Context would have 
a dedicated package.

Examples in this guide assume that a fictitious company called 
[Acme Corporation](https://en.wikipedia.org/wiki/Acme_Corporation) creates a SaaS solution.
The company has a web presence site with the domain name `acme.io`.
The solution is a task management application called Todo List, 
which will be hosted at`todolist.acme.io`.    

### Proto packages

Packages in Protobuf do not follow the reverse Internet domain name convention, 
which is customary in Java. It would make sense to have a root package for all the types defined
in an organization under the root package with a lowercase company name.

For the fictitious SaaS project of the Acme Corporation it would be:

```proto
package acme.todolist;
```

### Java packages

Java does not have the notion of package nesting. Packages in Java are separated namespaces,
which seem hierarchical for convenience. Still, when it comes to placing source code files
in a project, there is usually nesting formed by the directories in a file system.

Spine framework uses this notion of “nesting” for marking multiple packages of a server-side code 
[belonging to a Bounded Context](https://spine.io/core-java/javadoc/server/io/spine/server/annotation/BoundedContext.html)
easier. But this is a convenience feature, not a requirement.
   
Also there are several recommendations as to organizing generated and handcrafted code.

#### Have package per data type

It's easier to see everything related to a type, if all the generated code comes under a 
“home” package of a data type. For example: 

 * `io.acme.todolist.task`
 * `io.acme.todolist.project`
 * `io.acme.todolist.comment` 

This package would be a part of the API shared between client- and server-side code of your 
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
The class, of course, is placed into a `rejection` package of the corresponding type.
 
The package also contains generated `Throwable` _top-level_ classes that match rejection messages. 
These classes are used in the `throws` clause of command handling methods.

The arrangement with message classes nested under `Rejections` class, and top-level `Throwable`s
is required to avoid name clashes while keeping these generated classes under the same package.

#### Server-side code

To avoid unwanted dependencies we find it useful to put server-side code under 
a sub-package called `server`, with sub-packages for corresponding entity types: 

 * `io.acme.todolist.server.task`
 * `io.acme.todolist.server.project`
 * `io.acme.todolist.server.comment`
  
## Handcrafted Java Classes

### Entities 

When naming entities we find it natural to start with a name of astate cass and then
add a suffix which tells the type of the entity:

  * `ProjectAggregate`
  * `OrderProcessManager`
  * `TaskItemProjection`  

The suffix helps when observing together with other entities in a package. For process managers
it may be enough to have the `Process` suffix, dropping `Manager`, which frequently worked 
for us too.
  
#### Repositories

We recommend _not_ using a type infix for naming repository classes. Alphabetical sorting would
make a repository class be next to an entity class. And you would not deal much with repository 
classes anyway. So, it's just `SomethingRepository`, rather than `SomethingAggregateRepository`:

  * `ProjectRepository`
  * `OrderRepository`
  * `TaskItemRepository` 

### Bounded Contexts

#### Names

Names of Bounded Contexts follow `TitleCapitalization` favoring plurals:

  * `Users`
  * `Tasks`
  * `DeliveredOrders`
    
Although, singular names are perfectly fine too:

  * `Billing`
  * `Shipping`
  * `DynamiteProduction`

#### Packages

If a name of a Bounded Context is used in a package, its name is transformed according to rules
of a programming language.

#### Factory classes

A Java class that creates and configures an instance of a `BoundedContext` is named after the
name of the context with the `Context` prefix:

  * `UsersContext`
  * `DeliveredOrdersContext`
  * `OnboardingContext`
