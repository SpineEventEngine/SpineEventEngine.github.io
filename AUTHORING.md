Content Author Guide
========
This document is a guide for adding content to the [spine.io](https://spine.io) site.

**Table of Contents**
* [Using URLs](#using-urls)
    * [URLs in markdown](#urls-in-markdown)
      * [Rule 1](#rule-1----all-internal-links-must-not-start-with-a-slash)
      * [Rule 2](#rule-2----each-link-should-end-with-a-slash-to-prevent-unnecessary-redirects)
      * [Variables](#variables)
    * [Images](#images)
    * [URLs in HTML](#urls-in-html)
* [Navigation](#navigation)
    * [Main navigation](#main-navigation)
    * [Documentation side navigation](#documentation-side-navigation)
    * [Documentation “Next/Prev” buttons](#documentation-nextprev-buttons)
* [Adding code samples to the site](#adding-code-samples-to-the-site)
* [Testing broken links](#testing-broken-links)
* [Cloak email](#cloak-email)
* [Note blocks](#note-blocks)
* [Code blocks](#code-blocks)

<small><i><a href='http://ecotrust-canada.github.io/markdown-toc/'>Table of contents generated with markdown-toc</a></i></small>

# Using URLs

To refer to another page, image, or asset in the Spine documentation,
use relative URLs. The site domain and documentation version are added automatically.

### URLs in markdown

There are two rules to follow:

#### Rule 1 -- All internal links **must not** start with a slash.

| Good                                 | Bad                                  |
|--------------------------------------|--------------------------------------|
| `[Introduction](docs/introduction/)` | `[Introduction](/docs/introduction/)`|

#### Rule 2 -- Each link should **end with a slash** to prevent unnecessary redirects.

| Good                                 | Bad                                 |
|--------------------------------------|-------------------------------------|
| `[Introduction](docs/introduction/)` | `[Introduction](/docs/introduction)`|

#### Variables

This example shows how to use data variables and a version variable in a URL:

```markdown
[Hello World]({{% get-site-data "repositories.examples" %}}/hello/)

[Introduction](docs/{{% version %}}/)
```

Will be rendered as:

```html
<a href="https://github.com/spine-examples/hello/" target="_blank">Hello World</a>

<a href="/docs/1.9.0/">Introduction</a>
```

Where:

* {{% get-site-data "repositories.core_jvm_repo" %}} will apply the `core_jvm_repo`
  from the `site-commons` -> `data/repositories.yml` file.
* {{% version %}} adds the version label of the current page -> `1.9.0`.

### Images

To render an image in Markdown, use:

```markdown
![Image alt](img/articles/test.webp)
```

Use anchors to specify image size: `#medium`, `#small`:

```markdown
![Image alt](img/articles/test.webp#medium)`
```

### URLs in HTML

When working with layout partials, URLs should be specified using the following syntax:

```html
<a href="{{ `docs/guides/requirements` | relURL }}">Requirements</a>
```

```html
<img class="logo" src="{{ `img/spine-logo.svg` | relURL }}" alt="Spine logo">
```

# Markdown pages

It is nice to have the following parameters on every Markdown page, especially in documentation:

```markdown
---
title: Getting Started in Java
description: This guide shows how to start working with Spine in Java.
headline: Documentation
---
```

Where:
* `title` – the page title.
* `description` – a short summary of what this page is about. Used for SEO.
* `headline` – shown under the main navigation. If omitted, it is not rendered.

Optional parameters:

```markdown
---
header_type: fixed-header
body_class: privacy
customjs: js/pages/privacy.js
---
```

Where:
* `header_type` – controls how the page header behaves (for example, stays fixed while scrolling).
* `body_class` – the CSS class to style a specific page. By default, the body class is based on the page type.
* `customjs` – the path to the page-specific JavaScript.

# Navigation

### Main navigation

To edit navigation items, modify `site/data/navbar.yml`. 
The navigation layout template is located at `site/layouts/_partials/components/navbar/navigation.html`.

### Documentation side navigation

The documentation side navigation can be edited in the [SpineEventEngine/documentation][documentation-repo]
repository in the `docs/data/docs/<version_id>/sidenav.yml` file.

If it is part of a specific documentation module, it can be found in the corresponding repository 
at `docs/data/docs/<module>/<version_id>/sidenav.yml`.

### Documentation “Next/Prev” buttons

The “Prev”/“Next” buttons are generated automatically for all document pages based on the `sidenav.yml`.
The implementation is inside the [SpineEventEngine/site-commons][site-commons].

# Adding code samples to the site

Please see [this document](_code/EMBEDDING.md) for the instructions.

# Testing broken links

We use the [Lychee](https://github.com/lycheeverse/lychee) tool to test broken links.
To start test locally you may be required to [install the tool](https://github.com/lycheeverse/lychee?tab=readme-ov-file#installation).

Then navigate to the `site` directory and run the site locally
 
```bash
hugo server
``` 

Make sure it runs on port `1313`.

To test broken links, run following command from the root of the project:

```bash
./_script/proof-links
```

> We only log errors falling within the 4xx status code range. 
> Please note that some of the links are added to excludes in the [`lychee.toml`](lychee.toml) file.

Also, we have a GitHub Action which tests the links when a pull request is created. 
Please see the [`.github/workflows/proof-links.yml`](.github/workflows/proof-links.yml) 
file for details.

# Cloak email

The `cloakemail` shortcode is used to cloak emails or phone numbers from
spamming bots. We store all email variables in the `site/data/emails.yml` file in the `site-commons`.

See usage examples in [COMPONENTS.md](https://github.com/SpineEventEngine/site-commons/blob/master/COMPONENTS.md#cloak-email).

# Note blocks

To add a note block with additional styles in Markdown files,
use the predefined [`note-block`](https://github.com/SpineEventEngine/site-commons/blob/master/COMPONENTS.md#note-block) 
shortcode.

# Code blocks

See usage examples in [COMPONENTS.md](https://github.com/SpineEventEngine/site-commons/blob/master/COMPONENTS.md#code-blocks).

[documentation-repo]: https://github.com/SpineEventEngine/documentation
[site-commons]: https://github.com/SpineEventEngine/site-commons
