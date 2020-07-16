The `_code` directory
======

This directory contains the source code which is embedded into the pages of the spine.io site.
There are two sub-directories under the `_code`:
 * `examples` — contains examples selected from the repositories under `spine-examples`
    organization. These repositories added to this project as Git submodules.
 * `samples` — smaller pieces of code embedded to the site.

# Embedding code 

We use the [`embed-code`](https://github.com/SpineEventEngine/embed-code) Jekyll subcommand for
adding the source code to Markdown pages. The tool allows inserting or updating a source code
snippet using the specific instructions added to a Markdown page.

Please read the [`embed-code` documentation](https://github.com/SpineEventEngine/embed-code) to
familiarise with the syntax. 

Your actions for adding a code sample to the documentation may vary depending on the scenarios
described in this section.

## Referencing existing code 

Just follow instructions from the [`embed-code` guide](https://github.com/SpineEventEngine/embed-code).

## Adding a new small piece

 1. Add the code under `_code/samples/src` directory.
 2. Make sure tests for the new code pass.
 3. Add the new piece using the [`embed-code` guide](https://github.com/SpineEventEngine/embed-code).
 
 ## Adding a new example project
 
 1. Add the example code as a submodule for this project:
 
    ```bash
    git submodule add https://github.com/spine-examples/<example-name> _code/examples/<example-name>
    ```
    Please make sure the new submodule goes under the `_code/examples` directory, as shown in
    the command line template above.
 2. TBD     
