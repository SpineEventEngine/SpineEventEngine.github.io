---
title: Rejection
headline: Concepts
bodyclass: docs
layout: docs
sidenav: doc-side-concepts-nav.html
type: markdown
---
<h2 class="top">Rejection</h2> 

Rejection is a state of business logic which can be handled by the end user. It's a special “negative” kind of events. 

In Spine, rejections are defined as Protobuf messages. If an event is a fact of something that happened to a domain model, a rejection is a fact that states the reason why a command was not handled. 

Consider the following examples of rejections: 
* `CreditCardValidationDeclined`, 
* `OrderCannotBeEmpty`, 
* `InsufficientFunds`.