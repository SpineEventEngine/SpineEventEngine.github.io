# Troubleshooting Ruby and Gem installation

## Check the version of Ruby

Jekyll, technically, works with Ruby 2.4.0. However, some of its dependencies may require a newer version of Ruby.
At the point of creating this memo, the 2.7.0 is the freshest version. Jekyll and its dependencies work with it fine.

When installing Ruby via `brew`, the freshest version will be installed by default. It is still required to add the path
to the binary dist in the `$PATH`, for example:
```
/usr/local/Cellar/ruby/2.7.0/bin/
```

## Building native extensions

In many cases, gems are provided with C-lang native extensions. The extensions are not compiled for all the combinations
of operating systems, operating system versions, and Ruby versions. If a pre-compiled extension artifact is missing,
`gem` will attempt to compile it locally.

On MacOS of versions 10.14 and 10.15, the compilation may fail with a number of errors pointing at the `resource.h`
C-lang file. In this case, follow [this answer](https://stackoverflow.com/a/47401866/3183076) on StackOverflow: rename
the `/usr/local/include` directory to something else, e.g. `/usr/local/include_old`, so that the C compiler goes not
look there for the System API by default.
