---
title: Getting Started with Spine in Java
headline: Getting Started with Spine in Java
bodyclass: docs
layout: docs
sidenav: doc-side-quickstart-nav.html
type: markdown
---
<p>This guide helps you get started with minimal server-side application in Java with a simple
working example.</p>
<hr>
## Prerequisites
1.  Make sure you have JDK 8 or higher installed.
2.  Clone the following source code into your Git repository: 
  ```bash
  git clone git@github.com:SpineEventEngine/server-quickstart.git
  ```
3. Run `./gradlew clean build` (or `gradlew.bat clean build` on Windows) in the project root folder.
 
## Project Structure
 
The project consists of the following three modules: 
 * the `model` module
 * the `server` module
 * the `client` module
 
Their definitions and the process of their creation is described below. 
 
### The `model` Module
 
The `model` module defines  [Ubiquitous Language](https://martinfowler.com/bliki/UbiquitousLanguage.html) 
 of the application in Protobuf.
 
The `model/src/main/proto` directory contains the Protobuf definitions of the domain model:
* `Task` is an aggregate state type; as any entity type, it is marked with the `(entity)` option;
* `TaskCreated` in `events.proto` is an event of the `TaskAggregate`;
* `CreateTask` in `commands.proto` is a command handled by the `TaskAggregate`;

The model can also contain other message types, for example, identifiers (see `identifiers.proto`), value
  types, and so on.
 
### The `server` Module

The `server` module provides the following possibilities: 

1. Describes the business rules for Spine entities such as Aggregates in Java.
See the `TaskAggregate` which handles the `CreateTask` command and applies the produced
 `TaskCreated` event.
2. Plugs the `model` into the infrastructure: 
 * configures the storage;
 * creates a `BoundedContext` and registers repositories;
 * exposes the `BoundedContext` instance to the outer world using a set of gRPC services provided by the framework.
 
<p class="note">Please refer to `io.spine.quickstart.server.ServerApp` for implementation example.</p>
 
To start the server, run `ServerApp.main()` command.
 
### The `client` Module
 
The `client` module interacts with the gRPC services, exposed by the `server` module by sending: 
 * commands using the `CommandService` stub;
 * queries using the `QueryService` stub.
 
<p class="note">Please refer to `io.spine.quickstart.client.ClientApp` for implementation example.</p>
 
To start the client and see how it connects to the server, run `ClientApp.main()`.
 
## What's Next
 
Keep experimenting with your model. To do so: 
1.  Create a new command type in `commands.proto` 
  ```proto
 message AssignDueDate {
     TaskId task_id = 1;
     spine.time.LocalDate due_date = 2 [(valid) = true, (required) = true, (when).in = FUTURE];
 }
  ```
<p class="note">Remember to import `LocalDate` via `import "spine/time/time.proto";`. This type is provided by
                  the [Spine Time](https://github.com/SpineEventEngine/time) library. You do not have to make any
                  additional steps to use it in your domain.</p>
2. Create a new event type in `events.proto`:
  ```proto
 message DueDateAssigned {
     TaskId task_id = 1;
     spine.time.LocalDate due_date = 2 [(valid) = true, (required) = true];
 }
  ```
3. Adjust the aggregate state:
  ```proto
 message Task {
     option (entity).kind = AGGREGATE;
 
     // An ID of the task.
     TaskId id = 1;
 
     // A title of the task.
     string title = 2 [(required) = true];
 
     // The date and time by which this task should be completed.
     spine.time.LocalDate due_date = 3 [(valid) = true, (required) = false];
 }
  ```
 Make sure to run a Gradle build after the changing the Protobuf definitions: 
 ```bash
 ./gradlew clean build
  ```` 
 or for Windows:
  ```
 gradlew.bat clean build
  ```
4. Handle the `AssignDueDate` command in the `TaskAggregate`:
  ```java
 @Assign
 DueDateAssigned handle(AssignDueDate command) {
     return DueDateAssignedVBuilder
             .newBuilder()
             .setTaskId(command.getTaskId())
             .setDueDate(command.getDueDate())
             .build();
 }
  ```
5. Apply the emitted event:
  ```java
 @Apply
 private void on(DueDateAssigned event) {
     builder().setDueDate(event.getDueDate());
 }
  ```
6. In `ClientApp`, extend the `main()` method by posting another command:
  ```java
 AssignDueDate dueDateCommand = AssignDueDateVBuilder
         .newBuilder()
         .setTaskId(taskId)
         .setDueDate(LocalDates.of(2038, JANUARY, 19))
         .build();
 commandService.post(requestFactory.command()
                                   .create(dueDateCommand));
  ```
 and log the updated state:
  ```java
 QueryResponse updatedStateResponse = queryService.read(taskQuery);
 log().info("The second response received: {}", Stringifiers.toString(updatedStateResponse));
  ```
7. Restart the server and run the client to make sure that the due date is set to the task. 

## What's Next
- Detailed tutorial on <a href="https://spine.io/docs/tutorials/basic/java.html">creating Spine client application in Java</a>