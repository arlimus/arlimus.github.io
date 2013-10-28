---
title: Wintersmith setup
author: arlimus
date: 2013-10-28
template: article.jade
---

There are some excellent tutorials for setting up Wintersmith out there. This is a summary for a quick and easy setup with Github Pages.

<span class="more"></span>

<div>
  <label>Enter your GitHub username:</label>
  <input type="text" ng-model="username" placeholder="username" />
</div>

**Steps**

1. Create a GitHub repo for your user. As the name, type in: `{{username || 'username'}}.github.io`.

2. Clone this repo to your local folder

        git clone git@github.com:{{username || 'username'}}/{{username || 'username'}}.github.io.git ~/blog
        cd ~/blog

3. Install wintersmith

        npm install wintersmith -g

4. Create your blog in folder `src/`

        wintersmith new src/

5. Make sure GitHub doesn't treat is as a Jekyll project and ignore node modules:

        touch .nojekyll
        echo "node_modules" > .gitignore

6. Edit the start of `src/config.json`:

        {
          "output": "./../",
          "locals": {
            "url": "http://{{username || 'username'}}.github.io",
            "name": "Wintersmith meets {{username || 'username'}}"
            "owner": "{{username || 'username'}}"
            "description": "This is the blog of {{username || 'username'}}"
            //..

7. Write articles, change templates, do whatever you like to it. To preview in [localhost:8080](http://localhost:8080):

        cd src/
        wintersmith preview

8. Once you are done, you can build it and push it online

        cd src/
        wintersmith build

        git add ../.
        git commit -m "finished setup for first blog release"
        git push -u origin master

It may take GitHub a bit to update your page, but once it's done you can visit it at <a href="http://{{username || 'username'}}.github.io"><code>http://{{username || 'username'}}.github.io</code></a>


