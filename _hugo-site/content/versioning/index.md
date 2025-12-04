---
title: Versioning Policy
headline: Versioning Policy
header_type: fixed-header
---

# Versioning Policy

Spine version format is `[MAJOR].[MINOR].[PATCH]`, where:

- The **MAJOR** version is incremented when significant changes are introduced to the API or the 
functionality of the framework gains a major extension. For example, this can happen when migrating 
to the next version of JDK or when the architecture of the framework has been significantly changed. 

- The **MINOR** version is incremented when the API has been extended with new functionality. 
Most of the time the changes are backward-compatible. However, a&nbsp;minor version release might 
include some breaking changes. We treat minor releases with the version number X.X.0 as being 
stable for use in production.

- The **PATCH** version is incremented when some enhancements or fixes are made during the 
development process. There may be incompatible API changes as well. Therefore, the releases 
with the patch version other than zero are not recommended for production use.
