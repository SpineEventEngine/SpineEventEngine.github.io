---
title: Integration Event
headline: Concepts
bodyclass: docs
layout: docs
sidenav: doc-side-concepts-nav.html
type: markdown
---
<h2 class="top">Integration Event</h2> 

Integration Events are <a href="{{ site.baseurl }}/docs/concepts/event.html">Events</a> used to communicate between different Bounded Contexts. 

In Spine, every domain Event may become an Integration Event, if it is emitted by the given Bounded Context and consumed by other Bounded Contexts. 
