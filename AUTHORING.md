Content Author Guide
========
This document is a guide for adding content to the [spine.io](https://spine.io) site.

**Table of Contents**
* [Using URLs](#using-urls)
    * [URLs in markdown](#urls-in-markdown)
      * [Rule 1](#rule-1----all-internal-links-must-not-start-with-a-slash)
      * [Rule 2](#rule-2----each-link-should-end-with-a-slash-to-prevent-unnecessary-redirects)
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

### Images

To render an image in markdown use:

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

# Navigation

### Main navigation

To edit navigation items, modify `site/data/navbar.yml`. 
The navigation template is located at `site/layouts/_partials/components/navbar/navigation.html`.

### Documentation side navigation

The documentation side navigation can be edited in the [SpineEventEngine/documentation](https://github.com/SpineEventEngine/documentation)
repository in the `docs/data/docs/<version>/sidenav.yml` file.

### Documentation “Next/Prev” buttons

The “Prev”/“Next” buttons are generated automatically for all document pages.
The implementation is inside the [SpineEventEngine/documentation](https://github.com/SpineEventEngine/documentation).

# Adding code samples to the site

Please see [this document](_code/EMBEDDING.md) for the instructions.

# Testing broken links

We use the [Lychee](https://github.com/lycheeverse/lychee) tool to test broken links.
To start test locally you may be required to install the tool first from the `site` directory:

```bash
npm install
```
... and then run the site:
 
```bash
hugo server
``` 

Make sure it runs on port `1313`.
After that, please use the following command from the root of the project:

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
spamming bots. We store all email variables in the `site/data/spine.yml` file.

In markdown files, use the shortcode with a provided variable from a data file, for example:

```markdown
{{< cloakemail address_variable="spine.sales_email" >}}
```

or with the display text:

```markdown
{{< cloakemail address_variable="spine.sales_email" display="Contact us" >}}
```

# Note blocks

To add a note block with additional styles in markdown files,
use the predefined `note-block` shortcode.

```markdown
{{% note-block class="note" %}}
This is some dummy text to show how a note block can look. Check this 
[example link to guides][test-url] to see how links appear inside the block.

You can add more lines or even lists:
- First item.
- Second item.
{{% /note-block %}}

[test-url]: docs/guides/
```

You can use only predefined classes such as: `note`, `warning`, or `lead`.

```markdown
{{% note-block class="lead" %}}
The test lead block.
{{% /note-block %}}
```
