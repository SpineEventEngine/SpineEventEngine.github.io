---
title: Validation User Guide
headline: Validation User Guide
bodyclass: docs
layout: docs
---

Protobuf is a great tool for structuring domain models. Protobuf definitions help us to standardize
creating [Value Objects](https://martinfowler.com/bliki/ValueObject.html).
Spine enhances Protobuf with a validation library.

This guide will walk you though the API of Spine validation library.

# Validation options
## Required fields

In Protobuf 2 the concept of required fields used to be built into the language. This proved to be
a [design mistake](https://stackoverflow.com/a/31814967/3183076) and in Protobuf 3 all the fields
are optional. However, we've revived the concept in Spine validation library. The main difference
between the Protobuf 2 `required` and our `(required)` is that our validation allows ignoring invalid
fields and transmitting them over the wire. The choice whether or not to use validation lies solely
on the developer.

### How required fields work

Fields in protobuf may have either a primitive type or a user-defined type. A user-defined type is
a `message` or an `enum` and primitive types are numbers, `string`, and `bytes`. Due to limitations
of the binary format, there is no way to tell if a number field is set to `0` or not just not set.
This means that a number field cannot be required, as there is no way to check if it is set. All 
the other fields can be required. For `message` fields this means that the message must not be
empty. For `enum` fields, this means that the enum value must have a number other than `0` (since 
the enum value with number `0` is the default value of the field). For `string` and `bytes` fields
this means that the sequence must not be empty.

For collection fields (i.e. `repeated` and `map`), a field is considered set if:
  1. The collection is not empty.
  2. At least one of the entries (values for `map`s) matches the rules described above.

Note that collections of number fields can be required. In those cases, only the rule 1. applies and
the rule 2. is ignored.

### Declaring required fields

In the basic scenario, a single required field is marked with the `(required)` option:

```proto
import "spine/options.proto";

message PhoneNumber {
    string digits = 1 [(required) = true];
}
```  

Here, the field `PhoneNumber.digits` is required. If the API user tries to validate an instance of
`PhoneNumber` without this field, a `ConstraintViolation` is produced.

There are more complex cases for required fields than just a single field. Consider a `oneof` field
group, which always has to be set. Applying `(required)` to the fields does not make sense, since
only one field in the group can be set at a time. Instead, Spine provides `(is_required)` option:

```proto
import "spine/options.proto";

message UserIdentity {
    oneof auth_type {
        option (is_required) = true;
        
        EmailAddress email = 1;
        GoogleId google = 2; 
        TwitterId twitter = 3; 
    }
}
```

In this case one of the fields `UserIdentity.email`, `UserIdentity.google`,
and `UserIdentity.twitter` must be set.

Other cases call for conditional required fields. In particular, some fields of a message must be
set alongside other fields. Consider an example of an online store item:

```proto
message Item {

    // ...

    Timestamp when_opened_for_sale = 42;
    UserId who_opened_for_sale = 42 [(goes).with = "when_opened_for_sale"];
}
```

The `Item.who_opened_for_sale` field only makes sense for the domain if 
the `Item.when_opened_for_sale` field is set. `(goes)` option 

Finally, there are some cases, in which a pair of fields may be set at the same time, but at least
one of them must be set. This and more complex cases are handled by the type-level
`(required_field)` option:

```proto
import "spine/options.proto";

message PersonName {
    option (required_field) = "given_name|honorific_prefix & family_name";

    string honorific_prefix = 1;
    string given_name = 2;
    string middle_name = 3;
    string family_name = 4;
    string honorific_suffix = 5;
}
``` 

In case of `PersonName`, either `given_name` or both `honorific_prefix` and `family_name` must be
set. All three can be set at the same time.



### Missing fields

In case if a required field is missing, the validation error message will explicitly say so.
However, if you need a specific error message for this field, you can provide it via
the `(if_missing)` option:

```proto
import "spine/options.proto";

message PhoneNumber {
    string digits = 1 [(required) = true,
                       (msg_format = "Phone number must contain digits.")];
}
```

Note that this option only applies to fields marked with `(required)` and not to the fields
referenced via any other options.

If `(goes)` option is used, the error message can be customized with the `(goes).msg_format`
parameter. Note that the message should contain two "`%s`" insertion points: first for the name of
the field declaring the option and second for the name of the field targeted by the option.

### When `(required)` is implicit

In Spine, by convention, if the first declared field of a [Command](../introduction/naming-conventions.html#command-definitions),
an [Event](../introduction/naming-conventions.html#event-definitions), or an entity state is
not a collection field, it is considered an entity ID and made required by default. To override this
convention, use `(required) = false`. 

Example:

```proto
message User {
    option (entity).kind = AGGREGATE;

    UserId id = 2;
    PersonName name = 1;
    // ...
}
```

In this case, the `User.id` field is implicitly `(required) = true`. Note that the field __number__
has nothing to do with this convention, only the field __order__. Thus, `User.name` is not required.

For the next example, consider `user_events.proto`:

```proto
message ProfilePictureChanged {

    Url new_picture = 1 [(required) = false];
    UserId id = 2;
}
```

In this case, the `ProfilePictureChanged.id` field is not required, since it's not declared first
in the field. The field `ProfilePictureChanged.new_picture` is not required because the convention
is overridden with an explicit option.

## Recursive message validation

When a message is validated, only the "shallow" constraints are checked by default. This means that
the message fields can be invalid and the container message is still considered valid.

In order to enable message field checks, use `(validate)` option:

```proto
message User {
    
    PersonName name = 2 [(validate) = true];
    // ...
}
```

When an instance of `User` is validated, constraints of `User.name` will also be checked.
If any violations are found, they will be packed into a single violation of the `User` message.

When applied to a `repeated` or a `map` field, each item (value of a `map`) is validated.

### Invalid fields

If a specific error message is required for an invalid field, the `(if_invalid)` option should be
used:

```proto
message User {
    
    PersonName name = 2 [(validate) = true,
                         (if_invalid).msg_format = "User name is invalid."];
    // ...
}
```

## Number bounds

For number fields, Spine defines a few options to limit the range of expected values.

### `(min)`/`(max)`

`(min)` and `(max)` are twin options which define the lower and higher bounds for a number fields.
The value is specified as a string. Note that the string must be parsable into the field's number
format (e.g. a `int32` field cannot have a `"2.5"` bound).

By default, the bounds are __inclusive__. Use the `exclusive` property to make a bound exclusive. 

Example:

```proto
message Distance {

    uint64 meters = 1;
    uint32 millimeters = 2 [(max) = { value: "1000" exclusive: true }];
}
```

### Ranges

The `(range)` option is a shortcut for a combination of `(min)` and `(max)`. A range specifies both
boundaries for a number field. `(range)` is a `string` option. The `(range)` notation allow
declaring inclusive and exclusive boundaries. A round bracket (`(` or `)`) denotes an exclusive
boundary and a square bracket (`[` or `]`) — an inclusive boundary.

Example:

```proto
message LocalTime {
    
    int32 hours = 1 [(range) = "[0..23]"];
    int32 minutes = 2 [(range) = "[0 .. 60)"];
    float seconds 3 [(range) = "[0 .. 60.0)"];
}
```

In the example above, the `LocalTime.hours` field can span between 0 and 23, the `LocalTime.minutes`
field can span between 0 and 59, and the `LocalTime.seconds` field can span between 0.0 and 60.0,
but can never reach 60. Exclusive boundaries are especially powerful for fractional numbers, since,
mathematically, there is no hard upper limit which a field value can reach.

Usage of the double dot separator (`..`) between the bounds is necessary. 

<p class="note">
In some languages, Protobuf unsigned integers are represented by signed language primitives.
For example, in Java, a `uint64` is represented with a `long`. If a value of a field in Java will
overflow into `long` negatives, it will be considered a negative by the validation library. Keep
that in mind when defining lower bounds.
</p>

## Regular expressions

For `string` fields, the library provides the `(pattern)` option. Users can define a regular
expression to match the field values. Also, some common pattern modifiers are available:
 - `dot_all` (a.k.a. "single line") — enables the dot (`.`) symbol to match all the characters,
   including line breaks;
 - `case_insensitive` — allows to ignore the case of the matched symbols;
 - `multiline` — enables the `^` (caret) and `$` (dollar) signs to match a start and an end of
   a line instead of a start and an end of the whole expression;
 - `unicode` — enables matching the whole UTF-8 sequences;
 - `partial_match` — allows the matched strings to contain a full match to the pattern and some 
   other characters as well. By default, a string only matches a pattern if it is a full match,
   i.e. there are no unaccounted for leading and/or trailing characters.
   
Example:

```proto
message HyperReference {
    string url = 1 [(pattern) = { 
            regex: "https?://.+\\..+" 
            modifier: {
                case_insensitive: true
            }
    }];
}
```

It is recommended to use simple patterns due to performance considerations. For example, fully
fledged URL and email patterns are famously too long to be used in most cases. Treat `(pattern)`
checks as if they were yet another code with regex matching in it.

## Temporal constraint

Spine provides an option for validating time-bearing types. Those are:
 - `google.protobuf.Timestamp`;
 - `spine.time.YearMonth`;
 - `spine.time.LocalDate`;
 - `spine.time.LocalDateTime`;
 - `spine.time.OffsetDateTime`;
 - `spine.time.ZonedDateTime`;
 - any user-defined type which implements the Temporal interface (`io.spine.time.Temporal` for
   Java).
   
Using the option `(when)`, you may declare that the timestamp should lie in past or in future.

```proto
import "spine/time_options.proto";
import "spine/time/time.proto";

message PlaceOrder {
    
    // ...

    spine.time.ZonedDateTime when_placed = 12 [(when).in = PAST];
    spine.time.ZonedDateTime when_expires = 13 [(when).in = FUTURE];
}
```

Note that the value is checked in relation to the current server time. In most cases, this should
not be an issue. However, be aware that using `FUTURE` in Events and entity states may cause
validation errors upon playing historical Events in future. However, that is not the case with
Commands.  

## Distinct collections

Often, a `repeated` field logically represents a set rather than a list. Protobuf does not have
a native support for sets. Moreover, it is often an invalid operation to add a duplicate element to
a set. For such cases, Spine provides the `(distinct)` option, which constrains a `repeated` or
a `map` field to only contain non-duplicating elements (values in case of `map`s).

Example:

```proto
message User {

    repeated EmailAddress recovery_emails = 42 [(distict) = true];
}
```

## Non-mutable state fields

For entity states, Spine defines a special validation constraint. It is not typically checked in any
other situation, but only when updating a state of an existing Spine entity.

Many fields of an entity are immutable. They may be set one in the life of the entity and then
should never be changed. In order to enforce this, we provide the `(set_once)` option. The option
allows changing a value of a field only if the current value is the default value. Changing a field
from a non-default value to anything else will cause a violation.

Example:

```proto
message Order {
    option (entity).kind = AGGREGATE;

    // ...
    
    Timestamp when_deleted = 314 [(set_once) = true];
}
```

Once the `Order.when_deleted` field is filled, it can never change.

# External constraints

Sometimes, you need to impose extra validation rules on types you do not control. Consider
the example of an image URL which should always have the `ftp` protocol:

```proto
message User {

    // ...

    Url profile_picture = 42;
}
```

How do we add validation to the fields inside `Url` so that only the `User.profile_picture` is
affected? Just for this purpose, Spine provides the mechanism of external constraints — validation
constraints defined outside the message.

To declare an external constraint, use the `(constraint_for)` option:

```proto
message UserPictureConstraint {
    option (constraint_for) = "org.example.user.User.profile_picture";

    string spec = 1 [
            (required) = true,
            (pattern).regex = "ftp://.+",
            (pattern).msg_format = "Profile picture should be available via FTP (regex: %s)."
    ];
}
```

The definition of `User` itself need not change.

Note that the fields of an external constraint declaration should replicate the fields of the target
type. In our example, the `Url` type. If the `Url` type had many fields, only those which need any
validation should be declared. However, note that if the `Url` type declares any validation on its
own, all of it is discarded and only the "substitute" rules from the `UserPictureConstraint` are
used.

<p class="note">
Mind performance considerations when declaring external constraints. It is expected that the number
of such constrains in the whole project is not large, significantly smaller than the number of
normal constraints. This mechanism is not designed to override validation rules of an entire library
of Protobuf definitions, merely a small amount of local patches.
</p>
