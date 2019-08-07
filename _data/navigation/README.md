`doc-side-nav.yml` it is a YAML file with the navigation structure for the all docs pages.
Note that the YAML file should be located in the `_data` folder. Also note that the suggested syntax for YAML files 
is to use 2 spaces for indentation.

Related files:
- a liquid navigation template - `_includes/doc-side-nav.html`;
- navigation styles - `_scss/modules/_doc-nav.scss`.

## How it works

Now the navigation supports 3 levels of nesting.

#### Example for the one-level navigation list

```
concepts:
  - page: Command
    url: /docs/concepts/command.html
  - page: Event
    url: /docs/concepts/event.html
```

Where:
- `concepts` — navigation list name. The same name should be added for each `.md` file (that is in this list) as:
`sidenav_list: concepts`.
- `page` - the page name that will be displayed in the navigation.
- `url` - the full path to the file. It depends on what folder the file is in.


#### Example for the two-level navigation list

```
concepts:
  - page: Messaging
    url: '#messaging'
    sub_nav_id: messaging
    sub_nav:
      - page: Command
        url: /docs/concepts/command.html
      - page: Event
        url: /docs/concepts/event.html
```

- `page` - the page name that will be displayed in the navigation and will show a collapsed tree by clicking on it.
- `url` - href attribute that is equal to the collapsed sub-navigation `ID`.
- `sub_nav_id` - `ID` of the collapsed sub-navigation.
- `sub_nav` - sub-navigation container. It's always `sub_nav` for the second-level.

#### Example for the three-level navigation list

```
concepts:
  - page: Messaging
    url: '#messaging'
    sub_nav_id: messaging
    sub_nav:
      - page: Event
        url: '#sub-messaging'
        sub_sub_nav_id: sub-messaging
        sub_sub_nav:
          page: New page on the 3rd level
          url: /docs/conceps/3rd-level-file.html
```

To declare the third-level navigation use:
- `sub_sub_nav_id` - `ID` of the collapsed third-level navigation list.
- `sub_sub_nav` - third-level navigation container. It's always `sub_sub_nav` for the third-level.
