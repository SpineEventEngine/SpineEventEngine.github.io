---
title: Aggregate 
headline: Concepts
bodyclass: docs
layout: docs
sidenav_list: concepts
sidenav: doc-side-nav.html
type: markdown
---
<h2 class="top">Aggregate</h2> 
Aggregate is the main building block of a business model. 
From the application point of view it consists of the following:
1. Commands which arrive to it. 
2. Events which appear in response to these commands. 
3. How these events influence the state of an aggregate.

[Aggregates](http://martinfowler.com/bliki/DDD_Aggregate.html) guarantee consistency of data modifications in response to commands they receive. Aggregate is the most common case of Command Handler. It modifies its state and produces one or more events in response to a command. These events are used later to restore the state of the aggregate.
In Spine, aggregates are <a href="https://spine.io/docs/tutorials/basic/java.html">defined as Java classes</a>, and their states are <a href="https://developers.google.com/protocol-buffers/docs/overview">defined as protobuf messages</a>.
