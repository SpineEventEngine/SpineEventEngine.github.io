---
title: Documentation
headline: Documentation
bodyclass: docs
layout: docs
---
# Development Process

Building a solution based on Spine Event Engine framework is an iterative process which consists
of the stages described in this document.
 
## Getting domain knowledge

The purpose of this step is to find out what we're going to build and why.
Consider using [EventStorming](https://eventstorming.com) or other DDD-based analysis 
methodology for helping you grasp the domain knowledge from the experts.
 
Most likely that the solution would have several [Bounded Contexts](concepts.html#bounded-context). 
For each context developers need to define:
  * [Events](concepts.html#event)
  * [Commands](concepts.html#command)
  * [Rejections](concepts.html#rejection)
  * [Aggregates](concepts.html#aggregate), 
    [Process Managers](concepts.html#process-manager), and
    [Projections](concepts.html#projection).

It is likely that some of the bits of this picture would change during the process.
But the whole team, including domain experts, need to have complete understanding of how the 
business works to avoid “surprises” down the road. 

We return to learning the domain when we discover inconsistencies in the model,
or we need more information about how the business works, or the business wants to develop further
and we need to update the model.

Once we got enough domain knowledge we proceed to implementation. 

## Implementing a Bounded Context

At this stage we select one of the Bounded Contexts for the implementation.
Each context is developed separately. In this sense it can be seen as a microservice.
It would be natural to start implementing the context which initiates the business flow.

### Defining data types

Implementation starts from defining data types of the selected context as Protobuf messages.

The first step is to define entity [IDs](concepts.html#identifier). For example:
<pre class="highlight lang-proto">
<code>// The identifier for a task.
message TaskId {
    string uuid = 1;
}
</code></pre>

Then commands, events, rejections are defined:
<pre class="highlight lang-proto">
<code>// A command to create a new task.
message CreateTask {
    TaskId id = 1;
    string name = 2 [(required) = true];
    string description = 3;
}
</code></pre>

<pre class="highlight lang-proto">
<code>// A new task has been created.
message TaskCreated {
    TaskId id = 1;
    string name = 2 [(required) = true];
    string description = 3;
}
</code></pre>
 
Then we define states of entities.
<pre class="highlight lang-proto">
<code>message Task {
    (entity).kind = AGGREGATE;
    TaskId id = 1;
    string name = 2 [(required) = true];
    string description = 3;
    DeveloperId assignee = 4;
}</code></pre>
 
[Value Objects](concepts.html#value-object) are added when they are needed to describe entities
or messages like commands or events. For more information on this stage please see
the [Model Definition](/docs/guides/model-definition.html) guide.

### Adding business logic
  
### Testing

## Deployment

## Repeating the cycle

## Client application development
 


  

