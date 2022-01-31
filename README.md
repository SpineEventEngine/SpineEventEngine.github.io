spine.io site
======
This repository contains the code of the [spine.io](https://spine.io) site. 
It is based on [Jekyll](https://jekyllrb.com/) and is hosted on
[GitHub Pages](https://pages.github.com/).

This project is two-headed:
  * It is a Ruby project because of Jekyll.
  * It is a Gradle project to for checking the source code embedded to the site.   

The code samples used on the site and in the framework documentation are added using
the [`embed-code`](https://github.com/SpineEventEngine/embed-code) Jekyll subcommand.

The code resides under the `_code` directory. For instructions on embedding the code into the pages, 
please see the [`_code/EMBEDDING.md`](_code/EMBEDDING.md) file. 

# Prerequisites

 1. Install Ruby.
 2. Install the `bundler` tool.
 3. Install the project dependencies by running `bundle install`.
 
Now you should be able to run the site locally.

# Running the site locally

To build and launch the site on the local server:
```
./gradlew :runSite
```
To build the site without running the server:
```
./gradlew :buildSite
```
If you experience issues with this step, please check out
the [Troubleshooting Guide](TROUBLESHOOTING.md).

# Documentation

The documentation is located in a [separate repository](https://github.com/SpineEventEngine/documentation.git). 
It is added to this site as a Git submodule, but changes to its pages can only be made 
in its repository.

In order to build the documentation in its [repository](https://github.com/SpineEventEngine/documentation.git) 
and to make all links work correctly, the documentation files were placed in the `docs` folder.

Here on the main site, to avoid the problem with `docs/docs/index.md`, we added a submodule 
to the `_docs` directory and configured the build of this folder with 
[Jekyll collections](https://jekyllrb.com/docs/step-by-step/09-collections/).

### Steps to get updates
1. Update submodules:
```
git submodule update --remote
```

2. Add any new files pulled from the repository:
```
git add .
```

3. Perform a commit and push back to origin to rebuild the site.

# Authoring

For instructions on adding the content to the site, please see
the [`AUTHORING.md`](AUTHORING.md) file.
