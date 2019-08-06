---
title: Process Manager
headline: Concepts
bodyclass: docs
layout: docs
sidenav_list: concepts
sidenav: doc-side-nav.html
type: markdown
---
<h2 class="top">Process Manager</h2> 

Process Manager is an independent component that reacts to domain events in a cross-aggregate eventually consistent manner. It serves as a centralized processing unit that maintains the state sequence and defines the next processing step based on intermediate results. 

Process Manager can be both Command Handler and Event Subscriber.

<p class="note">We recommend to use process ID when integrating with side services. 
</p>
