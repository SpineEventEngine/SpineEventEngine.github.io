The `_code` directory
======

This directory contains the source code which is embedded into the pages of the spine.io site.
There are two sub-directories under the `_code`:
 * `examples` — contains examples selected from the repositories under `spine-examples`
    organization. These repositories added to this project as Git submodules.
 * `samples` — smaller pieces of code embedded to the site.

# Embedding code 

We use the [`embed-code`](https://github.com/SpineEventEngine/embed-code) Jekyll subcommand for
adding the source code to Markdown pages. The tool allows inserting or update a source code snippet
using the specific instructions added to a Markdown page.

### Prerequisites

To run the tool:
 1. Install Ruby.
 2. Install the `bundle` tool.
 3. Install the project dependencies by running `bunlde install`.
 
Now you should be able to run the `embed-code` tool.


### How to add code samples to the documentation

TODO
