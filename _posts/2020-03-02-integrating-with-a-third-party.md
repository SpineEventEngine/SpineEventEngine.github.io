---
layout: post
title: Integrating with a third party
published: true
bodyclass: post
header_type: fixed-dark-header
author: Dmytro Dashenkov
---

When developing an [Event-based](https://spine.io/docs/introduction/concepts.html#event) system, it is often tricky to integrate it with other software, be it a third party or a legacy system.

In this article, we will explore the strategies of integrating third-party systems with your Spine-based [Bounded Context](https://spine.io/docs/introduction/concepts.html#bounded-context). 

<!--more-->

Note that we think of a third-party system like of yet another Bounded Context with its own language. The terms “Bounded Context” and “System” are used interchangeably throughout the article.

To start the integration, your team should decide what portion of the other system’s domain model you should adopt and how exactly you want to isolate your system from the third party. In DDD terms, this means choosing the strategy of Context Mapping.

## Context Mapping — TL;DR

For the purpose of this article, let’s consider only the technical (and not the organizational) aspect of a Context Map. You can read more about the concept as a whole in the ["Domain-Driven Design" book](https://dddcommunity.org/book/evans_2003/) by Eric Evans.

A Context Map, from a technical perspective, is the relationship between several Bounded Contexts. The book lists a few archetypes of a Context Map. Some of them are:

 - *Customer/Supplier Models*, which establish an upstream-downstream relation. The Supplier team tailors its model specifically for the Customer model. For this strategy to work, the developers of both models have to collaborate.
 - The *Conformist* pattern, which is very similar to the Customer/Supplier, except that the upstream is not available for change. Thus the downstream has to copy the language into its model thoughtlessly, hence conformism.
 - *Anticorruption Layer* pattern (a.k.a. *ACL*), describing a Bounded Context, which is not willing to accept the language of the upstream and instead builds an intermediate model in the "no man’s land". The *ACL* translates the language of the upstream into the native language of the downstream Context.

<p class="note">
This list is not exhaustive. The ["Domain-Driven Design" book](https://dddcommunity.org/book/evans_2003/) offers a few more strategies, all worth considering. However, in this article, we are going to describe the listed three patterns, because they are the most commonly used.
</p>

## The Domain

![Big picture domain]({{ site.baseurl }}/img/integrating-with-a-3d-party/domain.jpg)

For the sake of an example, let’s consider airport management software. An airport is a complex system which relies on many people and much software working together. Let’s consider the system which helps the flight dispatchers make decisions on **Takeoffs and Landings**. The system integrates with the software responsible for **Security Checks**, **Airplane Supplies**, and **Weather**. All of these systems are independent of **Takeoffs and Landings** as well as of each other. Thus, each of them can be treated as a third party.

<p class="note">
**Disclaimer.** The domain of an airport was chosen for being an "easy" example, familiar to many readers. The system reflects a general impression of an airport and should not be treated as an accurate representation.
</p>

## Customer/Supplier Contexts

![Customer/Supplier Contexts domain]({{ site.baseurl }}/img/integrating-with-a-3d-party/customer-supplier.jpg){: .small-square-image}

The **Takeoffs and Landings** system must know whether an *Aircraft* is ready for the *Flight*. This decision requires data on the supplies, which are provided for the *Aircraft*. To obtain this knowledge, the system integrates with the **Airplane Supplies** Context. Note the language difference between the *Aircraft* and an *Airplane*. Apparently, the two Contexts view the same entity of the real world from different perspectives.
**Airplane Supplies** Context is an integral part of the airport software. Thus, by communicating with the developers responsible for **Airplane Supplies**, we are able to build a Customer/Supplier relationship between the **Airplane Supplies** Context and our system. The **Airplane Supplies** Context does not implement an Event-based messaging internally. However, it still acts as a Supplier. Specially for **Takeoffs and Landings**, the Supplier Context generates Events and publishes them to a shared channel. **Takeoffs and Landings**, the Customer, subscribes to those Events. 
Note that those Events are specifically tailored to be consumed by our system, and thus we do not have to set up an elaborate Anticorruption Layer. However, a simple adapter is still required to parse and validate domain Events, which we then publish to a Bounded Context, implemented in Spine.

![Customer/Supplier Contexts diagram]({{ site.baseurl }}/img/integrating-with-a-3d-party/customer-supplier-diagram.svg)

The Event Consumer, as depicted above, implements the Event transformation logic. In order to establish this communication channel, the **Airplane Supplies** system declares a [gRPC](https://grpc.io/) service. In [`supplies_service.proto`](https://github.com/spine-examples/airport/blob/master/airplane-supplies/src/main/proto/spine/example/airport/supplies/supplies_service.proto):

```proto
// ...
message Subscription {
    string uuid = 1;
    EventType event_type = 2;
    google.protobuf.Timestamp starting_from = 3;
}

service SuppliesEventProducer {
    rpc Subscribe(Subscription) returns (stream SuppliesEvent);
}
```

The **Airplane Supplies** system [implements](https://github.com/spine-examples/airport/blob/master/airplane-supplies/src/main/java/io/spine/example/airport/supplies/SuppliesEventProducer.java) the service and exposes it on an endpoint available to the **Takeoffs and Landings** system:

```java
public final class SuppliesEventProducer 
        extends SuppliesEventProducerImplBase {

    @Override
    public void subscribe(Subscription request, StreamObserver<SuppliesEvent> responseObserver) {
        Timestamp timestamp = request.getStartingFrom();
        Instant startingFrom = timestamp.toInstant();
        historicalEvents
            .stream()
            .filter(event -> event.getWhenOccurred().isLaterThan(timestamp))
            .filter(event -> matches(event, request.getEventType()))
            .map(event -> event.toBuilder()
                               .setSubscription(request)
                               .build())
            .onClose(responseObserver::onCompleted)
            .forEach(responseObserver::onNext);
    }

    // ...
}
```

The event producer obtains cached historical events, matches them to the received subscription, and sends them to the client. The **Takeoffs and Landings** system implements an [event consumer](https://github.com/spine-examples/airport/blob/master/takeoffs-and-landings/src/main/java/io/spine/example/airport/tl/supplies/SuppliesEventConsumer.java) which constructs a subscription and maintains it as long as the system needs to receive more events. The consumer broadcasts the received Events via an instance of [`ThirdPartyContext`](https://spine.io/core-java/javadoc/server/io/spine/server/integration/ThirdPartyContext.html):

```java
@Override
public void onNext(SuppliesEvent event) {
    ActorContext actorContext = ActorContext
            .newBuilder()
            .setActor(ACTOR)
            .setTimestamp(event.getWhenOccurred())
            .vBuild();
    EventMessage eventMessage = (EventMessage) unpack(event.getPayload());
    airplaneSuppliesContext.emittedEvent(eventMessage, actorContext);
}
```

The [`AircraftAggregate`](https://github.com/spine-examples/airport/blob/master/takeoffs-and-landings/src/main/java/io/spine/example/airport/tl/AircraftAggregate.java) reacts on those events. Note that all the events published through `ThirdPartyContext` are always `external`, so should be the subscriber and reactor methods.

```java
@React(external = true)
AircraftPreparedForFlight on(PreflightCheckComplete event) {
    return AircraftPreparedForFlight
            .newBuilder()
            .setId(id())
            .vBuild();
}
```

## Conformist

![Conformist domain]({{ site.baseurl }}/img/integrating-with-a-3d-party/conformist.jpg)

**Weather** is an essential aspect of flying a plane, especially at low altitudes. The **Weather** Context wraps the data received from a meteorological station. This is a true third party to our system, as our organization, the airport, does not own it. Nearly all the details of a weather update are important to **Takeoffs and Landings**. The **Weather** Context forces **Takeoffs and Landings** to conform to its domain model.

![Conformist diagram]({{ site.baseurl }}/img/integrating-with-a-3d-party/conformist-diagram.svg)

The schema of the conformist relation looks somewhat like the Customer/Supplier schema. Similar to the Customer/Supplier, **Takeoffs and Landings** Context is downstream from another Context, in this case from **Weather**. Unlike the Customer/Supplier, **Weather** does not provide a specific Event Producer, which would adapt **Weather** Events to the needs of **Takeoffs and Landings**. Also, the Event Consumer on the **Takeoffs and Landings** side is rather thin and devoid of logic. The Consumer consists of two parts: [`WeatherUpdateClient`](https://github.com/spine-examples/airport/blob/master/takeoffs-and-landings/src/main/java/io/spine/example/airport/tl/weather/WeatherUpdateClient.java) and [`WeatherUpdateEndpoint`](https://github.com/spine-examples/airport/blob/master/takeoffs-and-landings/src/main/java/io/spine/example/airport/tl/weather/WeatherUpdateEndpoint.java). The client polls the pull-style API of the **Weather** system.

```java
public void start() {
    // ...
    Request getEvents = new Request.Builder()
            .get()
            .url(weatherService.getSpec() + "/events")
            .build();
    while (running) {
        try {
            ResponseBody responseBody = client.newCall(getEvents)
                                              .execute()
                                              .body();
            WeatherMeasurement measurement = 
                    WeatherMeasurement.fromJson(responseBody.string());
            endpoint.receiveNew(measurement);
        } catch (IOException e) {
            logger().atSevere().withCause(e).log();
        }
    }
}
```

The endpoint handles the polled measurements and publishes them as Events in the **Takeoffs and Landings** context:

```java
public void receiveNew(WeatherMeasurement measurement) {
    if (!previous.isUnknown()) {
        WindSpeedChanged event = WindSpeedChanged
            .newBuilder()
            .setNewSpeed(measurement.toWindSpeed())
            .setPreviousSpeed(previous.toWindSpeed())
            .vBuild();
        weatherContext.emittedEvent(event, actor);
        TemperatureChanged event = TemperatureChanged
            .newBuilder()
            .setNewTemperature(measurement.toTemperature())
            .setPreviousTemperature(previous.toTemperature())
            .vBuild();
        weatherContext.emittedEvent(event, actor);
    }
    previous = measurement;
}
```

The [`FlightAggregate`](https://github.com/spine-examples/airport/blob/master/takeoffs-and-landings/src/main/java/io/spine/example/airport/tl/FlightAggregate.java) reacts on those events and changes its state as the result:

```java
@React(external = true)
Optional<FlightRescheduled> on(TemperatureChanged event) {
    float newTemperature = event.getNewTemperature().getDegreesCelsius();
    float previousTemperature = event.getPreviousTemperature().getDegreesCelsius();
    if (abs(previousTemperature - newTemperature) > TEMPERATURE_CHANGE_THRESHOLD) {
        return Optional.of(postpone(QUARTER_OF_AN_HOUR));
    } else {
        return empty();
    }
}
```

## Anticorruption Layer

![ACL domain]({{ site.baseurl }}/img/integrating-with-a-3d-party/acl.jpg){: .small-square-image}

**Security Checks** Context has a rich model of its own. The system happens not to use domain Events at all. The **Security Checks** software,  used in our airport, must go through a complex audit and certification process upon each change. Thus, the cost of  changing it is too high. However, the **Security Checks** also happens to expose an API for fetching the current internal state of the system. The fetched state has a consistency lag, which never exceeds a known value (e.g. 2 minutes). In other words, the client of the **Security Checks** API can be sure that the received data was accurate at most 2 minutes before the query.
Interaction with legacy software with known technical issues can be established with the help of an Anticorruption Layer. This pattern suggests that we cope with the problems, imposed by the legacy system, outside our domain model.

![ACL diagram]({{ site.baseurl }}/img/integrating-with-a-3d-party/acl-diagram.svg)

The Anticorruption Layer (ACL) acts as an interpreter from the language of **Security Checks** Context into the language of **Takeoffs and Landings** Context. The ACL takes care of polling data from the **Security Checks** API, filtering it out, transforming it into Events, which can be understood by **Takeoffs and Landings**, etc.
The idea of an Anticorruption Layer may sound simple. In practice, this is a very powerful tool when it comes to integrating with a third-party or legacy system. It is often used when splitting up a large monolithic legacy system (a.k.a. a Big Ball of Mud) into Bounded Contexts. In those cases, an ACL prevents the new "clean" Contexts from merging back into the Mud. If you are looking for a way to add functionality to a complex legacy system without increasing the technical debt, look no further.
The Anticorruction Layer between **Takeoffs and Landings** and **Security Checks** is composed of a [polling client](https://github.com/spine-examples/airport/blob/master/takeoffs-and-landings/src/main/java/io/spine/example/airport/tl/passengers/PassengerClient.java), which performs all the technical work of obtaining and validating data, and a [Process Manager](https://spine.io/docs/introduction/concepts.html#process-manager) for the [Boarding process](https://github.com/spine-examples/airport/blob/master/takeoffs-and-landings/src/main/java/io/spine/example/airport/tl/passengers/BoardingProcman.java). The **Security Checks** API provides data for each passenger independently. The client polls the data and publishes many intermediate `PassengerBoarded` or `PassengerDeniedBoarding` external events via [`ThirdPartyContext`](https://spine.io/core-java/javadoc/server/io/spine/server/integration/ThirdPartyContext.html):

```java
public void start() {
    while (active) {
        try {
            List<TsaPassenger> passengers = requestPassengers();
            passengers.forEach(this::emitIfStatusKnown);
        } catch (IOException e) {
            _warn().withCause(e).log();
        }
        // ...
    }
}

private List<TsaPassenger> requestPassengers() {
    Request request = // ...
    ResponseBody body = client.newCall(request)
                              .execute()
                              .body();
    return Json.fromJson(body.string(), TsaPassengers.class)
               .getPassengerList();
}

private void emitIfStatusKnown(TsaPassenger passenger) {
    BoardingStatus status = passenger.boardingStatus();
    if (status == BOARDED) {
        emitBoarded(passenger);
    } else if (status == WILL_NOT_BE_BOARDED) {
        emitDenied(passenger);
    }
}
```

The [Process Manager](https://github.com/spine-examples/airport/blob/master/takeoffs-and-landings/src/main/java/io/spine/example/airport/tl/passengers/BoardingProcman.java) accumulates the Events and, once the whole *Flight* is boarded, emits a `BoardingComplete` event, which is later consumed by the [*Flight* Aggregate](https://github.com/spine-examples/airport/blob/master/takeoffs-and-landings/src/main/java/io/spine/example/airport/tl/FlightAggregate.java).

```java
@React(external = true)
Optional<BoardingComplete> on(PassengerBoarded event) {
    PassengerId passenger = event.getId();
    builder().addBoarded(passenger);
    return completeOrEmpty();
}

@React(external = true)
Optional<BoardingComplete> on(PassengerDeniedBoarding event) {
    PassengerId passenger = event.getId();
    builder().addWillNotBeBoarded(passenger);
    return completeOrEmpty();
}
```

## In Conclusion

An integration job may seem complicated or even overwhelming. However, with a strong understanding of the domain and good tooling, the process boils down to a few simple steps. Indeed, it does not matter, whether you want to integrate with an outside system, your own legacy system, or reorganize your current system to work in an event-driven manner. A correct integration strategy will help you isolate and perfect your own domain language while on the work of many external systems. Read more about Bounded Contexts and their interactions in the "Domain-Driven Design" book by Eric Evans.

