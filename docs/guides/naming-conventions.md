---
bodyclass: docs
headline: Naming Conventions
layout: docs
sidenav: doc-side-guides-nav.html
title: Naming Conventions
type: markdown
---

<p>This document covers the naming conventions used in the framework and how these conventions are 
used by the code generation.</p>

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
It can be simply `commands.proto`, but usually there are many commands that are handled by 
different aggregates. So, it's convenient to name such files after the type of the target
aggregate: 

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

## Types

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

Events are names as facts formulated as past participles:

  * `ProjectCreated`
  * `TaskAssigned`
  * `CommentRemoved`   

### Entity States

Protobuf messages for entity states are defined using nouns:

  * `Project`
  * `Task`
  * `Comment`
  
Avoid using suffixes like `Aggregate`, `Projection`, `ProcessManager` when defining a proto type,
because:
 1. You may want to use these words when defining Java classes that use these data types.
 2. These data structures do not represent the whole `Aggregate` or `Projection` thing anyway. 
    They are just data.
 
## Packages

### Proto packages

 <!-- TODO:2018-11-21:alexander.yevsyukov: Write text. -->

### Java packages

 <!-- TODO:2018-11-21:alexander.yevsyukov: Write text. -->

#### Commands

 <!-- TODO:2018-11-21:alexander.yevsyukov: Write text. -->

#### Events

 <!-- TODO:2018-11-21:alexander.yevsyukov: Write text. -->

#### Rejections

 <!-- TODO:2018-11-21:alexander.yevsyukov: Write text. -->

