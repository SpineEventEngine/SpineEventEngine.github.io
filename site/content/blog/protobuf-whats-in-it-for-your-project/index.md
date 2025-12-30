---
title: Protobuf — Serialization and Beyond. 
  Part 1. What’s in It for Your Project
description: >-
  In  this article we look at the key Google Protocol Buffers (aka Protobuf) features which make working with data in software development projects more convenient and effective.
author: Alexander Yevsyukov and Dmytro Dashenkov
publishdate: 2020-11-16
type: blog/post
header_type: fixed-header
---

*This six-part series covers using Google Protocol Buffers (aka [Protobuf](https://developers.google.com/protocol-buffers)) to build software Domain-Driven Design way and to cut on the manual effort when migrating data and syncing interaction protocols in complex systems.*

*In the first part, we look at the key Protobuf features which make working with data in software development projects more convenient and effective.*

Like most developers, we at TeamDev first encountered Protobuf, when we needed to transfer the data between different platforms.

The better we mastered this technology, the more ways besides simple serialization we found to apply it to our software development tasks.

In this cycle, we provide a summary of our five-year experience of using Protobuf for quite a diverse range of software projects: both the ones we do for our clients, and the products we develop for developers: Spine Event Engine, which is a CQRS/ES framework for building cloud applications based on Domain-Driven Design, and the browser components for desktop apps — [JxBrowser](https://www.teamdev.com/jxbrowser) (Java) and [DotNetBrowser](https://www.teamdev.com/dotnetbrowser) (.NET).

We use the [Protobuf v3](https://developers.google.com/protocol-buffers/docs/proto3) syntax for all the examples in this series.

## Starting Off with Protobuf

### Lost in Transition
Our Protobuf story started at a SaaS project. The system was built based on the event-oriented, or, as it is called lately, reactive Domain-Driven Design. Events and data to display were transferred to the JavaScript browser application as JSON objects. Then the customer decided to add Android and iOS clients. By the time the work on the client applications started, the event model was already formed as a hierarchy of Java classes. And there were quite a few of those.

So we faced the following questions:

1. **How do we attain type consistency across different languages, if something needs to be changed or added?** When there are dozens of event classes you would rather not do it manually, as mistakes are highly probable. It would be quite nice to have some tool to handle this.
2. **Can we avoid conversion to JSON and backward?** Our system’s load was moderate, so it was not about improving performance at this point. However, it was intuitive, that it would be nice to skip conversion to text and backward, as it happens only for the sake of transfer to another node.
   Abandoning data types and only using JSON for all tasks was not an option. It would turn working with the domain model, which is “the heart and the brain” of the business, into operations with strings and primitive types! We set off searching.

### Looking for Solution
One of the first options we came into was the Wire library by Square. Back then, it was versioned 1.x, supporting Protobuf v2, while Protobuf v3 was in alpha-3 version. The Wire did not solve all our issues with the platforms’ support, as it was intended only for Android and Java, but it got us aware of the Protobuf technology and of the applied code generation. [Compared to others](https://capnproto.org/news/2014-06-17-capnproto-flatbuffers-sbe.html), Protobuf looked like the best option.

Yet another issue arose. In Java we had a hierarchy of classes for events and other types of data. As most of them are transferred between client and server, we were looking for the means to define the similar structure of data in all languages involved. But inheritance in Java works differently from what was available in languages, such as JavaScript. A significant amount of hand-written code was needed to implement and then to maintain the hierarchies of the same types for all platforms.

Protobuf looked like a solution (just in theory for us at that time). We could adapt inheritance into the composition and code-generate the data types for all languages. But that also meant we had to rewrite a part of our application from scratch.

We came up with the following solutions:

1. Describe commands, events, and *all* the other data types in Protobuf and generate code for all the languages of the project.
2. Since Protobuf describes *only* data, we will implement the domain entities as Java classes on top of the data classes generated from the proto-types.

Bringing these solutions to life we:

* Created Spine Event Engine — the framework for the projects, developed using the Domain-Driven Design methodology, where Protobuf makes working with the data way easier. It speeds up the development and reduces the labor costs of the software.
* Cut down the amount of the code written manually in our integration libraries, [JxBrowser](https://www.teamdev.com/jxbrowser) and [DotNetBrowser](https://www.teamdev.com/dotnetbrowser), where C++ code of Chromium couples with Java and C#.
  We will talk in detail about these in the next articles of this series. Meanwhile, let’s take a look at the Protobuf features, which make it useful for many projects, regardless of their nature.

## What Makes Protobuf So Handy
### Support of Many Languages
The latest versions of Protobuf [support](https://developers.google.com/protocol-buffers/docs/reference/overview) C#, C++, Dart, Go, Java, JavaScript, Objective-C, Python, PHP, Ruby. There is a Swift implementation [by Apple itself](https://github.com/apple/swift-protobuf/). If you need one for Closure, Erlang или Haskell, the list of the [third-party libraries for different languages](https://github.com/protocolbuffers/protobuf/blob/master/docs/third_party.md) is extensive.

As the name of the article implies, the Protobuf-based code can be used for all the operations with data, not only serialization. And this is the approach we recommend. However, serialization is also worth discussing. It is where it all usually starts.

### Binary Serialization
Protobuf employs the binary serialization mechanism to transfer data between the nodes effectively, to write and to read from the different languages without additional efforts, and to introduce format changes without breaking compatibility.

Let’s assume we have a data type `Task` defined as follows:

```.proto
message Task {
    string name = 1;
    string description = 2;
}
```
Then in Java, you can get such object in binary form this way:

```java
byte[] bytes = task.toByteArray();
```

Or this:

```java
ByteString bytes = task.toByteString();
```

The `ByteString` class, provided by the library, helps to transform Java String and to work with `ByteBuffer`, `InputStream`, and `OutputStream`.

In JavaScript the object of the `Task` type can be transformed into bytes using the `serializeBinary()` method:

```js
const bytes = task.serializeBinary();
```

As a result, we get an array of 8-bit numbers. For reverse transformation, the `deserializeBinary()` function is generated. It is called in a way similar to static methods in Java:

```java
const task = myprotos.Task.deserializeBinary(bytes);
```
The situation is alike for Dart. The `writeToBuffer()` method with the common ancestor of the generated classes returns a list of unsigned 8-bit integers:

```dart
var bytes = task.writeToBuffer();
```
And the `fromBuffer()` constructor performs the reverse transformation:

```dart
var task = Task.fromBuffer(bytes);
```
### Resilience to Type Change
Writing code in modern IDEs makes it much easier to modify existing data structures. For example, for Java, there are many types of automatic code refactoring available. However, instances of domain types are often persisted to some storage and then read back over and over. Again, with Java, it takes quite an effort — in terms of both time and cost — to craft a fine-grained serialization mechanism to keep the data from years back alive today.

Protobuf is designed to ensure the backward compatibility of the serialized data. It is flexible enough when it is necessary to change an existing data type. We will not describe [all the possibilities](https://developers.google.com/protocol-buffers/docs/proto3#updating) but only focus on the most interesting.

#### Adding Fields

This one is quite simple. You add a field and the updated type will be binary compatible with the old values. The presence of the new field will be transparent for the new code, but it [will be taken into account](https://developers.google.com/protocol-buffers/docs/proto3#unknowns) during serialization.

#### Deleting Fields

This one should be handled more delicately. You can simply delete the field and everything will just keep working. But such a cavalry charge comes with risks.

During the next type modification, someone might add a field with the same index as the recently deleted one. It will ruin the binary compatibility. If in the future someone will add the field with the same name, but of a different type, it will break compatibility with the calling code.

The authors of Protobuf recommend renaming such fields by adding the `OBSOLETE_` prefix or to delete them, marking the index of this field with the [reserved](https://developers.google.com/protocol-buffers/docs/proto3#reserved) instruction.

To avoid unpleasant surprises we recommend the following cycle to process the deletion:

**Step 1.** Mark the field with the `deprecated` option:

```.proto
message MyMessage {
   ...
   int32 old_field = 6 [deprecated = true];
}
```
**Step 2.** Generate the code for the updated type.

**Step 3.** Update the calling code, getting rid of the `@Deprecated` method calls.

**Step 4.** Delete the field, marking its index and name as `reserved`:

 ```.proto
 message MyMessage {
    ...
    reserved 6;
    reserved “old_field”;
 }
 ```
By doing this we insure ourselves from accidental usage of the old index or name and do not have to keep the outdated code. Renaming fields is not much harder.

#### Renaming Fields

Serialization is based on field indices, not on field names, so if something was named poorly, renaming would mean the need to convert data and upgrade software on all nodes. If the field is renamed, the updated type will be binary compatible.

Such renaming better be done in reverse order. First, you should rename the methods, which work with this field in the generated code. This, in turn, will update the links from the code of the project to these methods. And only after that, the field should be renamed in the proto-type.

Let’s say our `Task` type has a `name` field and we want to have it named `title` instead of `name`.

To avoid manual correction of all of the method calls, we should perform the following sequence:

**Step 1.** Rename the `Task` class method in Java from `getName()` into `getTitle()`.

**Step 2.** Rename the `Task.Builder` methods `getName()`, `setName()` accordingly.

**Step 3** Perform these steps for the other languages of your project. And only after this…

**Step 4.** Rename the field itself in the `Task` proto-type.

Obviously, it is less convenient compared to ordinary renaming in the environment. But it is worth noting, that:

* We spend almost no effort to generate the code.
* The renamings might be numerous but not vast. Given due initial attention to the domain language, the number of such issues can be reduced.

Also note, that if you use serialization in JSON, it is better not to rename a lot because updating the clients to the new version requires additional effort.

### Output to JSON
As we’ve mentioned earlier, JSON is not the most effective way to exchange data. This string-based protocol doesn’t have an official schema format, and the techniques for supporting any kind of data types with JSON vary immensely.

In most cases when you need serialization, Protobuf will do well. Being a serialization protocol on its own, it converts into a concise binary representation, which is supported by all the platforms which support Protobuf.

However, in some cases, JSON is irreplaceable. For example, when debugging dev server requests, it’s handy to have requests and responses in a readable format. Also, some databases support JSON structures, which helps their users avoid the tedious job of defining extra data schemas on top of an existing type model. For such cases, Protobuf supports JSON serialization.

#### In Java

To work with JSON in Java we use the utility class `JsonFormat`, which is included in the `protobuf-java-util` library. The `JsonFormat.Printer` class is responsible for the output. A simple case looks as follows:

```java
var printer = JsonFormat.printer();
try {
    var json = printer.print(myMessage);
} catch (InvalidProtocolBufferException e) {
    // Unknown type was encountered in an `Any` field.
}
```

As you can see from this example, the `Printer.print()` method can throw an `InvalidProtocolBufferException`.

It happens, when the message printed contains the `Any` type field which has the type unknown for the printer packed in it.

If you do not use `Any` in the messages, which are to be converted to JSON, no actions are needed. If you do use it, then you should equip the `Printer` with an object of the `TypeRegistry` type with all the types you expect to be used inside `Any` added to it:

```java
var registry =      
    TypeRegistry.newBuilder()         
        .add(TypeA.getDescriptor())     
        .add(TypeB.getDescriptor())      
        .add(TypeC.getDescriptor())         
        .build(); 
var printer = JsonFormat.printer()           
        .usingTypeRegistry(registry);
```

By default the `Printer` output is easy-to-read. However, you can create a version, which will print in the compact format:

```java
var compactPrinter = printer.omittingInsignificantWhitespace();
```

`JsonFormat.Parser` is used for reverse transition. It also needs the `TypeRegistry` to understand the contents of the fields of `Any` type:

```java
var parser = JsonFormat.parser()
        .usingTypeRegistry(typeRegistry);
var builder = MyMessage.newBuilder();
parser.merge(json, builder);
MyMessage message = builder.build();
```

#### In JavaScript

The situation is less appealing for JavaScript. Its out-of-the-box implementation does not allow to serialize to and from JSON. Support of conversion from and to “simple” objects is available with `toObject()` method. But in some cases, e.g., for `google.protobuf.Timestamp`, `google.protobuf.Any`, and other built-in types, the output of the `toObject()` will not match the one printed by the Java library. The user of the Protobuf for JavaScript is only left with extending the generated API, which is what we did when first faced this flaw ourselves.

#### In Dart

When it comes to building client-side applications, Dart looks like a viable new alternative to JavaScript. That’s why we opted to support it in the Spine framework, and use Protobuf to generate code for this language as well.

For Dart, conversion to JSON is very similar to the one used in Java.

Serialization:

```dart
var jsonStr = task.toProto3Json();
```
Deserialization:

```dart
var task = Task();
task.mergeFromProto3Json(jsonStr);
```

Both methods have an optional parameter of the `TypeRegistry` type, required to process the `google.protobuf.Any`. We create a `TypeRegistry`, transferring the exemplars of the empty messages to it:

```dart
var registry = TypeRegistry([Task(), TaskLabel(), User()]);
```

And add the parameter to the method:

```dart
task.mergeFromProto3Json(jsonStr, typeRegistry: registry);
```

### Immutability
Immutable types make the developer’s life way better. For instance, have a look at [this talk](https://www.youtube.com/watch?v=pLvrZPSzHxo&feature=youtu.be) on how immutability helps to build great UIs.

Protobuf objects in Java are immutable. And this is convenient. It is also convenient to create a new object based on the previous one:

```java
Task updated = task.toBuilder()
        .setDescription(“...”)
        .build();
```

But it’s not that bright for JavaScript and Dart.

We’ll talk more about the desire to keep things unchanged and the urge to modify them in the article on immutability, which comes next in this series.

## Summary
This article begins a tale of our journey with Protobuf. Now, as we’ve discussed the basics and general advantages of using this technology, we will dive into how it can be applied to particular projects. Next up we will talk about the way Protobuf helps you improve your code quality and architecture style.