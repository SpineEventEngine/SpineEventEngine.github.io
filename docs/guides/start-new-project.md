---
title: Starting a new project
headline: Documentation
bodyclass: docs
layout: docs
---

# Starting a new project

<p class="lead">Identifying a particular development flow may be challenging at times. 
Making the flow efficient and straight-forward is even harder. This guide will walk you through 
the way we tend to start and develop new projects.</p>

While the development process is described in the [Introduction](/docs/introduction 
"Check the Introduction") section, in this guide we want to cover the steps that we follow 
while working on a project in more detail.

## TL;DR 

In short, please follow the next steps to have a consistent joyful development flow.

<p class="note">Each step and sub-step below results in a separate Pull Request 
as well as its artifacts in the repository.</p>

1. Conduct [EventStorming][EventStorming] to gather domain knowledge. 
Digitize the Artifact and store it in the code repository.

2. Pick up a [Bounded Context][BoundedContext-concept].

3. Define [identifiers][identifier-concept] for the entities of the selected context.

4. Define [signals][signals]:

    4.1 Define [events][event-concept].

    4.2 Define [commands][command-concept].

    4.3 Define [rejections][rejection-concept].

5. Pick up a scenario (a use case, a process, or a flow) within the Bounded Context:

    5.1. Define [entity][entity-concept] states for the scenario.

    5.2 Implement the scenario server-side functionality in Java code. 
    Cover the business logic with [`BlackBox`][testing] integration tests.

    5.3 Fulfill the scenario vertically: create UI, public API, or a client whichever is required.

6. Repeat step 5 until all the scenarios are covered.

7. Repeat steps 2 through 6 for the other contexts.

The sections below describe the development process in more detail.


## Getting started with a domain: EventStorming

The first thing to get the project done is to conduct an [EventStorming][EventStorming] session 
with the Domain Experts in the chosen field.

The EventStorming allows both the business people and the engineers to start talking using 
the same “language” fast. It is important for engineers to avoid using technical jargon.

The results of the EventStorming (all the stickies) are captured as the Artifact and stored 
as a part of the project documentation.

<p class="note">We store the EventStorming Artifact electronically as images under the project root 
in the `/docs/event-storming/` folder. If the session is performed offline (as ideally 
it should be), the photos of the EventStorming board are stored in the repository. 
In the case of an online session, the screenshots of the board are stored.</p>

{: .img-small}
![An example of the EventStorming board]({{ site.baseurl }}/img/starting-a-new-project/event-storming-board.jpg)
<p class="text-center font-weight-light">An example of the EventStorming board</p>

After the session, a dedicated person creates a Pull Request with the Artifact, and the team reviews 
it once again. This first EventStorming is usually addressed as a "Big Picture" and gives 
the team and the experts a broad overview of the problem they are trying to solve.
 
Going forward, the next EventStorming "Process Modeling" and "Software Design" sessions 
produce updates to the Artifact.

Depending on the size and the scope of the project, you may need to conduct multiple EventStorming 
sessions with different experts.

## Limiting the scope: pick up a Bounded Context

While the temptation to dive into the development of everything right away may be humongous, 
we recommend limiting the development scope down to only one [Bounded Context][BoundedContext].

<p class="note">We follow the rule: <i>"Eat an elephant one bite at a time"</i>.</p>

You may need another EventStorming session to go into more detail.

![An example of a Bounded Context]({{ site.baseurl }}/img/starting-a-new-project/bounded-context.jpg)
<p class="text-center font-weight-light">An example of a Bounded Context</p>

## Shaping the language

With the selected Bounded Context in mind, we continue with the creation of the first code 
artifacts of the project. During this step we define Protobuf messages that mold the 
[Ubiquitous Language][UbiquitousLanguage] of the context.

The results of these efforts are the `.proto` files 
[grouped](/docs/introduction/project-structure.html#example "Check out the Example Project structure") 
under a specific package in the `proto` folder.

<p class="note">If you are new to Protobuf, please see the 
[Naming Conventions](/docs/introduction/naming-conventions.html "Check out the Naming Conventions") 
section for how to name things in the proto code.</p>

While writing the protos, make sure to document **all** messages. It's time to unleash 
your technical writing skills and contribute to the project's ground-standing foundation. 
Here you may want to introduce some domain-level validation logic. Check out the 
[Validation guide](/docs/guides/validation.html "Learn more about the Validation") for details.

### Identifiers

We put this step aside because in [Reactive DDD][ReactiveDDD] entities reference each other using 
the typed [identifiers][identifier-concept].

<p class="note">Consider following the [Vaughn Vernon](/docs/resources/people.html#vaughn-vernon)’s 
rule on Aggregates from the “Effective Aggregate Design Part II” that is applicable to **any** 
entities: <i>“Reference other Aggregates by Identity”</i></p>

We recommend using message-based identifiers over simple types to make the API strongly pronounced 
and type-safe. To make things obvious, consider putting the IDs of the context into the file named 
[`identifiers.proto`][identifiers-proto]. This file will be imported when defining events, 
commands, entity states, and other types of the selected context.

<p class="note">Please consult with the Naming Conventions [guide][identifiers-naming] for our 
recommendations on naming the identifier types.</p>

When the ID types are defined, please create a Pull Request so that the team can review 
and polish the code of this important development step.

### Events

When the IDs are defined it’s time to define [event][event-concept] messages. The events are named 
as facts formulated as past participles. They are defined in files with the 
[`_events.proto`][events-proto] suffix (e.g. `order_events.proto`, `customer_events.proto`). 
If your context is small it can be just `events.proto`.

Create a Pull Request with the event definitions when they are done.

### Commands

Similar to events, [command][command-concept] messages are defined in files which name ends with 
the [`_commands.proto`][commands-proto] suffix (or just `commands.proto` for a small context). 
Commands are defined as imperative in a form of “do something”, e.g. `RegisterRepository` 
or `CreateTask`.

Finalize defining commands with a Pull Request.

### Rejections

[Rejections][rejection-concept] are special events that denote a command failed for a reason. 
The rejection messages are defined in files with the [`_rejections.proto`][rejections-proto] suffix 
(or just `rejections.proto`). For more information on the rejections, please refer to the 
[“Working with Rejections”][rejections-guide] guide.

Create a new Pull Request and review rejection definitions.

## Picking up a scenario

A scenario is a defined finite part of the context. It can be either a use case, a business process, 
or a complete functional flow.

<!-- TODO:2020-07-24:yuri-sergiichuk: Add an example of how to pick up a scenario. -->

If you see it getting too big, it may be worth splitting it into two or more smaller parts. 
For example, you may want to start with a single [Aggregate][aggregate-concept] or a 
[Process Manager][process-manager-concept].

### Entity states

The [entity state][entity-state-naming] is a holder of the entity data. It does not represent 
a whole [entity][entity-concept] but depicts the shape of its data.

The definitions of entity states are [gathered][entity-state-proto] in a file named after 
a business model thing. E.g. for a `Task` aggregate, the definitions would be defined in 
a `task.proto` file.

As with the other steps, create a Pull Request to review the entity states with the team.

### Adding behavior

The desired implementation of the scenario has the Java implementation of the domain 
[entities][entities] and the [`BlackBox`][testing] integration tests. The `BlackBox` tests are 
the recommended way to test scenarios in Spine. They are specifically built to allow you to check 
the business logic the same way it works in the application.

<!-- //TODO:2020-07-20:yuri-sergiichuk: add links to the BBC examples/guides.
 See https://github.com/SpineEventEngine/SpineEventEngine.github.io/issues/339.
 -->

All the code must conform to the defined standards of the code and documentation quality 
as well as be tested thoroughly.

When a backend for the scenario is done a new PR is created and reviewed.

### Fulfilling the vertical

We usually do the vertical development, meaning an engineer starts with the domain definition, 
continues with its implementation, and finishes with the front-facing tasks.

Depending on your team workflow and preferences this step can take place in parallel 
with the previous one.

As noted, the scope of this iteration is to prepare the front-facing part for the scenario: 
either a UI if one is needed, or the public API, or a dedicated idiomatic client.

As soon as the implementation is ready, another PR and review come along.

## Start over again

When the scenario is finished, pick up a new one and start it over again following the PR 
and review process.

As soon as the Bounded Context is fulfilled the team can continue with the next one.

## Summary

While developing a project, make sure to split the development by Bounded Contexts. Pick up 
a context and split it further on scenarios. Make sure each of the development steps results 
in a separate Pull Request that results in dedicated artifacts in the source code repository. 
Tend to have smaller, fine-graded Pull Requests over cluttered and complicated ones.

[EventStorming]: https://eventstorming.com "Learn more about EventStorming"
[BoundedContext-concept]: /docs/introduction/concepts.html#bounded-context "Check out the Bounded Context definition"
[identifier-concept]: /docs/introduction/concepts.html#identifier "Learn more about Identifiers"
[event-concept]: /docs/introduction/concepts.html#event "Learn more about Events"
[command-concept]: /docs/introduction/concepts.html#command "Learn more about Commands"
[rejection-concept]: /docs/introduction/concepts.html#rejection "Learn more about Rejections"
[entity-concept]: /docs/introduction/concepts.html#entities "Learn more about Entities"
[signals]: /docs/introduction/#getting-domain-knowledge "Learn more about Signals"
[testing]: /docs/introduction/#testing "Learn more about Testing"
[UbiquitousLanguage]: https://martinfowler.com/bliki/UbiquitousLanguage.html "Learn more about the Ubiquitous Language"
[ReactiveDDD]: https://www.infoq.com/presentations/reactive-ddd/ "Check out the Reactive DDD presentation"
[identifiers-proto]: /docs/introduction/naming-conventions.html#identifiersproto "Learn more about Identifiers proto structure"
[identifiers-naming]: /docs/introduction/naming-conventions.html#identifiers "Learn more about Identifiers naming conventions"
[events-proto]: /docs/introduction/naming-conventions.html#eventsproto "Learn more about Events proto structure"
[commands-proto]: /docs/introduction/naming-conventions.html#commandsproto "Learn more about Commands proto structure"
[rejections-proto]: /docs/introduction/naming-conventions.html#rejectionsproto "Learn more about Rejections proto structure"
[rejections-guide]: /docs/guides/rejections.html "Learn more about Rejections"
[aggregate-concept]: /docs/introduction/concepts.html#aggregate "Check out the Aggregate definition"
[process-manager-concept]: /docs/introduction/concepts.html#process-manager "Check out the Process Manager definition"
[entity-state-naming]: /docs/introduction/naming-conventions.html#entity-states11 "Learn more about Entity states"
[entity-state-proto]: /docs/introduction/naming-conventions.html#entity-states "Learn more about Entity states proto structure"
[entities]: /docs/introduction/#entities "See more examples on entities"
