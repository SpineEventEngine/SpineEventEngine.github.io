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

Now, when an instance of `User` is validated, constraints of `User.name` will also be checked.
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
