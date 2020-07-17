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

While the development process is described in the [introduction](/docs/introduction) section,
in the guide we want to cover the exact steps that we follow while working on a project.

## EventStorming or getting started with the domain

While omitting the steps of creating the project repository, the first step to get the project
done is to conduct an [EventStorming](https://eventstorming.com) session with the domain experts 
in the chosen field.

The results of the EventStorming session are captured as artifacts and described as part of the 
project documentation.

<p class="note">We store the EventStorming artifacts as images under the project root in the 
`/docs/event-storming/` folder. If the session is performed offline (as ideally it should be), 
the photos of the EventStorming board are stored in the repository. In case of an online 
session, the screenshots of the board are stored.</p>

<!-- TODO:2020-07-17:yuri-sergiichuk: Add photos/screenshots of conducted EventStorming sessions.
maybe blend them together as a collage. -->

After the session, a dedicated person creates a Pull Request with the session artifacts and the 
team reviews the EventStorming session once again. This first EventStorming is usually addressed as 
a "Big Picture". Going forward, the new EventStorming "Process Modeling" 
and "Software Design" sessions produce updates to the existing artifacts.

Depending on the size and the scope of the project, you may need to conduct multiple EventStorming 
session with different experts.

## Limiting the scope

While the temptation to dive into the development right away may be humongous, we recommend limiting
the scope for teams and/or developers down to dedicated bounded context and their parts.

<p class="note">Remember, <i>"eat an elephant one bite at a time"</i>.</p>

Now it's a perfect time to conduct another EventStorming session and start eating some smaller part
of the elephant. We tend to continue by rounding up a particular Bounded Context and its parts.

