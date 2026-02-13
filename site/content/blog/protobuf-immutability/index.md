---
title: Protobuf — serialization and beyond. Part 2. Immutability
description: >-
  In this chapter, we are going to address the elephant in the room which comes 
  with Protobuf in Java in particular — immutable data types.
author: Alexander Yevsyukov and Dmytro Dashenkov
publishdate: 2020-12-02
type: blog/post
header_type: fixed-header
---

*In [part 1](blog/protobuf-whats-in-it-for-your-project/) of this series, we have shared how we discovered Protobuf, discussed its advantages over the prior art, and described what it takes to standardize data types in a complex multi-platform software system. In this chapter, we are going to address the elephant in the room which comes with Protobuf in Java in particular — immutable data types.* 

## To Change or Not to Change

When first facing the idea of immutable types, one might say: “This will never work! Not only is the concept overcomplicated, but it also leads to inferior performance”. We can sympathize with this emotion. When forced to write extra code to copy the value of an object just to introduce a single change, one should seriously question their goals. If you find yourself asking this question, this article is for you.

First things first, let’s go through the motivation behind forbidding to change stuff and why has this concept been [gaining traction](https://elizarov.medium.com/immutability-we-can-afford-10c0dcb8351d) lately.

### Consistency

Stability feels nice. We function better in a well-known environment. So, we use abstractions and analogies, to make the object model as close as we can to the real world we’re used to. An immutable object has much more in common with an item in real life than a mutable one does. Imagine that you are holding a book. On the other side of the planet, the author decides that they don’t like chapter 5 anymore, so they delete it. And your book gets a bit thinner. This is, at best, a nuisance. It would be fair to sue the author for robbing you of the part of the book. Even electronic copies are never updated like that. Instead, a book can only be updated in a single straightforward way: a copy is made, and changes are made to the new copy before distributing it. This is called a new edition. Why do we like our books to stay the same and never “upgrade” them, even if, like in the case with an e-book, it would be relatively easy to do? Well, it makes it convenient to refer to the book in the future. If we’d like to discuss chapter 5 with our colleagues, we would rather be talking about the same thing. Otherwise, we would get an aliasing bug, which is nicely described in this [blog post](https://martinfowler.com/bliki/AliasingBug.html) by Martin Fowler.

### Asynchronous Safety

Another feature of immutable types — safety when working in an asynchronous environment. This gets mentioned a lot in many technical articles, as well as software developer job interviews. The gist is as follows: atomic operations on references instead of the object’s fields are the only way to ensure the integrity of shared data. This gives us control over how the data is changed and how to resolve conflicting changes.

### In-memory Storage

More often than not, software, on both server and client sides, uses some kind of in-memory storage for data. Most likely, data structures used for that rely on objects’ hash codes and equality. Such structures are a gold standard for most platforms. For example, in Java, `HashMap` and `HashSet` will not function properly if elements placed in the map have no consistent `hashCode()` and `equals()` implementations.

For a mutable type, it is impossible to provide such implementations. Consider a mutable `User` class, which is stored in a `HashSet`. At some point, we may need to iterate through all the users in the set and change each second one of them. After such a mutation, the set is full of objects which cannot be discovered by the `contains()` method anymore, since the hash of the original object is not the same as the hash of the new object.

Such a problem would never occur with an immutable object. If fields never change, hash code won’t change either.

## Is Mutating Things Still OK?

Absolutely. There are many cases when immutability has too high of a price.

The biggest reason to use mutable types over immutable ones is the cost of copying data. At the end of the day, data in a system needs to be changed over time. Sometimes, this change happens very often. For example, creating an extra `Builder` object and a new copy of the original object make up for thrice total object references in memory over a single conventional mutable object. One should also consider the CPU time taken to create a fresh copy of the original object.

Some systems do not allow for this kind of resource usage. A great example of such a system is software which aggregates data from multiple sensors. A sensor is a small device that does not have much memory of its own, so it pushes the collected data right away in a hope that the receiving end will be able to cope with it. Such software is often run on not very powerful hardware, which poses tight performance constraints.

Another example of a system that could benefit from data mutability is an automated stock market broker, which is designed to handle requests from the market faster than the competitors. Such systems are specifically written to optimize for speed over all.

Developers should use their best judgment when considering immutability. If the tradeoff is too high, it is OK not to go all-in on immutability and use it only in cases where the performance restrictions are less harsh.

## Java API With Protobuf

In Java, generated Protobuf classes are always immutable. Each class has a nested `Builder` class, which has all the same fields but is mutable. To create an instance of such a class, we create a builder, assign the fields, and build the message.

```java
Task task = Task.newBuilder()
                .setName(“…”)
                .setDescription(“…”)
                .build();
```

In order to change a value, we create a new message based on an existing one.

```java
Task updated = task.toBuilder()
                   .setDescription(“…”)
                   .build();
```

The way Protobuf generates code represents a typical immutable API in Java, excluding some Protobuf-specific extras, such as reflection, etc.

However, an immutable data type can be of any shape and form you want, or, to be precise, any shape and form the API user needs. For example, types such as `java.lang.String`, `java.io.File`, `java.time.LocalDateTime`, etc. are all immutable data types.

## What About Other Platforms?

Unfortunately, Protobuf does not generate immutable code for JavaScript and Dart. In fact, some aspects of the message objects in JS are mutable while others [are not](https://protobuf.dev/protobuf-javascript/#repeated-fields).

Such a difference between Java and client-side languages can be explained by a desire to make client-specific Protobuf objects as lightweight and performant as possible. However, is the tradeoff really worth it in the world with more and more efficient computers? In our opinion, it is not.

Nevertheless, in Dart, there are a few tools, as well as language structures, which can help you with immutability. For instance, `built_value` and `freezed` are two libraries that allow their users to create immutable data types with [almost no extra effort](https://levelup.gitconnected.com/flutter-dart-immutable-objects-and-values-5e321c4c654e). But in order to achieve immutability for data types that originate in Protobuf, we’d have to arrange the conversion from mutable to immutable types, which is a lot of manual work. And in the end, we’d get two classes for one Protobuf type. This is a suboptimal solution, to say the least.

We have tried creating a symbiosis between `built_value` and Protobuf to achieve immutable “front-facing” types, which would rely on standard Protobuf Dart code for serialization. This attempt has failed as we have found ourselves juggling too many noncoherent abstractions. At the time of writing, we [plan]({{% get-site-data "repositories.core_jvm_repo" %}}/issues/1334) to implement custom code generation to support Dart, JavaScript, and Java, which addresses the limitations we face and provides immutability.

## What’s Next?

To summarize, immutability is a helpful concept for many reasons. Firstly, it helps people understand the lifecycle of an object by building direct analogies with items from the real world. Secondly, it has technical advantages, such as clearer relations with data structures and asynchronous safety. Although there are cases when mutable types are still preferable for performance reasons, most systems may enjoy the benefits of immutability without extra concerns.

In Java, Protobuf helps us create immutable data types with ease by generating all the code required for building and copying objects. There are also tools that can be used for this task in other languages, such as Dart.

Simplicity and technical advantages aside, immutable data types are important for a greater reason. They assist us in building projects based on Domain-Driven Design. In the following parts of this series, we are going to talk about DDD and how Protobuf helps us build Domain Models, starting with Value Objects, a simple yet powerful pattern for translating domain concepts into the machine language.
