---
title: Command Handler
headline: Concepts
bodyclass: docs
layout: docs
sidenav: doc-side-concepts-nav.html
type: markdown
---
<h2 class="top">Command Handler</h2> 

Command Handler is an object which receives commands, modifies the state of the application, and generates events if the modification was successful.

```
final class TaskAggregate
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
```
For more details, refer to [Java](/java/index.md) section.
