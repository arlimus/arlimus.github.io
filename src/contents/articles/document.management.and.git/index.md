---
title: Document management and Git
author: arlimus
date: 2014-08-17
template: article.jade
---

"Where do you store your documentation?" When you get this question during a security audit, you better have an answer that is centralized, failure-resistant, backup-ready, fully versioned and (as a bonus) manipulation resistant.

If you're at a big company, you will find some shiny, ancient system, that handles these tasks. But if you're at a startup, you usually neither care nor want such a behemoth.

At <a href="https://sessionbird.com" target="_blank">Sessionbird</a>, we initially started pushing everything into OwnCloud. Recently, however, we moved our core documentation to Git.

<span class="more"></span>

## What is Markdown?

You can make a quick jump to git if you download all your old `doc`, `odt`, and what-not files, put them into a new folder, and run `git init`. It's possible, but in the long run, you will most likely accumulate so much binary data, that your repository will grow and become too large. Downloading 100+Mb to get to one important file is no fun. In this case, stick to conventional solutions (like OwnCloud in our case).

We quickly decided to switch to markdown, in order to have a very simple syntax where people can focus more on "what they write" instead of "how it looks".

With this decision, we needed to recreate our documentation from the ground up. Surprisingly, it took less than a day to get it done, since most of our documents were "conversion-friendly".

Making everyone agree on markdown, on the other hand, wasn't as easy as I had initially though. After all, not everyone at your business is necessarily a programmer.

## Markdown != markdown

If you stick with the basics, markdown is great. If you start expanding - even slightly - it gets hairy. I have seen everything from LaTeX to JavaScript and HTML inside a simple `.md` file. Which is fine, if you can all agree on how you're handling your markdown.

Whatever method you use to convert your files will dictate what you can and cannot do. It starts with how tables are formatted and ends with embedding TeX or HTML.

In our case, we use [any2pdf](https://github.com/arlimus/any2pdf), which is a small wrapper around [pandoc](http://johnmacfarlane.net/pandoc/) to get things done. We take the route via HTML because (1) we want our documents to be available in both HTML and PDF and look equally well and (2) it looks better at syntax highlighting and embedding.

As an added bonus, our web-designers can help beautify our document templates. Thanks to docker, the whole process works on everybody's laptop.

## Metadata

If you use Pandoc, metadata is your friend. This is how a typical document starts:

```
---
title: Document Title
author: Sessionbird GmbH, YOUR NAME
copyright: ...
---
```

But that's not all. During an audit, you will always be asked about how you manage your documentation versions. We were tired of maintaining a version indicator (and date) in each file and instead moved the task to the git repository.

Whenever a document is created, you automatically add the latest tag, the commit-ID, and the last commit date to the titlepage. In the background, each markdown file is expanded to look like this:

```
---
title: Document Title
author: Sessionbird GmbH, NAME
copyright: ...
git_tag: v1.0
git_commit: abcdeff
git_date: 2014-08-17
---
```

Finally there's no more mistakes with incorrect dates or version stamps. There is also no lying: Whatever you have in git is what you get.

## Advantages of Git

Which gets us back to the security audit. And this is where this solution on git really shines:

* Q: **Where do you keep your documents?**

    We have a centralized repository where all documents are located. It is highly available and secure, with every user having his/her own login.

* Q: **What if it fails?**

    No problem, we run regular backups on all our repositories (which is increadible simple: `git clone`). Additionally, many people have documentation repos on their machines, so even if the backup (and backup-backup) fails, you will find a common (sufficiently recent) state easily.

* Q: **How do you track changes?**

    Natural in git: All changes are tracked with owner and timestamp. Using markdown we also get nice changelogs as a bonus.

* Q: **What about manipulation?**

    If you want to add a commit into the repository, you have to have permissions to write to the repo. Not everyone can merge, so the damage is limited. Of those that can merge, we have a little step-by-step review before releasing a new version.

    If someone tries to change any old commit, he will have a hard time. Since commit-hashes are based on each other, any change to an old commit will automatically create new hashes for all subsequent commits. Something like this is always noticeable.

    It may not be perfect from a security standpoint, but it's a great system nonetheless which works as advertised.

What we noticed the most, was the change in our documentation habits and workflow. We still tend to add a lot of schematics and illustrations, but we are much more focused on the content than we are on formatting everything. It also work on every device with only the bare minimum of knowledge required. Tools like Sublime, however, are a huge bonus, especially when it comes to auto-formatting tables.

As for our workflow, we started to adopt a "write and review"-process, i.e. the "code and pull-request"-workflow many of us know and love. It certainly helped improve our quality and add new ideas.