---
title: Architecture 
headline: Documentation 
bodyclass: docs
layout: docs
customjs: /js/architecture-diagram.js
---
# Application Architecture

<div id="toc" class="toc hide-block"></div>
A Spine-based application consists of several Bounded Contexts. Client applications interact 
with the server-side via `CommandService`, `QueryService`, and `SubscriptionService`.

The diagram below shows <span id="display-all-components">all server-side components</span>
of a cloud application. When developing with Spine, you will be interacting
with only <em><span id="display-user-facing-components">some of them</span></em>, which
are not shaded on the diagram. The rest is handled by the framework.

<p>Click on a component to navigate to its definition from
the [Concepts](/docs/introduction/concepts.html) page.</p>

<div class="diagram-box">
{% include_relative diagrams/spine-architecture-diagram.svg %}

<p class="full-screen-link">
    <a href="{{site.baseurl}}/docs/introduction/diagrams/spine-architecture-diagram-full-screen.html">
        <i class="far fa-expand"></i>
        <span>View full screen</span>
    </a>
</p>
</div>

