Embedding code
======

Your actions for adding a code sample to the documentation may vary depending on the scenarios
described in this document.

- [The `_code` directory](#the---code--directory)
- [The Jekyll sub-command for embedding the code](#the-jekyll-sub-command-for-embedding-the-code)
- [Referencing existing code](#referencing-existing-code)
- [Adding a new small piece](#adding-a-new-small-piece)
- [Adding a new example project](#adding-a-new-example-project)

<small><i><a href='http://ecotrust-canada.github.io/markdown-toc/'>Table of contents generated with markdown-toc</a></i></small>

# The `_code` directory

This directory contains the source code which is embedded into the pages of the spine.io site.
There are two sub-directories under the `_code`:
 * `examples` — contains examples selected from the repositories under `spine-examples`
    organization. These repositories added to this project as Git submodules.
 * `samples` — smaller pieces of code embedded to the site.

# The Jekyll sub-command for embedding the code 

We use the [`embed-code`](https://github.com/SpineEventEngine/embed-code) Jekyll subcommand for
adding the source code to Markdown pages. The tool allows inserting or updating a source code
snippet using the specific instructions added to a Markdown page.

Please read the [`embed-code` documentation](https://github.com/SpineEventEngine/embed-code) to
familiarise with the syntax. 

# Referencing existing code 

Just follow instructions from the [`embed-code` guide](https://github.com/SpineEventEngine/embed-code).

# Adding a new small piece

 1. Add the code under `_code/samples/src` directory.
 2. Make sure tests for the new code pass.
 3. Add the new piece using the [`embed-code` guide](https://github.com/SpineEventEngine/embed-code).
 
# Adding a new example project
 
 1. Make sure the project you're going to add has a top-level `buildAll` Gradle task.
    
    See the [build of the Hello Example](https://github.com/spine-examples/hello/blob/master/build.gradle)
    for the declaration of such a task. This task must present in both single- and multi-module
    Gradle example projects that are going to be used for embedding into this site.
    
    If you are interested in the details on why the `buildAll` task is needed, please see
    the `buildAll` task from the [`build.gradle.kts`](build.gradle.kts) of this project for
    the links to discussions of the problem of building composite builds, and the solution we use.
 
 2. Add the example code as a submodule for this project:
 
    ```bash
    git submodule add https://github.com/spine-examples/<example-name> _code/examples/<example-name>
    ```
    Please make sure the new submodule goes under the `_code/examples` directory, as shown in
    the command line template above.
    
 3. Include the build of the added project into the [`settings.gradle.kts`](settings.gradle.kts)
    file.

After these steps you can embed the code into the pages of the site.
