---
title: Snapshot
headline: Snapshot
bodyclass: docs
layout: docs
sidenav: doc-side-concepts-nav.html
type: markdown
---
<h2 class="top">Snapshot</h2> 

Snapshot is a state of an Aggregate. A snapshot ”sits” in between events in the history, so that you do not have to replay them all. 
You read events backwards until you encounter a snapshot, then apply it to the Aggregate, and then play trailing events.