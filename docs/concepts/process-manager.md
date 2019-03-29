---
title: Process Manager Concept
headline: Process Manager
bodyclass: docs
layout: docs
sidenav: doc-side-concepts-nav.html
type: markdown
---
<h2 class="top">Process Manager</h2> 

Process Manager is an independent component that reacts to domain events in a cross-aggregate eventually consistent manner. It serves as a centralized processing unit that maintains the state sequence and defines the next processing step based on intermediate results. 

[Process manager](/java/process-manager.md) can be both Command Handler and Event Handler.

Note: A constructor for  Process Manager can have no parameter at all.  

Tip: We recommend to use process ID when integrating with side services. 