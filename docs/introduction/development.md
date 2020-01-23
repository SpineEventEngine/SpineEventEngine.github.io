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
 
It is likely that the solution would have several [Bounded Contexts](concepts.html#bounded-context). 
For each context developers need to define:
  * [Identifiers](concepts.html#identifier) for entities
  * Value Objects
  * [Events](concepts.html#event)
  * [Commands](concepts.html#command)
  * [Rejections](concepts.html#rejection)
  * States of [Aggregates](concepts.html#aggregate),
    [Process Managers](concepts.html#process-manager), and [Projections](concepts.html#projection).

It is likely that some of the bits of this picture would change during the process.
But the picture should be complete to the best knowledge of the domain experts to avoid “surprises”
down the road. We return to this step when we discover inconsistencies in the model, or we need
more information about how the business works from the experts.

## Defining data model

At this stage we select one of the Bounded Context for the implementation. Each Bounded Context is
developed separately. In this sense it can be seen as a microservice.

Implementation starts from the definition of types of identifiers, events, commands, rejections, and
states of entities of the selected context. These types are defined as Protobuf messages.

The [Mode Definition](/docs/guides/model-definition.html) guide describes this stage in details.

## Adding business logic
  
## Writing tests

## Deployment

## Repeat
 


  

