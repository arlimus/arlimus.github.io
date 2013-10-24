---
title: Styling Jenkins
author: arlimus
date: 2013-10-24
template: article.jade
---

Jenkins comes with a nice theming plugin. To use it you need to set up a stylesheet that is accessible to everyone who uses jenkins.

<span class="more"></span>

The plugin will only insert

```html
<link rel="stylesheet" type="text/css" href="..." />
```

into the page the client receives. 


Like many others I decided to use github to serve a CSS file. Unfortunately you can't just use gists or raw blobs to serve your css, since the mime-time will be `text/plain` instead of `text/css`. Your browser will ignore it. The solution is to set up a [github page](http://pages.github.com/) to serve your css.

I have create a theme for my company's Jenkins:

<img src="magenta.jenkins.png" style="max-width: 174px; margin-left: auto; margin-right: auto;" />