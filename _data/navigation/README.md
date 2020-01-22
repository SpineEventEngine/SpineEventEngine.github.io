`doc-side-nav.yml` it is a YAML file with the navigation structure for all docs pages.
Note that the YAML file should be located in the `_data` folder. Also, note that the suggested 
syntax for YAML files is to use 2 spaces for indentation.

Related files:
- a liquid navigation template - `_includes/doc-side-nav.html`;
- navigation styles - `_scss/modules/_doc-nav.scss`;
- a JavaScript file - `js/doc-side-nav.js`.

## How it works

Now the navigation supports 3 levels of nesting.

#### Example for the one-level navigation list

```
doc_side_nav:
  - page: Command
    url: /docs/concepts/command.html
  - page: Event
    url: /docs/concepts/event.html
```

Where:
- `doc_side_nav` — navigation list name that is used in the navigation template.
- `page` - the page name that will be displayed in the navigation.
- `url` - the full path to the file. It depends on what folder the file is in.


#### Example for the two-level navigation list

```
doc_side_nav:
  - page: Messaging
    url: '#messaging'
    id: messaging
    children:
      - page: Command
        url: /docs/concepts/command.html
      - page: Event
        url: /docs/concepts/event.html
```

- `page` - the page name that will be displayed in the navigation and will show a collapsed 
tree by clicking on it.
- `url` - href attribute that is equal to the collapsed child navigation `ID`.
- `id` - `ID` of the collapsed child navigation.
- `children` - children navigation container.

#### Example for the three-level navigation list

```
concepts:
  - page: Messaging
    url: '#messaging'
    id: messaging
    children:
      - page: Event
        url: '#sub-messaging'
        id: sub-messaging
        children:
          - page: New page on the 3rd level
            url: /docs/conceps/3rd-level-file.html
```
