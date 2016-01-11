---
layout: docs
title: IntelliJ IDEA Configuration
---

<h1 class="page-header">Configure .proto File Type</h1>

You can create custom file types to enable parsing these files in the editor by defining highlighting schemes for keywords, comments, numbers, etc.
To enable IntelliJ IDEA to decide how to treat a .proto file, you need to:

1. Download a <a href="https://github.com/SpineEventEngine/core-java/blob/master/.idea/filetypes/Google%20Protobuf.xml">configuration file</a>.
2. Move it to IntelliJ IDEA <a href="https://www.jetbrains.com/idea/help/directories-used-by-intellij-idea-to-store-settings-caches-plugins-and-logs.html">config directory</a> and restart the IDE.

For Windows:

<pre>
<SYSTEM DRIVE>\Users\<USER ACCOUNT NAME>\.<PRODUCT><VERSION>\config\filetypes
</pre>

For Mac OS X:
<pre>
~/Library/Preferences/<PRODUCT><VERSION>/filetypes
</pre>

For Linux and the Other UNIX Systems:
<pre>
~/.<PRODUCT><VERSION>/config/filetypes
</pre>
Where PRODUCT is IntelliJIdea or IdeaIC, VERSION is IntelliJ IDEA version (14, 15, etc).


