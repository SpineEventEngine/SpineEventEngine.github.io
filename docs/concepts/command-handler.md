---
title: Command Handler
headline: Command Handler
bodyclass: docs
layout: docs
sidenav: doc-side-concepts-nav.html
type: markdown
---
<h2 class="top">Command Handler</h2> 

Command Handler is an object which receives commands, modifies the state of the application, and generates events if the modification was successful. 
Here is a code example which shows how a method which handles this kind of messages looks like.
<code>final class TaskProjection
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
}</code>
For more details, refer to [Java](/java/index.md) section.
