---
bodyclass: docs
layout: docs
headline: Android Java Quickstart
sidenav: doc-side-quickstart-nav.html
type: markdown
---
<p class="lead">This guide gets you started with Spine in Android Java with a simple
working example.</p>

<div id="toc"></div>

## Before you begin

### Prerequisites

*   `JDK`: version 7 or higher
*   Android SDK
*   An android device set up for [USB
    debugging](https://developer.android.com/studio/command-line/adb.html#Enabling)
    or an [Android Virtual
    Device](https://developer.android.com/studio/run/managing-avds.html)

## Download the example

TBD

## Run a server application

TBD

#### Connecting to the Hello World server via USB

To run the application on a physical device via USB debugging, you must
configure USB port forwarding to allow the device to communicate with the server
running on your computer. This is done via the `adb` command line tool as
follows:

```
adb reverse tcp:8080 tcp:50051
```

This sets up port forwarding from port `8080` on the device to port `50051` on
the connected computer, which is the port that the Hello World server is
listening on.

Now you can run the Android Hello World app on your device, using `localhost`
and `8080` as the `Host` and `Port`.

#### Connecting to the Hello World server from an Android Virtual Device

To run the Hello World app on an Android Virtual Device, you don't need to
enable port forwarding. Instead, the emulator can use the IP address
`10.0.2.2` to refer to the host machine. Inside the Android Hello World app,
enter `10.0.2.2` and `50051` as the `Host` and `Port`.

## What's next

- TBD
- Work through a more detailed tutorial in [Spine Client App Basics: Android Java][]
- TBD

[Spine Client App Basics: Android Java]:../tutorials/basic/android.html
