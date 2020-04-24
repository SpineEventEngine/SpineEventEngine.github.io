# Code examples

When writing an entry to the site, its often handy to use code snippets to demo the described
concepts. Those code snippets should be kept up to date with the framework.

For this purpose, we integrate with the [`code_excerpter`](https://github.com/chalin/code_excerpter)
and [`code_excerpt_updater`](https://github.com/chalin/code_excerpt_updater) tools.

Note that this directory should only contain small examples. For substantial examples involvoing
multiple concepts interacting with each other, see `_examples`.  

Since the tools are designed for Dart projects, the contents of `_samples` directory are shaped as
a Dart project. All the actual code examples should be put under `_samples/examples` dir. That dir
is a Gradle project. When examples are updated, the Spine version in
`_samples/examples/build.gradle` should be changed. Run `./gradlew clean build` to make sure that
the examples are adequate. The project also defines tests which are run upon build. The tests verify
the example code makes sense.

When the example source files are updated, run `./_script/excerpt` to update code snippets in
the docs.

Run `./_script/check` to make sure that the code snippets are up to date with the example source
files.

## Adding a new snippet

To add a new code snippet, add the following construct to the doc file:

`<?code-excerpt "path/to/file (doc-region)"?>`
<pre>
```
```
</pre>

That is, a `<?code-excerpt?>` tag followed by a code fence (with the right language). The code fence
may be empty, since it will be automatically overwritten.

The path to the file must be relative to the `_samples/examples/src/main/` dir. For instance,
`"proto/spine/example/events.proto"`. If a document page contains only references to files in 
a certain subdirectory, a `<?code-excerpt?>` tag [can be used](https://github.com/chalin/code_excerpt_updater#c-set-instruction)
to set the base path. 

The doc region should match one of the `docregion` segments in
the target file and be enclosed into parentheses. If the whole file should be shown, the doc region
should just be omitted.

## Declaring doc regions

A doc region is a clever way to exclude any irrelevant pieces of a source file from the resulting
snippet. Declare doc regions as follows:

```
Here goes irrelevant code.

// #docregion region-name

Here goes relevant code.

// #enddocregion region-name

Here goes more irrelevant code.
```

Only the lines between `#docregion` and `#enddocregion` are included into the snippet.

### Joining pieces

Doc regions can be joined from different pieces along the file. For that, just declare several doc
regions with the same name in a single file:

```java
package foo.bar;

import io.spine.net.Url;

// #docregion parser
public class UrlParser {
// #enddocregion parser

    public UrlParser() {
        // ...
    }

    // #docregion parser
    public Url parse(String urlAsString) {
        // ...
    }
    // #enddocregion parser

    private void internals() {
       // ...
    }

// #docregion parser
}
// #enddocregion parser
```

Here, the signature of class `UrlParser` and the method `parse()` are included into the doc region
`parser` and all the other code is not.

### Multiple regions on one line

Several regions may start or end at a single line. To avoid writing multiple `#docregion` comments,
just list the names of the regions separated by commas:

```
// #docregion parser, public-api, class-def
```
