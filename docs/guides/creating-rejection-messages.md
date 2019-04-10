---
title: Defining Rejection Messages
headline: Defining Rejection Messages
bodyclass: docs
layout: docs
sidenav: doc-side-guides-nav.html
type: markdown
---
Compared with regular Events, [Rejections](/docs/concepts/rejection.html) are defined in a different way. Here is the differences summary:

* `java_multiple_files file` option must be set to `false`

By doing so we instruct Protobuf Compiler to put all the rejection classes in one outer class.
Spine Model Compiler for Java generates `ThrowableMessage` classes for all these messages. 
These classes will be named after the classes of rejection messages.
Putting rejection message classes under an outer class avoids name clash inside the package.

* Omit `java_outer_classname` option

Thus the outer class name is derived from the name of the file where rejection messages are declared. 
Usually the outer class names are named using the name with the suffix `Proto`. 
We want the name to end with `Rejections` so that it is clearly visible what is inside this class.



