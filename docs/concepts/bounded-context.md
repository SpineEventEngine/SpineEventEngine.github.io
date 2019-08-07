---
title: Bounded Context
headline: Concepts
bodyclass: docs
layout: docs
sidenav_list: concepts
sidenav: doc-side-nav.html
type: markdown
---
<h2 class="top">Bounded Context</h2> 

Bounded Context is an autonomous component with its own domain model and its own Ubiquitous Language. 
Large systems usually have multiple Bounded Contexts. 

For example, you can consider `Orders`, `UserManagement`, `Shipping` as examples of the separate contexts within online retail system. 

In Spine, interaction between Bounded Contexts is organized using Integration Events.

