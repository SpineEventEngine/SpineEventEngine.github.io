---
title: Starting a new project
headline: Documentation
bodyclass: docs
layout: docs
---

# Starting a new project

<p class="lead">Starting a new project and identifying a particular development flow may 
be challenging at times. Making the flow efficient and straight-forward is even harder.
This guide will walk you through the way we tend to start and develop new projects.</p>

While the development process is described in the [introduction](/docs/introduction 
"Check the Introduction") 
section, in the guide we want to cover the exact steps that we follow while working on a project.

## TL;DR 

In short, please follow the next steps to have a consistent joyful development flow:

1. Conduct EventStorming to gather domain knowledge, store the session board images in the repo.

2. Pick up a domain you'd like to start with.

    2.1 Define signals and entities as Protobuf messages for the chosen domain.

    2.2 Pick up a scenario (a use case, a process, or a flow) within the bounded context.
    
    2.3 Implement the scenario server-side functionality in Java code. Cover the business logic
        with Black Box Context (BBC) integration tests.
        
    2.4 Fulfill the scenario vertical: create UI, public API, or a client whichever is required.
    
    2.x Repeat steps 2.2—2.4 till all the scenarios are covered.

3. Repeat step 2 for the other domains.

Make sure you have a dedicated Pull Request for each and every step and sub-step.

## EventStorming or getting started with the domain

While omitting the steps of creating the project repository, the first step to get the project
done is to conduct an [EventStorming](https://eventstorming.com "Learn more about EventStorming") 
session with the domain experts in the chosen field.

The results of the EventStorming session are captured as artifacts and described as part of the 
project documentation.

<p class="note">We store the EventStorming artifacts as images under the project root in the 
`/docs/event-storming/` folder. If the session is performed offline (as ideally it should be), 
the photos of the EventStorming board are stored in the repository. In case of an online 
session, the screenshots of the board are stored.</p>

<!-- TODO:2020-07-17:yuri-sergiichuk: Add photos/screenshots of conducted EventStorming sessions.
maybe blend them together as a collage. -->

After the session, a dedicated person creates a Pull Request with the session artifacts and the 
team reviews them once again. This first EventStorming is usually addressed as a "Big Picture". 
Going forward, the new EventStorming "Process Modeling" and "Software Design" sessions 
produce updates to the existing artifacts.

Depending on the size and the scope of the project, you may need to conduct multiple EventStorming 
session with different experts.

## Limiting the scope

While the temptation to dive into the development right away may be humongous, we recommend limiting
the scope for teams and/or developers down to a dedicated 
[Bounded Context](/docs/introduction/concepts.html#bounded-context) and its parts.

<p class="note">Remember, <i>"eat an elephant one bite at a time"</i>.</p>

Now it's a perfect time to conduct another EventStorming session and start eating some smaller part
of the elephant. We tend to continue by rounding up a particular Bounded Context.

## Shaping the language

With a dedicated Bounded Context in mind, now it's time to create the first "code" artifacts of the 
project. 

For the Bounded Context we define Protobuf messages that mold the 
[Ubiquitous Language](https://martinfowler.com/bliki/UbiquitousLanguage.html 
"Learn more about the Ubiquitous Language") of the context. 

The result of these efforts are the `.proto` files grouped under a specific package.

<!-- TODO:2020-07-17:ysergiichuk: add an example of such a package structure -->

<p class="note">The naming conventions are covered in the 
[Naming Conventions](/docs/introduction/naming-conventions.html "Check the Naming Conventions") 
section.</p>

<!-- TODO:2020-07-17:yuri-sergiichuk: Add examples of the .proto files and folders structure. -->  

While writing the protos, make sure to document **all** messages. It's time to unleash 
your technical writing skills and contribute to the project ground-standing foundation. 
Here you may want to introduce some domain-level validation logic. Check out the 
[Validation guide](/docs/guides/validation.html "Learn more about Validation") for details. 

When the proto definitions are ready, a new Pull Request is created and reviewed by the team.

## Picking up a scenario

With the defined proto messages it's time to pick up a scenario to be implemented.

The scenario is a defined finite part of the context. It's either a use case described 
in the context, or a process, or maybe a complete functional flow if it fits into the expected time
to implement your team is used to.

### Implementing the backend

We're tending to start with the backend, so this point usually contains the backend implementation
of the scenario.

The minimum desired implementation of a scenario has the Java implementation of the domain
entities, and the Black Box Context (BBC) integration tests. 

We assume here that the Java code conforms to the teams defined standards for the code quality 
and documentation. 

The BBC tests are the recommended way to test scenarios in Spine. They are specifically 
built to allow you checking your business logic the same way it works in the real application.

<!-- //TODO:2020-07-20:yuri-sergiichuk: add links to the BBC examples/guides -->

As with the other steps, when a backend for the scenario is done a new PR is created and reviewed.

### Fulfilling the vertical

We're usually doing the vertical development, meaning an engineer starts with 
the domain definitions, continues with its implementation and finishes with the UI, 
dedicated public API or a client whichever is needed for the task to be done. 
Depending on your team workflow and preferences this step can take place in parallel 
with the previous one. 

As noted, the scope of this part is to prepare the UI for the scenario if one is needed or 
the exposed public API or a dedicated idiomatic client.

As soon as the implementation is ready, another PR and review comes along.

## Start over again

When a scenario is finished, pick up a new one and start it over again through the PR and review
process.

And when a particular Bounded Context is fulfilled the team can continue with the next one as well.
Although, in some cases you may find it easier to iterate over the linked scenarios from 
different contexts which is perfectly fine.
