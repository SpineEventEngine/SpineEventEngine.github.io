---
title: Concepts 
headline: Concepts 
bodyclass: docs
layout: docs
type: markdown
sidenav: doc-side-concepts-nav.html
---
<h2 class="top">Architecture Overview</h2>
<div id="toc" class="toc hide-block"></div>
This section introduces key concepts of Spine framework and its parts, helps you get a deeper understanding of how it works and provides some usage notes. 
<p class="note">We assume that you are familiar with the basics of Domain-Driven Design.</p> 

Below is an overall view of <span id="display-all-components">all Spine server components</span> and their relations. When developing with Spine, you will be interacting with <span id="display-user-facing-components">some of them</span>.

<p>Select a component to navigate to its definition.</p>

<script src="/js/architecture-diagram.js" type="text/javascript" charset="utf-8"></script>

{% include_relative diagrams/spine-architecture-diagram.svg %}

<a href="#" data-toggle="modal" data-target="#openSpineArchitectureDiagram">Open full-width</a>

{% capture includeGuts %}
{% include_relative diagrams/modal-full-width.html %}
{% endcapture %}
{{ includeGuts | replace: '    ', ''}}


