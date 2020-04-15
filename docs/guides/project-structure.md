---
title: Project Structure
headline: Documentation
bodyclass: docs
layout: docs
---
# Project Structure

<p class="lead">This document describes standard structure of a Spine-based project. 
It assumes that you are familiar with <a href="https://gradle.org" target="_blank">Gradle</a>.</p>

<p>Spine uses Gradle for project model definition and as the build tool. 
It follows the standard structure of the Gradle project with extensions related to 
the code generation done by Protobuf Compiler and Spine Model Compiler.</p>

## Handcrafted code

Following standard Gradle conventions a manually written code is created under the 
`src/main/` directory with subdirectories `proto`, `java`, etc. for corresponding languages.

After a project is defined in Gradle, a work on a module usually starts in the  
the `proto` directory.

## Generated code

The generated code is placed under the `generated` directory under the module root.
The sub-directories are:

* `java` — the code generated by Protobuf Compiler
* `resources` — mappings generated by Spine Model Compiler
* `spine` — the code generated by Spine Model Compiler  

### Excluding from version control

The generated code is created and updated during build time. Directories with the generated 
code files should <strong>NOT</strong> be added to version control system of your project.
This makes a commit to contain only essential changes relevant to the update of the model, 
in particular:

 1) Modifications of `.proto` files of the data model.

 2) Updated calls from the application code to the generated data model API.

By not including the generated code into the version control we minimise the “noise”
for developer eyes when a model changes.  So, if you are using Git, for example, consider adding
 the following line to your `.gitignore` file:

```
**/generated/**
``` 

## Example 

Here's how a typical project structure would look like:

```
myproject/
  gradle/
  module-one/
    generated/
       main/
         java/
         resources/
         spine/
         ...
       test/
         java/
         resources/
         spine/
         ...   
    src/
       main/
         java/
         proto/
       test/
         java/
         proto/
    ...     
    build.gradle
  module-two/
    generated/
      ...
    src/
      ...
    build.gradle
  ...
  build.gradle
  gradlew
  gradlew.bat
  settings.gradle
``` 
