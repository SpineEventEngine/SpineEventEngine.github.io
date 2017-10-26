---
layout: post
title: Event Sourcing in Akka Persistence
published: true
---

The key concept behind Akka persistence is that only changes to an actor's internal state are persisted but never its current state directly (except for optional snapshots).

This technology is mentioned in <a href="http://www.infoq.com/presentations/event-sourcing-groovy" target="_blank">“Richer Data History with Event Sourcing”</a> talk.﻿

For further reading you can check  <a href="http://doc.akka.io/docs/akka/current/scala/persistence.html" target="_blank">Akka documentation</a>.
