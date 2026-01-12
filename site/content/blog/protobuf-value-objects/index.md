---
title: Protobuf — serialization and beyond. 
  Part 3. Value objects
description: >-
  In the following few chapters, we will explore the specifics of using Protobuf in systems based on Domain-Driven Design. This one describes a simple yet powerful concept of Value Objects.
author: Alexander Yevsyukov and Dmytro Dashenkov
publishdate: 2021-03-17
type: blog/post
header_type: fixed-header
---
*This article continues the series on the practical aspects of using Google Protocol Buffers. In the following few chapters, we will explore the specifics of using Protobuf in systems based on Domain-Driven Design. This one describes a simple yet powerful concept of Value Objects.*

We have been using Protobuf as more than just a serialization mechanism from the very beginning. It provides a language to model the domain. This ability is especially useful in projects based on the [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html) methodology, aka DDD.

The defining feature of a Domain Model is the [Ubiquitous Language](https://martinfowler.com/bliki/UbiquitousLanguage.html) — a language that is used and agreed upon throughout the domain: by the domain experts, programmers, and in the code. A Domain Model consists of many components, but the language lays the base for all of them. Value Objects help up transform the language into code.

## What are Value Objects?
A Value Object is a simple type that represents any kind of logically indivisible domain information, such as `EmailAddress`, `PhoneNumber`, `LocalDateTime`, `Money`, etc. Unlike Entities, Value Objects are only identified by the value itself, i.e. they do not have a designated ID. These objects are immutable and, typically, not too big. Apart from the encapsulation of the data itself, such types can hold the validation logic, basic operations on the data, the string representation, etc. For example, the type `LocalDateTime` may provide methods such as `add(Duration)` which calculates the local date and time after a given duration passes. The result is another instance of `LocalDateTime`, while the original object is unchanged.

As mentioned earlier, the Value Objects are primarily used to integrate the language of the domain into the application’s system of types. It is a common misconception to treat Value Objects as dummy data structures. In practice, a Value Object is the way to escape all the problems related to the data structures, such as data inconsistencies and [anemic models](https://www.martinfowler.com/bliki/AnemicDomainModel.html).

## Why Protobuf?
Creating Value Objects in Protobuf is convenient because:

1. The domain types are created fast and for the many target languages, officially [supported by Google](https://developers.google.com/protocol-buffers/docs/tutorials) and [third-party](https://chromium.googlesource.com/chromium/src/+/master/third_party/protobuf/docs/third_party.md).
   Let’s see how the Value Object can be implemented in Protobuf.

```proto
message EmailAddress {
string value = 1 [
(required) = true,
(pattern).regex = ".+@.+\..+"
];
}
```

Out of this declaration, the Protobuf compiler will generate a type, instances of which are compared by the value field. For example, in Java, the class would have a generated `equals()` method.

Note that the `(required)` and `(pattern)` options are extensions to Protobuf provided by the [Validation library](https://spine.io/docs/guides/validation) (which is a part of the Spine Event Engine framework).

In addition, in some target languages, such as Java, generated Protobuf types are immutable by default. Unfortunately, some other languages, such as JavaScript and Dart, only support [mutable types](https://github.com/dart-lang/protobuf/issues/413). For Dart, however, a community-driven solution seems to be on the way. The [immutable_proto](https://pub.dev/packages/immutable_proto) package implements code generation for immutable types from Protobuf. We have not tried it out yet, as the library is still in its earliest form, but the notion that other engineers feel our pain and try to do something about it as well warms our hearts.

For further reading on immutability with regards to Protobuf, see our [previous article](blog/immutability/).

## Validation
The `EmailAddress` type as declared above has one string field with naive validation via a regular expression. Also, the value field should be filled. This validation API is a part of our efforts on improving the code generation with Protobuf. Right now, we generate validation code for Java and Dart, in order to cover both backend and frontend. Later, other target languages might join the club.

The validation rules are determined based on the options, such as `(required)` and `(pattern)`. At build time, we add the extra code which validates the message values based on those rules. The code is triggered automatically when a message is constructed. No more extra easy-to-forget steps for validation!

We will discuss the capabilities and the internals of our validation mechanism in more detail in the next articles of this series.

## Adding Behavior with the (is) Option
An important part of the Value Object is its behavior. OOP greatly influences the mindset of a programmer, and the need to create utility classes and methods for every little thing at the same time annoys and complicates writing and understanding the code. The ability to create domain types quickly is nice, but we also want them to be convenient to “talk” about in the code. Instead of `user.getAddress().getCountry()`, we would like to be able to write `user.country()`.

In Java, Protobuf generates non-extensible classes, which makes it hard to add behavior to them. We have solved this problem by defining the option (is). It takes the names of Java interfaces with which we want to mark the Protobuf message. Such interfaces may include default methods, adding behavior to the Value Object. Our custom Protobuf compiler plugin modifies the generated code so that the Proto-types implement the assigned interfaces. Here is how this works.

```proto
message User {
option (is).java_type = "UserMixin";
UserId id = 1 [(required) = true];
// The primary billing address.
Address address = 2 [(required) = true];
...
}
```

And here is the `UserMixin` declaration:


```java
public interface UserMixin extends UserOrBuilder {
/**
* Obtains the residence country of this user.
*/
default Country country() {
return getAddress().getCountry();
}
...
}
```

Our Protobuf Compiler plugin sees the `(is).java_type` option and adds the specified interface to the list of implemented interfaces of the generated class. Note that the mixin interface extends the `OrBuilder` interface generated by the Protobuf compiler by default. This little trick allows us to use the getter methods generated for the message fields, such as `getAddress()`.

## Typed Identifiers
A special case of a Value Object is an identifier.

The Domain-Driven Design experts [recommend](https://buildplease.com/pages/vo-ids/) having a separate ID type for each of the entity types. It is particularly important in the modern, reactive edition of DDD, where entities process messages (commands or events). Using primitive types or strings for identifiers can lead to a mix-up with parameters if their types are the same. For example, if we have `customerId`, `orderId`, `userId`, and all of them are `long` or `String`, it is easy to mess up with their order mechanically:

```java
completeOrder(String userId, String customerId, String orderId);
```

Moreover, using primitive types for IDs might possibly bring a set of unpleasant side-effects. For instance, `long` IDs, when used on fastly growing entity types (think domain events, user sessions, etc.) may overflow.

Type-safe IDs offer a solution to these issues. First of all, type-safe IDs cannot be accidentally mixed up, as the compiler will catch such errors easily. Apart from this, the code which works with the typed identifiers is more compact. It is easier to read and understand. For instance, let’s compare the latter to the same call, but with typed IDs:

```java
completeOrder(UserId user, CustomerId customer, OrderId order);
```

Having said the `Id` once in a type name, we can easily drop the `Id` prefix from each of the parameter names. And we can even write this way:

```java
completeOrder(UserId u, CustomerId c, OrderId o);
```

Another benefit to type-safe identifiers lies in their structure. In the basic case, an ID type for an entity looks as follows:

```proto
message CustomerId {
string uuid = 1;
}
```

However, by hiding the type of identifier implementation, we gain the ability to expand it if necessary. For example, to integrate the data of different vendors. We can do it with `oneof` construction:

```proto
message CustomerId {
oneof kind {
uint64 code = 1;
EmailAddress email = 2;
string phone = 3;
}
}
```

Since Protobuf is specifically designed to allow additive changes to types without any migration hustle, changing ID structure might just be as easy as adding extra fields to the ID type.

## Conclusion
Value Objects as a whole is a great concept. It helps the developers bring the ubiquitous language into the code and avoid errors by forming a strongly typed model, instead of one based on primitives.

Protobuf helps make the creation and maintenance of Value Objects easier. Simple Value Objects which introduce domain clarity into the code are a great improvement already. Coupled with typed identifiers, they bring extra benefits. Thanks to Protobuf, such types can be declared once and distributed all around the system, bridging the language barriers between different components.

Adding an extra layer of bespoke code generation, including validation rules, behaviour, and type grouping via Java interfaces, we get a powerful mechanism with a strongly typed model able to maintain simple domain invariants.

Lastly, coupled with the Domain-Driven approach to software architecture, we get a system that, from the ground up, helps the developer tackle only one problem at a time, from simple mechanical issues, on the Value Object level, to however complex business requirements on higher levels.

In the next parts of this series, we will explore those higher levels of the Domain-Driven Design adoption, and see how Protobuf can help us besides Value Objects.