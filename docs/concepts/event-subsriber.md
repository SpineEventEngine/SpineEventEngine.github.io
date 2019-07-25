---
title: Event Subscriber
headline: Concepts
bodyclass: docs
layout: docs
sidenav: doc-side-concepts-nav.html
type: markdown
---
<h2 class="top">Event Subscriber</h2> 

Event Subscriber is an object that is subscribed to receive events.

Here is a code example which shows how a method which handles this kind of messages.

  ```
  final class TaskProjection
      extends Projection<TaskId, TaskItem, TaskItemVBuilder> {
      ...
      @Subscribe
      void on(TaskCompleted e, EventContext ctx) {
          builder().setWhenDone(ctx.getTimestamp());
      }
  }
  ```
