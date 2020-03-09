---
title: Rules
headline: Documentation
bodyclass: docs
layout: docs
type: markdown
---

# Rules

Here are the ground rules the framework is built upon:

1. An update to a business model <em>is</em> an event. 

2. Entities are changed in response to events.
   
3. A command has one and <em>only one</em> handler.

4. A command <em>must</em> result in an event, a rejection, or other commands.

5. Events are <em>always</em> appended. Never deleted or edited.
 
