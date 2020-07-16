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

After the session, a dedicated person creates a Pull Request with the session artifacts and the 
team reviews the EventStorming session once again. Going forward, the EventStorming artifacts
are updated while the new sessions are conducted.
