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
Here is a code example which shows how a method which handles this kind of messages looks like.
<code>final class TaskAggregate
    extends Aggregate&lt;TaskId, Task, TaskVBuilder&gt; {
    ...
    @Assign
    TaskCreated handle(CreateTask cmd, CommandContext ctx) {
        return TaskCreated
                .vBuilder()
                .setId(cmd.getId())
                .setName(cmd.getName())
                .setOwner(ctx.getActor())
                .build();
    }
    ...
}
</code>