---
title: Snapshot
headline: Concepts
bodyclass: docs
layout: docs
sidenav_list: concepts
sidenav: doc-side-nav.html
type: markdown
---
<h2 class="top">Snapshot</h2> 

Snapshot is a state of an Aggregate. A snapshot ”sits” in between events in the history.
 
`AggregateStorage` reads events backwards until encounters a snapshot, applies it to the Aggregate, and plays trailing events.
