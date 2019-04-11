---
title: Event Reactor
headline: Concepts
bodyclass: docs
layout: docs
sidenav: doc-side-concepts-nav.html
type: markdown
---
<h2 class="top">Event Reactor</h2> 
Event Reactor is an object which usually produces one or more events in response to an incoming event. 
Unlike [Event Subscriber](/docs/concepts/event-subsriber.html), which always consumes events, a reacting object generates events in response to changes in the domain.

<p class="note">Though in some cases, Event Reactor may ignore the event, returning `Nothing`. It usually happens when a tuple is declared in the return type of a method, and `Nothing` is one possible option.
For example, there could be a return type declared like `EitherOf2<TaskReAssigned, Nothing>`.</p>