---
title: Gradle configuration
headline: Documentation
bodyclass: docs
layout: docs
---

# Configuring a project with Gradle

Spine provides build-time tools for code generation and analysis. These tools are implemented
as [Gradle plugins](https://docs.gradle.org/current/userguide/plugins.html) — an extendable, uniform
way to tap into a project build process.

The minimal Gradle configuration you will need to start a new project is:

<embed-code file="examples/hello/build.gradle" start="plugins" end="}"></embed-code>
```groovy
plugins {
    id 'io.spine.tools.gradle.bootstrap' version '1.5.24'
}
```

Place the config into your root `build.gradle` file and execute a Gradle build. This will apply
the Spine Bootstrap plugin to your project.

You can also find this declaration on the [Gradle Plugin Portal](https://plugins.gradle.org/plugin/io.spine.tools.gradle.bootstrap),
or on our [Getting Started page]({{site.baseurl}}/docs/quick-start).

## Spine Bootstrap plugin 

Spine Bootstrap plugin (Bootstrap for short) can configure a Spine Java server and JS client for
you.

The idea is to use Gradle subprojects for different parts of the system.

### Model definitions

One subproject would contain Protobuf definitions for the domain model. This subproject is
typically called `model`. If the system contains more than one Bounded Context, there could be
many subprojects, e.g. `model-users`, `model-trains`, etc. In `build.gradle` for those
subprojects, declare:
```groovy
spine.assembleModel()
```
If one of the Bounded Contexts shares some domain language with another, add a dependency between
them. This way, the downstream context may use Protobuf definitions of the upstream context.
```groovy
dependencies {
    implemetation(project(':model-users'))
}
```

### Java implementation

Each Bounded Context should have a separate Gradle subproject for implementing server-side
business logic. For example, `users` , `trains`, etc. In `build.gradle` for those
subprojects, declare:
```groovy
spine.enableJava().server()

dependencies {
    protobuf(project(':model'))
}
```
This will add dependencies to the `spine-server` artifact and set up code generation for
the domain model types. Note that it is perfectly normal to have more Protobuf types in
these modules, as long as those types are internal to the server and are not a part of
the publicly-visible domain model.

<p class="note">
Note the use of the `protobuf` configuration. This tells our tools that the Protobuf definitions
in the subproject `model` must be converted into Java code in the current subproject.

Alternatively, if, for instance, the upstream project already contains code generated from Protobuf
and no additional codegen is required, the `api`/`implementation` configurations should be used. See
[this Gradle doc](https://docs.gradle.org/current/userguide/dependency_management_for_java_projects.html)
for more info.
</p>

### Java web server

If your project contains a JavaScript frontend, you may declare a `web-server` subproject, which
processes the HTTP requests from JS. In `web-server/build.gradle`:
```groovy
dependencies {
    implementation("io.spine:spine-web:${spine.version()}")
    implenemtation(project(':users'), project(':trains'))
}
```
The `spine-web` artifact provides the components for handling requests from a JavaScript
frontend. Note that `web-server` depends on all the server-side subprojects in order to be able
to dispatch commands to and read states from their respective Bounded Contexts.

<p class="note">
Note the use of `spine.version()`. This method provides the framework version used by the current
version of the plugin. Prefer this construction over a hardcoded library version for `spine-money`,
`spine-web`, etc. 
</p>

For any specific subproject, you can configure to run or skip certain code generation routines.
For example:
```groovy
spine.enableJava {
    server() // Enable Server API.
    codegen {
        protobuf = true // Generate default Protobuf Java classes.
        spine = false // Avoid enhancing Protobuf Java classes with Spine validation, interfaces, etc.
        grpc = true // Generate gRPC stubs and implementation bases from Protobuf service definitions.  
    }
}
```

### JavaScript client

Finally, a JavaScript client is also one or more Gradle subprojects. In `build.gradle` for those
subprojects, declare:
```groovy
spine.enableJavaScript()

dependencies {
    protobuf(project(':model'))
}
```
This configuration sets up JavaScript code generation from the `model` definitions. Handle NPM
dependencies separately (e.g. adding the dependency for [`spine-web`](https://www.npmjs.com/package/spine-web)).

## Verbose configuration

If the Bootstrap configuration is not customizable enough for you, there are other Gradle plugins
which may provide the right API.

Those plugins are Spine Model Compiler for Java subprojects and Spine ProtoJs plugin for JavaScript
submodules. Under the hood, Bootstrap uses those plugins to do the work. This means that Bootstrap
automatically applies the correct low-level plugin for you.

### Model Compiler

Spine Model Compiler is a Gradle plugin which executes all the code generation routines via several
Gradle tasks as well as the `modelCompiler { ... }` extension, which allows you to configure those
tasks The tasks are:

 - `preClean` — deletes directories generated by Spine if `clean` task is also executed. Append
   directories to `modelCompiler.dirsToClean` to delete some other dirs which could be created
   during code generation. 
 - `mergeDescriptorSet` & `mergeTestDescriptorSet` — generate a merged Protobuf type descriptor set
   as a single file (for main and test scopes respectively). The file is then used by Spine at
   runtime to find all the known Protobuf types in classpath.
 - `generateRejections` & `generateTestRejections` — generate rejection classes which extend
   `Throwable` from Protobuf definitions. See more on rejections [here]({{site.baseurl}}/docs/guides/rejections).
 - `generateColumnInterfaces` & `generateTestColumnInterfaces` generate helper interfaces for
   declaring [columns in entity states]({{site.base_api_doc}}/base/io/spine/base/EntityWithColumns.html).
 - `annotateProto` & `annotateTestProto` — annotate Java classes generated from Protobuf types with
   API-level annotations, such as `Internal`, etc.
   
See the [API reference]({{site.base_api_doc}}/model-compiler/io/spine/tools/gradle/compiler/Extension.html)
on how to configure specific aspects of code generation.

### ProtoJS Plugin

ProtoJs Gradle plugin manages and enhances JavaScript code generation from Protobuf definitions.
The plugin adds the `generateJsonParsers` task, which appends generated JS files with code parsing
Protobuf messages out of plain JS objects.

The plugin also provides the `protoJs { ... }` extension, which allows you to configure JS code
generation. See the [API reference]({{site.base_api_doc}}/proto-js-plugin/io/spine/js/gradle/Extension.html)
for more info.
