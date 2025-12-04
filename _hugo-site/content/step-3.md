---
_build:
  render: false
---

```proto
final class TaskAggregate extends Aggregate<TaskId, Task, Task.Builder> {

    @Assign
    TaskCreated handle(CreateTask cmd, CommandContext ctx) {
        return TaskCreated.newBuilder()
                    .setTask(cmd.getId())
                    .setName(cmd.getName())
                    .setDescription(cmd.getDescription())
                    .setOwner(ctx.getActorContext().getActor())
                    .vBuild(); // validate the event
    }

    @Apply
    private void event(TaskCreated e) {
        builder().setName(e.getName())
                 .setDescription(e.getDescription())
                 .setOwner(e.getOwner());
    }
}
```

```proto
@DisplayName("Handling `CreateTask` command should")
public class TaskCreationTest extends ContextAwareTest {

    private TaskId task;
    private String name;
    private String description;
    ...
    @BeforeEach
    void postCommand() {
        CreateTask cmd = generateCommand();
        context().receivesCommand(cmd);
    }

    @Test
    @DisplayName("generate `TaskCreated` event")
    void eventGenerated() {
        TaskCreated expected = expectedEvent();
        context().assertEvent(TaskCreated.class)
                 .comparingExpectedFieldsOnly()
                 .isEqualTo(expected);
    }

    @Test
    @DisplayName("create a `Task`")
    void aggregateCreation() {
        Task expected = expectedAggregateState();
        context().assertEntityWithState(task, Task.class)
                 .hasStateThat()
                 .comparingExpectedFieldsOnly()
                 .isEqualTo(expected);
    }
}
```
