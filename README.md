spine.io site
======

This repository contains the code of the [spine.io](https://spine.io) site. 
It is based on [Hugo](https://gohugo.io/) and is hosted on
[GitHub Pages](https://pages.github.com/).

This project is two-headed:
  * It is a Hugo project.
  * It is a Gradle project to for checking the source code embedded to the site.   

The code samples used on the site and in the framework documentation are added using
the [`embed-code`][embed-code] tool (Go version).

The code resides under the `_code` directory. For instructions on embedding the code
into the pages, please see the [`_code/EMBEDDING.md`](_code/EMBEDDING.md) file. 

## Prerequisites

1. JDK 8 (x86_64).
2. [Go][go] `1.12` or newer.
3. [Node.js][nodejs] `18+`.
4. [Hugo Extended][hugo-quick-start] in version `v0.150.0` or higher.

## Configuration

1. Install project dependencies from the `site` directory by running `npm install`.

## Running the site locally

To build and launch the site on the local server:
```
./gradlew :runSite
```

To build the site without running the server:
```
./gradlew :buildSite
```

Another way to run the site locally is to follow these steps:

1. Navigate to the `site` folder.
2. Start the local server with this command:

   ```shell
   hugo server
   ```

If you receive an error, try clearing the cache:

```shell
hugo mod clean --all
```

Then run the `hugo serve` again.

## Documentation

The documentation is located in a [separate repository][documentation-repo].
It is added to this site as a Hugo Module.

Any changes to the documentation must be made in its own [repository][documentation-repo] 
or documentation modules.

The `documentation` repository is made to be self-sustainable in terms of editing. A fully-fledged 
Hugo site has been set up for it. All the contents and links in it are working as intended. 
It allows making changes to it more convenient for authors.

In terms of building the “main” site, the [Hugo Modules][hugo-modules]
are used to embed the content.

### Steps to get documentation updates

1. Navigate to the `site` directory.
2. Get the documentation Hugo Module:

   ```shell
   hugo mod get -u github.com/SpineEventEngine/documentation/docs
   ```

   or update all the modules recursively (including the site-commons):

   ```shell
   hugo mod get -u ./...
   ```

3. Commit and push changes from `go.mod` and `go.sum` files.
   In the `go.sum` file, keep only the two required entries for each theme to avoid file clutter.

   If there is an error while getting new updates, clear the cache and repeat step 2:

   ```shell
   hugo mod clean
   ```

## Common theme

This project uses the [`site-commons`][site-commons] Hugo theme for general components such 
as anchor icons, snackbars, etc.

1. Navigate to the `site` directory.
2. To get theme updates, run:

   ```shell
   hugo mod get -u github.com/SpineEventEngine/site-commons
   ```

3. Commit and push changes from `go.mod` and `go.sum` files.
   In the `go.sum` file, keep only the two required entries for each theme to avoid file clutter.

# Authoring

For instructions on adding the content to the site, please see
the [`AUTHORING.md`](AUTHORING.md) file.

[go]: https://go.dev/doc/install
[nodejs]: https://nodejs.org/en/download/current
[hugo-quick-start]: https://gohugo.io/getting-started/quick-start/#step-1-install-hugo
[site-commons]: https://github.com/SpineEventEngine/site-commons
[hugo-modules]: https://gohugo.io/hugo-modules/introduction
[embed-code]: https://github.com/SpineEventEngine/embed-code/tree/embed-code-go
[documentation-repo]: https://github.com/SpineEventEngine/documentation.git
