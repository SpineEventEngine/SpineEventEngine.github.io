We use the [embedmd tool](https://github.com/campoy/embedmd) for adding
the source code to Markdown pages. The tool allows to insert or update a
source code snippet using the specific instructions added to a Markdown
page.

Please refer to [documentation](https://github.com/campoy/embedmd#embedmd)
for more details.

### Configuration

Please [install embedmd](https://github.com/campoy/embedmd#installation)
first.

The tool is written in Go. It would compile into a `bin` directory of
your Go Workspace. By default it would be `~/go/bin`.

Please make sure that `embedmd` is available as a command.

Under macOS you will need to add update `PATH` (e.g. in `.bash_profile`)
as follows:

```bash
# Add custom tools from Go.
PATH="~/go/bin:$PATH"
export PATH
```

### How it all works

The code of the JxBrowser examples is added to this repository as a
submodule in the [examples] directory.

The script [embedcode] fetches the latest version of the code from
GitHub, and then finds all `.md` files and passes them to the `embedmd`
utility two times:

  1. The first time with the `-d` flag to display the changes that are
     going to be applied.
  2. The secoond time with the `-w` to apply the changes.

If you see only a file name in the console, it means that there
were no changes made.

If the console displays diff-like output, the changes to an `.md` file
were applied.

### How to add examples

#### 1. Put the Java code into the examples `master` branch

Add a source code of the example to the [`examples-java`](https://github.com/SpineEventEngine/examples-java) repository.
Make sure that your code gets to the `master` branch, not your working branch.

If you need to use a particular version (e.g. 1.0.1), please use the
appropriate paths via tags.

#### 2. Add the reference to Markdown

Add the following code in the `.md` file of the page into which you
insert the example:

```markdown
[embedmd]:# (../../../examples/path-in-the-examples-repo/MyExample.java /import/ $)
```

Please note that the relative path `../../../` gets you into the root
of this site project. If your `.md` page is deeper than
e.g. `docs/guides/printing/`, you may want to add one more `..` to
the relative reference.

Do not worry, the `embedmd` tool would complain if it cannot load a file
via the provided reference. Please do not ignore the console output.

#### 3. Verify the inclusion patterns

Please note that the standard insertion in the above code starts from the
`import` statement in the file. This omits the copyright header and adds
its content until the end (`$`).

If the _real_ code that you want to embed starts from a `package`
statement, please update the `embedmd` instruction accordginly.

There are other [options](https://github.com/campoy/embedmd#usage)
for embedding portions of source code files. Please read them and use.

#### 4. Repeat adding code references

Do as described above. They will be all processed together in the
following step.

#### 5. Embed the code

Run the following command. Make sure you are in the root of the project.

```bash
./embedcode
```

### Do not add examples code directly

Please do not add the sizable code of the examples to pages directly (via the ` ``` ` syntax).
We need to make sure that examples are up-to-date.

Even if it's just one method please use the inclusion via a referenced
file.
