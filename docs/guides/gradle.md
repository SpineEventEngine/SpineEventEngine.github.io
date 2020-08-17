---
title: Gradle configuration
headline: Documentation
bodyclass: docs
layout: docs
---

# Configuring a project with Gradle

Spine relies on build-time tools to help us with comprehending your model. These tools are written
as [Gradle plugins](https://docs.gradle.org/current/userguide/plugins.html) — an extendable, uniform
way to tap into a project build process.

The minimal Gradle configuration you will need to start a new project is:
```gradle
plugins {
    id 'io.spine.tools.gradle.bootstrap' version '<version of Spine>'
}
```

You can also find this declaration on the [Gradle Plugin Portal](https://plugins.gradle.org/plugin/io.spine.tools.gradle.bootstrap),
along with the latest available version.

Please this config into your root `build.gradle` file and execute a Gradle build. This will apply
the Spine Bootstrap plugin to your project.

## Spine Bootstrap plugin 

Spine Bootstrap plugin (Bootstrap for short) configures a Spine Java server and JS client for you.

The idea is to use Gradle subprojects for different parts of the system:
 - One subproject would contain Protobuf definitions for the domain model. This subproject is
   typically called `model`. If the system contains more than one Bounded Context, there could be
   many subprojects, e.g. `model-users`, `model-trains`, etc. In `build.gradle` for those
   subprojects, declare:
   ```gradle
   spine.assembleModel()
   ```
   In order for two Bounded Contexts to parts of the domain model, add a dependency between
   the model subprojects:
   ```gradle
   dependencies {
       implemetation(project(':model-users'))
   }
   ```
 - Each Bounded Context should have a separate Gradle subproject for implementing server-side
   business logic. For example, `users` , `trains`, etc. In `build.gradle` for those
   subprojects, declare:
   ```gradle
   spine.enableJava().server()
   
   dependencies {
       protobuf(project(':model'))
   }
   ```
   This will add dependencies to the `spine-server` artifact and set up code generation for
   the domain model types. Note that it is perfectly normal to have more Protobuf types in
   these modules, as long as those types are internal to the server and are not a part of
   the publicly-visible domain model.
 - If your project contains a JavaScript frontend, you may declare a `web-server` subproject, which
   processes the HTTP requests from JS. In `web-server/build.gradle`:
   ```gradle
   dependencies {
       implementation("io.spine:spine-web:${spine.version()}")
       implenemtation(project(':users'), project(':trains'))
   }
   ```
   The `spine-web` artifact provides the components for handling requests from a JavaScript
   frontend. Note that `web-server` depends on all the server-side subprojects in order to be able
   to dispatch commands to and read states from their respective Bounded Contexts.
 - Finally, a JavaScript client is also one or more Gradle subprojects. In `build.gradle` for those
   subprojects, declare:
   ```gradle
   spine.enableJavaScript()
   
   dependencies {
       protobuf(project(':model'))
   }
   ```
   This configuration sets up JavaScript code generation from the `model` definitions. Handle NPM
   dependencies separately (e.g. adding the dependency for `spine-web`).
   
Here are some notable things about the described project structure and configration.
1. Use `protobuf` dependencies when you need to generate code from the Protobuf definitions from
   another subproject. Otherwise, use `implementation`.
2. The Bootstrap plugin provides the current version via `spine.version()`. This way, the version of
   the whole framework is only declared once — in the declaration of the plugin. Use this version
   when adding dependencies to optional Spine dependencies, such as `spine-money`,
   `spine-datastore`, etc.
   
## Verbose configuration

### Model Compiler

### ProtoJS Plugin
   
