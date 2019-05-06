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
    extends Aggregate<TaskId, Task, TaskVBuilder> {
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
<p class="note">[Aggregate](https://spine.io/docs/concepts/aggregate.html) is an example of such classes. 
Objects can be `Aggregate`, `ProcessManager` and others inheriting `AbstractCommandHandler`. 
All above-mentioned classes implement `CommandHandler` interface.</p>

For more details, refer to [Java](/java/index.md) section.
