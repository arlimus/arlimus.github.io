---
title: Styling Jenkins
author: arlimus
date: 2013-10-24
template: article.jade
---

<a href="https://github.com/arlimus/jenkins-style"><img id="fork-me-ribbon" src="https://s3.amazonaws.com/github/ribbons/forkme_right_darkblue_121621.png" alt="Fork me on GitHub"></a>

Jenkins has a nice theming plugin available. To use it you need to set up a stylesheet that is accessible to everyone user. I created a few themes found [here](https://github.com/arlimus/jenkins-style).

<span class="more"></span>

The themes are found on github and hosted via github pages. They can easily be used in jenkins by copying the css of the theme you like into the configuration of the Simple Theme Plugin for Jenkins.

I have create a theme for my company's Jenkins:

<img src="magenta.jenkins.png" style="max-width: 174px; margin-left: auto; margin-right: auto;" />

Link to the css:

```
http://arlimus.github.io/jenkins-style/telekom.css
```

The source is written in SASS and can be found [here](https://github.com/arlimus/jenkins-style/blob/master/css/telekom.scss).