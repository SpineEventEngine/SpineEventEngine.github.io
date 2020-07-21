This repository contains the code of [Spine Event Engine framework site](https://spine.io).

The website uses [Jekyll](https://jekyllrb.com/) templates and is 
hosted on [GitHub Pages](https://pages.github.com/). 

## Running the Site on the Local Server

To build and launch the site on the local server:
```
bundle exec jekyll serve
```
You may be required to install Gems first:
```
bundle install
```
If you experience issues with this step, please check out the [troubleshooting guide](TROUBLESHOOTING.md).

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

### Adding code examples

We use the [code-excerpter](https://github.com/chalin/code_excerpter) tool for adding the source
code to Markdown pages. See [this doc](_samples/README.md) for the instructions.

### Testing broken links

We use the [html-proofer](https://github.com/gjtorikian/html-proofer) tool to test broken links.
To start test locally you may be required to install tool Gem first:
`bundle install` and build site `jekyll build`. After that use `htmlproofer --assume-extension ./_site --only_4xx --http-status-ignore "429"` command.
* 429 http statuses ignored because of wrong error logging described in [this](https://github.com/gjtorikian/html-proofer/issues/226) issue.
* `--only_4xx` parameter used to prevent incorrect links checks. As described in the [tool documentation](https://github.com/gjtorikian/html-proofer#configuration) it have to reports errors only for links that fall within the 4xx status code range.

Also, we have the `Links check` GitHub Action for this test. It will start on push to the repository.
