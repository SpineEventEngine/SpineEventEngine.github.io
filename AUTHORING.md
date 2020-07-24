Content Author Guide
========
This document is a guide for adding content to the [spine.io](https://spine.io) site.

**Table of Contents** 
- [Using URLs in Markdown](#using-urls-in-markdown)
    + [Links to Blog Posts](#links-to-blog-posts)
      - [Rule 1 -- Always concatenate Jekyll and Liquid tags](#rule-1----always-concatenate-jekyll-and-liquid-tags)
      - [Rule 2 -- *(Almost)* Always start links with `{{ site.baseurl }}`](#rule-2------almost---always-start-links-with-----sitebaseurl----)
      - [Rule 3 -- Always use a trailing slash after `{{ site.baseurl }}`](#rule-3----always-use-a-trailing-slash-after-----sitebaseurl----)
- [Adding collapsible list for sidebar navigation](#adding-collapsible-list-for-sidebar-navigation)
- [Adding code samples to the site](#adding-code-samples-to-the-site)
- [Testing broken links](#testing-broken-links)

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

For collapsible categories we use the Bootstrap [Collapse](https://getbootstrap.com/docs/4.0/components/collapse/) component.

For instructions on adding or changing sidebar navigation, please see the [Navigation Author Guide](_data/navigation/NAVIGATION.md).

# Adding code samples to the site

Please see [this document](_code/README.md) for the instructions.

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

