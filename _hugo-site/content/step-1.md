---
_build:
  render: false
---

```proto
// Create a new task.
message CreateTask {
    TaskId id = 1; // assumed `required`
    string name = 2 [(required) = true];
    string description = 3;
}
```

```proto
// A new task has been created.
message TaskCreated {
    TaskId task = 1 [(required) = true];
    string name = 2 [(required) = true];
    string description = 3;
    spine.core.UserId owner = 4 [(required) = true];
}
```

```proto
// A task which can be assigned to a user.
message Task {
    option (entity).kind = AGGREGATE;
    TaskId id = 1; // assumed `required`
    string name = 2 [(required) = true];
    string description = 3;
    spine.core.UserId owner = 4 [(required) = true];
    spine.core.UserId assignee = 5;
}
```
