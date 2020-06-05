---
title: Getting Started in Java
headline: Documentation
bodyclass: docs
layout: docs
---

[//]: <> (The base path for code samples is `_samples/examples/src/main/`.)
[//]: <> (Change it to `_examples/hello/`.)

<?code-excerpt path-base="../../../../_examples/hello/"?>

# Getting started with Spine in Java

<p class="lead">This guide will walk you through a minimal client-server application in Java
which handles one command to greet the current computer user. The document goes through already
written code which is quite simple. So, it won't take long.
</p>

## What we'll do
We'll go through the example which shows a Bounded Context called “Hello”. 
The context has one `ProcessManager`, which handles the `Print` command
sent from the client-side code to the server-side code, which hosts the context.

## What you'll need
1.  JDK version 8 or higher.
2.  Git.
3.  The source code of the [Hello World](https://github.com/spine-examples/hello) example.
    ```bash
    git clone git@github.com:spine-examples/hello.git
    ```

## Run the code
To check that you've got everything installed, please run the following command:
```bash
./gradlew :sayHello
```
If you're under Windows, it would be:
```
gradlew.bat :sayHello
```
This would build and execute the example. 
The process should finish with the output which looks like this:

```
> Task :sayHello
Jun 04, 2020 5:04:55 PM io.spine.server.Server lambda$start$1
INFO: In-process server started with the name `318ea6c4-283e-4c43-b367-93310b703d31`.
[sanders] Hello World!
The client received the event: io.spine.helloworld.hello.event.Printed{"username":"sanders","text":"Hello World!"}
Jun 04, 2020 5:04:57 PM io.spine.server.Server shutdown
INFO: Shutting down the server...
Jun 04, 2020 5:04:57 PM io.spine.server.Server shutdown
INFO: Server shut down.
```  
The first line tells which Gradle task we run. The following couple of lines is the server-side
logging that informs us that the server was started. 

The line with “Hello World!” text is the “meat” of this example suite. 
It is what our `ProcessManager` (called `Console`) does in response to the `Print` command received
from the `Client`. 
The text in between brackets is the name of the current computer user. The name was passed as
the argument of the `Print` command.

<p class="note">We opted to show a `ProcessManager` — instead of an `Aggregate` — because
the console output is similar to an “External System”. Dealing with things like
that is the job of Process Managers. We also want to highlight the importance of using
this architectural pattern.</p>

The output that follows is the logging produced by the `Client` class as it receives the `Printed`
event from the server.

Then, the server shuts down concluding the example.   

Now, let's dive into the code.
 
## Project Structure
For the sake of simplicity, this example is organised as a single-module Gradle project.
Most likely, a project for a real world application would be multi-module.

### The root directory
The root of the project contains the following files:
  * `LICENSE` — the text of the Apache v2 license under which the framework and
     this example are licensed.
  * `README.md` — a brief intro for the example.
  * `gradlew` and `gradlew.bat` — scripts for running Gradle Wrapper.
  * **`build.gradle`** — the project configuration. We'll review this file later
    [in details](#adding-spine-to-a-gradle-project).

<p class="note">The root directory also contains “invisible” files, names of which start with
the dot (e.g. `.gitattributes` and `.travis.yml`).
These files configure Git and CI systems we use. They are not directly related to the subject
of the example and this guide. If you're interested in this level of details,
please look into the code and comments in these files.
</p>    

Here are the directories of interest in the project root:
 * `gradle` — this directory contains the code of Gradle Wrapper and two Gradle scripts
    used in the [project configuration](#other-project-configuration).
 * **`generated`** — this directory contains the code generated by Protobuf Compiler and 
    Spine Model Compiler. This directory and code it contains is created automatically
    when a domain model changes. This directory is <em>excluded</em> from version control.
 * **`src`** — contains the handcrafted source code.

Let's review the source code structure.

### The `src` directory
The source code directory follows standard Gradle conventions and has two sub-directories:
  * `main` — the production code;
  * `tests`.

The production code consists of two parts allocated by sub-directories:
  * `proto` — contains the definition of data structures in Google Protobuf.
    A domain model definition starts from adding the code to this directory. 
    Then, the Protobuf code is compiled to the languages of the project. 
    The output of this process is placed into the `generated` directory, with a sub-directory
    for each language. This example uses only Java.
    
  * `java` — this directory contains the model behavior and other server- and client-side code.
    A real project would have these parts in separate modules or projects. We put it all
    together for the sake of simplicity. 

Now let's review the code in details, starting with how to add Spine to a Gradle project.

## Adding Spine to a Gradle project
Let's open `build.gradle` from the root of the project. The simplest and recommended way for
adding Spine dependencies to a project is the Bootstrap plugin:

[//]: <> <?code-excerpt "build.gradle (add-plugin)"?>
```groovy
plugins {
    id 'io.spine.tools.gradle.bootstrap' version '1.5.8'
}
```
Once the plugin is added, we can use its features:

[//]: <> <?code-excerpt "build.gradle (add-server-dependency)"?>
```groovy
spine.enableJava().server()
```
This enables Java in the module and adds necessary dependencies.

<p class="note">Calling `server()` adds both server- and client-side dependencies. This way a module
of a Bounded Context “A” may be a client for a Bounded Context “B”. Client-side applications or
modules should call: `spine.enableJava().client()`.</p>

### Other project configuration

The rest of the `build.gradle` file does the following:
 1. Sets the version of Java to 8.

 2. Adds `generated` code directories to IntelliJ IDEA module by applying the `idea.gradle`
    script plugin. 
    
    <p class="note">The framework does not depend on IDEA or its Gradle plugin.
    We added this code because we use this IDE for development.
    If you use it too, you may want look into `idea.gradle` to configure your Spine-based 
    projects similarly.</p>
    
 3. Adds JUnit dependencies by applying the `tests.gradle` script plugin. 
    
    <p class="note">We chose to extract this and previous scripts into separate files to simplify
     the code of `build.gradle`.</p>
    
 4. Defines the `sayHello` task which runs the `Example` application, which orchestrates
    the demo.  

We are not reviewing these parts of the project configuration deeper because they are not
related to the use of the Spine framework. If you're interested in more details, please look into
the code of these scripts.
   
<p class="lead">To be continued...</p>     