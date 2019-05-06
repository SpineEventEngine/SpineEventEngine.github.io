The folder `_diagrams` is only used to keep diagrams source files and not used in Jekyll.

### Tools

A diagram was created in the [Sketch](https://www.sketch.com/) with using 
[Sketch Interactive Export](https://github.com/mathisonian/sketch-interactive-export) plugin.
This plugin allows creating class names inside the Sketch.


### How it works

- To export a diagram with classes, add a layer or a group name like `.g-caption`, the resulting SVG markup will 
contain `class="g-caption"`.
- To have several classes for the one layer add `.g-caption.command-dispatcher`. The result will be 
`class="g-caption command-dispatcher"`.
- Anything in the layer name that isn't prefixed with a period will be used as the ID. So, for example, a layer named 
`g-caption.command-dispatcher` will result in markup like `id="g-caption" class="command-dispatcher"`.
- To export SVG: 
	- select the diagram artboard;
	- go to the right side panel;
	- click on the `Make Exportable` button (need to do only once for one diagram);
	- choose the file format as `SVG` and click `Export Selected...` at the bottom of the panel.


Here is the list of marker CSS classes for the SVG image along with their meanings:

     * outer-frame — the outer frame of the whole image;
     * arrow-caption — a DIV with the caption over an arrow;
     * box-caption — a DIV with the caption in some container;
     * title-caption — a title;
     * rect — a `rect` element;
     * path — a `path` element;
     * arrow — an arrow;
     * layer-x — an X-th layer in stacked boxes such as 'Bounded Context';
     * border — a border;
     * brace - a brace;
     * path-only - for a path that doesn't have a fill-color, only a stroke.

    Elements and their parts:

     * bounded-context;
     * command-bus;
     * events;
     * event-store;
     * ui;
     * command-service;
     * query-service;
     * subscription-service;
     * stand;
     * event-bus;
     * system-context-top;
     * system-context-bottom;
     * command-dispatcher;
     * command-store;
     * aggregate-mirror;
     * pm-repo;
     * aggregate-repo;
     * projection-repo;
     * write-side;
     * read-side.


     Arrows, composed as "from-to":

     * command-dispatcher-pm-repo — an arrow from Command Dispatcher to PM repo group;
     * integration-events;
     * ui-command-service;
     * ui-query-service;
     * query-service-ui;
     * ui-subscription-service;
     * subscription-service-ui;
     * query-service-stand;
     * subscription-service-stand;
     * command-service-command-bus;
     * stand-query-service;
     * event-bus-event-store;
     * event-bus-projection-repo;
     * command-bus-command-dispatcher;
     * command-dispatcher-command-store;
     * stand-projection-repo;
     * stand-pm-repo;
     * stand-aggregate-mirror;
     * aggregate-states;
     * aggregate-mirror-stand;
     * stand-subscription-service;
     * aggregate-repo-aggregate-commands;
     * aggregate-repo-aggregate-events;
     * aggregate-event-bus;
     * event-bus-aggregate-repo;
     * pm-command-bus;
     * pm-repo-pm-commands;
     * pm-repo-pm-events;
     * pm-event-bus;
     * event-bus-pm-repo;
     * command-service-ui;
     * command-bus-command-service;
     * projection-repo-projection-events.

    The marker for elements facing to the framework end-users.

     * end-user.
