Content Author Guide
========
This document is a guide for adding content to the [spine.io](https://spine.io) site.

**Table of Contents** 
- [Using URLs in Markdown](#using-urls-in-markdown)
    + [Links to Blog Posts](#links-to-blog-posts)
      - [Rule 1 -- Always concatenate Jekyll and Liquid tags](#rule-1----always-concatenate-jekyll-and-liquid-tags)
      - [Rule 2 -- *(Almost)* Always start links with `{{ site.baseurl }}`](#rule-2----almost-always-start-links-with--sitebaseurl-)
      - [Rule 3 -- Always use a trailing slash after `{{ site.baseurl }}`](#rule-3----always-use-a-trailing-slash-after--sitebaseurl-)
- [Adding collapsible list for sidebar navigation](#adding-collapsible-list-for-sidebar-navigation)
- [Adding code samples to the site](#adding-code-samples-to-the-site)
- [Testing broken links](#testing-broken-links)
- [Adding email links](#adding-email-links)
- [Managing the “Prev”/“Next” buttons in the documentation](#managing-the-prevnext-buttons-in-the-documentation)
- [Using a language switcher for source code samples](#using-a-language-switcher-for-source-code-samples)

<small><i><a href='http://ecotrust-canada.github.io/markdown-toc/'>Table of contents generated with markdown-toc</a></i></small>

# Using URLs in Markdown

### Links to Blog Posts

There are thee rules to follow:

#### Rule 1 -- Always concatenate Jekyll and Liquid tags

| Good                                      | Bad                                        |
|-------------------------------------------|--------------------------------------------|
| `href="{{ site.baseurl }}{{ post.url }}"` | `href="{{ site.baseurl }}/{{ post.url }}"` |

This removes the double-slash from your site's URLs.

#### Rule 2 -- *(Almost)* Always start links with `{{ site.baseurl }}`

| Good                                      | Bad                     |
|-------------------------------------------|-------------------------|
| `href="{{ site.baseurl }}{{ post.url }}"` | `href="{{ post.url }}"` |

This fixes almost all of the in-site links. The next rule covers the remainder.

**Exception**: Start hyperlinks with `{{ site.url }}{{ site.baseurl }}` in feed pages, like `atom.xml`.

#### Rule 3 -- Always use a trailing slash after `{{ site.baseurl }}`

| Good                                      | Bad                                      |
|-------------------------------------------|------------------------------------------|
| `href="{{ site.baseurl }}/" title="Home"` | `href="{{ site.baseurl }}" title="Home"` |

| Good                                           | Bad                                           |
|------------------------------------------------|-----------------------------------------------|
| `href="{{ site.baseurl }}/public/favicon.ico"` | `href="{{ site.baseurl }}public/favicon.ico"` |


Visit [Configuring Jekyll for Project GitHub Pages and for User GitHub Pages](http://downtothewire.io/2015/08/15/configuring-jekyll-for-user-and-project-github-pages/) if you want to know why these rules should be followed.

# Adding collapsible list for sidebar navigation

For collapsible categories we use the Bootstrap [Collapse](https://getbootstrap.com/docs/4.5/components/collapse/) component.

For instructions on adding or changing sidebar navigation, please see the [Navigation Author Guide](_data/navigation/NAVIGATION.md).

# Adding code samples to the site

Please see [this document](_code/EMBEDDING.md) for the instructions.

# Testing broken links

We use the [html-proofer](https://github.com/gjtorikian/html-proofer) tool to test broken links.
To start test locally you may be required to install the Gem of the tool first:

```bash
bundle install
```
... and then build the site:
 
```bash
jekyll build
``` 

After that, please use the following command:

```bash
./_script/proof-links
```

> We only log errors falling within the 4xx status code range. 
> Please note that links to GitHub are ignored by --http-status-ignore "429" command, because GitHub rejects the check
> coming from htmlproofer. Details of this are described in [this issue](https://github.com/gjtorikian/html-proofer/issues/226). 

Also, we have a GitHub Action which tests the links when the pull request is created to the `master`. 
Please see the [`.github/workflows/proof-links.yml`](.github/workflows/proof-links.yml) file for details.

# Adding email links

We use the [Jekyll Email Protect](https://github.com/vwochnik/jekyll-email-protect) to protect our 
email addresses from spam bots. We store all email variables in the `_data/support.yml` file.

### In HTML
```
<a href="mailto:{{ 'example@example.com' | encode_email }}">{{ 'example@example.com' | html_encode_email }}</a>
```

Or through a variable:
```
<a href="mailto:{{ site.data.support.email | encode_email }}">{{ site.data.support.email | html_encode_email }}</a>
```

The above code will yield:
```
<a href="%65%78%61%6D%70%6C%65@%65%78%61%6D%70%6C%65.%63%6F%6D">%65%78%61%6D%70%6C%65@%65%78%61%6D%70%6C%65.%63%6F%6D</a>
```

### In Markdown
In markdown files we cannot obfuscate the link text, so it would be safer to use something like `Contact us`.
```
[{{ Contact us }}](mailto:{{ site.data.support.email | encode_email }})
```

The above code will yield: 
```
<a href="%65%78%61%6D%70%6C%65@%65%78%61%6D%70%6C%65.%63%6F%6D">Contact us</a>
```

# Managing the “Prev”/“Next” buttons in the documentation

The “Prev”/“Next” buttons are generated automatically for all document pages. The generation is 
based on the [`doc_side_nav.yml`](_data/navigation/doc_side_nav.yml) navigation.

To customize the automatically added “Prev”/“Next” buttons, add the appropriate variables to 
the **front matter** block of the document page.

### To hide the “Previous” or “Next” button:

```
prev_btn: false
```

```
next_btn: false
```

### To customize the “Previous” or “Next” button name:
```
prev_btn: 
  page: Development Process Overview
```

```
next_btn: 
  page: Development Process Overview
```

### To customize the “Previous” or “Next” button name and URL:
```
prev_btn: 
  page: Development Process Overview
  url: /docs/introduction/
```

```
next_btn: 
  page: Architecture Overview
  url: /docs/introduction/architecture.html
```

**Related files:**
- `_includes/doc-next-prev-nav.html` - the navigation template with the automatic button generation;
- `_sass/modules/_doc-next-prev-nav.scss` - navigation styles;
- `_layouts/docs.html` - the documentation layout where the `doc-next-prev-nav` is included.

# Using a language switcher for source code samples

The switch state will be saved globally so that the user can navigate between pages.

### Usage

To show language tabs use the structure below.
Add a `lang` attribute with `Java`, `Kotlin`, `JavaScript` or any other language value 
for `div`s with content. If no language is provided, the content will not be displayed.
```
<div class="code-tabs">
    <div class="code-tab-content" lang="Java">
         Any Java content here
    </div>
    <div class="code-tab-content" lang="Kotlin">
         Any Kotlin content here
    </div>
    <div class="code-tab-content" lang="JavaScript">
         Any JavaScript content here
    </div>
</div>
```

In **markdown**, all tags should be left-aligned. This way, the blocks 
of code will not be broken:

```
<div class="code-tabs">
<div class="code-tab-content" lang="Java">
Any Java content here
</div>
<div class="code-tab-content" lang="Kotlin">
Any Kotlin content here
</div>
<div class="code-tab-content" lang="JavaScript">
Any JavaScript content here
</div>
</div>
```

If you don't need to display the tabs, but only need to show a specific paragraph of text 
or change the title depending on the language, just use this:
```
<div class="code-tab-content" lang="Java">
# Getting started with Spine in Java
</div>

<div class="code-tab-content" lang="Kotlin">
# Getting started with Spine in Kotlin
</div>
```

To change only some of the words in a sentence, use the `<span>` tag with the `.inline` class:
```
A minimal client-server application in
<span class="code-tab-content inline" lang="Java">Java</span>
<span class="code-tab-content inline" lang="Kotlin">Kotlin</span>
which handles one command to print some text...
```

**Related files:**
- `_sass/modules/_code-tabs.scss` - styles for the code tabs;
- `js/code-tabs.js` - code tab implementation.
