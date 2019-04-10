---
title: Event Subscriber
headline: Event Subscriber
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
      extends Projection&lt;TaskId, TaskItem, TaskItemVBuilder&gt; {
      ...
      @Subscribe
      void on(TaskCreated e) {
          builder().setId(e.getId())
                      .setName(e.getName())
      }

      @Subscribe
      void on(TaskCompleted e, EventContext ctx) {
          builder().setWhenDone(ctx.getTimestamp());
      }
  }
  ```