In Spine, dependencies and CI configurations are shared among the sub-projects. 

The code of this repository should be added to a target project as a Git sub-module.

## Adding a sub-module to your project

To add a sub-module:
```bash
git submodule add https://github.com/SpineEventEngine/config config
``` 
This will only add a sub-module with the reference to the repository. 
In order to get the code, run the following command:
```bash
git submodule update --init --recursive
```

## Updating project with new configuration

Run the following command from the root of your project:
```bash
./config/pull
```

It will get the latest code from the remote repo, and then copy shared files into the root of your
project. The following files will be copied:
 
 * `.idea` - a directory with shared IntelliJ IDEA settings
 * `.codecov.yml`
 * `.gitattributes`
 * `.gitignore`
 * `ext.gradle`
 
    This file will be copied only if it does not exist in your project. It defines the following:
    1. the version of Spine Base which is used by the project (which uses `config`)
    2. the version under which artifacts of the project will be published.

## Adding credentials to a new repository

For details, see [this page](https://github.com/SpineEventEngine/config/wiki/Encrypting-Credential-Files-for-Travis).

## Further reading

  * [GitHub: Working with submodules](https://blog.github.com/2016-02-01-working-with-submodules/)
  * [Pro Git: Git Tools - Git Submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules)
