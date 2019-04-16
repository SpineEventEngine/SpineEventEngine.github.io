This repository contains the code of [Spine Event Engine framework site](https://spine.io).

The website uses [Jekyll](https://jekyllrb.com/) templates and is 
hosted on [GitHub Pages](https://pages.github.com/). 

If you plan to work with the code of examples please make sure
to read [these instructions](EXAMPLES.md).

## Running the Site on the Local Server

To build and launch the site on the local server:
```
$ bundle exec jekyll serve
```

## Using URLs in Markdown

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

## Adding collapsible list for sidebar navigation

For collapsible categories we use [Bootstrap](https://getbootstrap.com/docs/3.3/javascript/#collapse) JS component.

To add a collapsible category use the following code:
```
<h6 class="doc-side-nav-title no-anchor collapsed" data-toggle="collapse" data-target="#collapseCategoryName" aria-expanded="false" aria-controls="collapseCategoryName">CategoryName</h6>
<ul class="collapse" id="collapseConcepts">
    <li class="doc-side-nav-list-item"><a href="{{ site.baseurl }}/docs/guides/concepts/some-link-1.html" {% if current[3] == 'some-link-1.html' %}class='current'{% endif %}>Some link name 1</a></li>
    <li class="doc-side-nav-list-item"><a href="{{ site.baseurl }}/docs/guides/concepts/some-link-2.html" {% if current[3] == 'some-link-2.html' %}class='current'{% endif %}>Some link name 2</a></li>
    <li class="doc-side-nav-list-item"><a href="{{ site.baseurl }}/docs/guides/concepts/some-link-3.html" {% if current[3] == 'some-link-3.html' %}class='current'{% endif %}>Some link name 3</a></li>
    <li class="doc-side-nav-list-item"><a href="{{ site.baseurl }}/docs/guides/concepts/some-link-4.html" {% if current[3] == 'some-link-4.html' %}class='current'{% endif %}>Some link name 4</a></li>
    <li class="doc-side-nav-list-item"><a href="{{ site.baseurl }}/docs/guides/concepts/some-link-5.html" {% if current[3] == 'some-link-5.html' %}class='current'{% endif %}>Some link name 5</a></li>
</ul>
```
