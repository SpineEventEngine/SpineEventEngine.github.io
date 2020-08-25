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

Spine Bootstrap plugin (Bootstrap for short) serves to automate the configuration of the modules
in your Spine-based app.

We recommend having separate Gradle subprojects for domain model definition, server  implementation,
and client code. Bootstrap is applied a bit differently in each of these cases.

### Model definitions

Let's assume one of the subprojects contains Protobuf definitions for the domain model. This
subproject is typically called `model`. In `build.gradle` for that subproject, declare:
```groovy
spine.assembleModel()
```
This way, the subproject will receive all the required Spine dependencies but no code will be
generated from Protobuf.

### Java server implementation

A separate Gradle subproject is dedicated to the server-side business logic of your Bounded Context.
Usually, this subproject is named `server` or after the Bounded Context it implements, e.g. `users`.
In `build.gradle` for that subproject declare:
```groovy
spine.enableJava().server()

dependencies {
    protobuf(project(':model'))
}
```
This will add dependencies to the `spine-server` artifact and set up code generation for
the domain model types.

It is perfectly normal to have more Protobuf types in these modules, as long as those types are
internal to your Java implementation and are not a part of the publicly-visible domain model.

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

<p class="note">
Note the use of the `protobuf` configuration. This tells our tools that the Protobuf definitions
in the subproject `model` must be converted into Java code in the current subproject.

Alternatively, if, for instance, the upstream project already contains code generated from Protobuf,
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
    implenemtation(project(':server'))
}
```
The `spine-web` artifact provides the components for handling requests from a JavaScript
frontend.

<p class="note">
Note the use of `spine.version()`. This method provides the framework version used by the current
version of the plugin. Prefer this construction over a hardcoded library version for `spine-money`,
`spine-web`, etc.
</p>

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
