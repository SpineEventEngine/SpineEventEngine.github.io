---
layout: post
title: Migrating to Java 8
published: true
bodyclass: post
header_type: fixed-header
categories: blog
---

Starting the upcoming `0.11.0` release the minimal version of Java for Spine-based application will become Java 8. Early adopters can already see the first sights of Java 8 migration in core framework modules.

<!--more-->

The reason behind this (in addition to the fact that Java 10 has been released already, hello!) is that Google is phasing out JDK 7 in their products (namely, Google AppEngine, Guava are already JDK 8-based).

In addition to changing the compilation target we’ll be migrating from Guava’s JDK 7 polyfills (such as `com.google.common.base.Optional`) to native Java 8 API. The fresh versions of Guava, JUnit are introduced as well. We are also thinking towards Java 9 and modularity, so some internal stuff is being repackaged.

The full list of changes will be available upon `0.11.0` release.
