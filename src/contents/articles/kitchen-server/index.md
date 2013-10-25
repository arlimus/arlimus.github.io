---
title: A kitchen for your server
author: arlimus
date: 2013-10-26
template: article.jade
---

I have a few bare servers lying around, pre-installed with Ubuntu, not integrated in any chef/puppte/saltstack workflow, with a lot of power ready to go. They are a perfect place for some labour-intensive vagrant boxes, which have recently been eating up my SSD. Due to the lack of bootstrap, I have found myself installing and configuring the same components one too many times.

At this point I decided to revisit [knife solo](https://github.com/matschaffer/knife-solo) and take it out for a spin.<span class="more"></span> The result is [kitchen-server](https://github.com/arlimus/kitchen-server), an easy way to configure a server and make it your second home away from home.

The only requirement to get started is [knife-solo](https://github.com/matschaffer/knife-solo).

```bash
gem install knife-solo
```

Let's say my server is running at `192.168.200.204`. I have the user `ubuntu` preconfigured and ready to go (with ssh key on server or. The basic setup is as easy as:

```bash
git clone https://github.com/arlimus/kitchen-server
cd kitchen-server

./setup.sh ubuntu@192.168.200.204

ssh knife@192.168.200.204
```

I tend to use the extended version, to have zsh and git configured:

```bash
./setup.sh ubuntu@192.168.200.204 ext

ssh katana@192.168.200.204
```

The kitchen itself is simply a configuration stack on top of many great cookbooks out there. The default configuration will get you started with vagrant quickly and easily. Feel free to fork and edit it as you like.

<a href="https://github.com/arlimus/kitchen-server"><img id="fork-me-ribbon" src="https://s3.amazonaws.com/github/ribbons/forkme_right_darkblue_121621.png" alt="Fork me on GitHub"></a>
