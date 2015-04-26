---
title: Future of Hardening Framework
author: arlimus
date: 2015-01-04
template: article.jade
---

Over the past year, we have had a great time developing and establishing the [open source hardening framework](http://hardening.io/) within our company and outside. It has been a fantastic start and we are grateful to everyone who helped us get this off the ground.

However, to me, it is even more exciting to look forward at the potential this project holds. It is something we were so far only able to hint at.

Specifically, there are two key features missing, which could help this project tremendously: An user-interface and customization.

## UI

The user-experience so far has been limited to developers and operators who are familiar with automation software like Chef and Puppet. During day-to-day operations work we noticed, that we wanted more feedback on the state of our environment. Sure, we are routinely running the hardening automation on our systems, making sure everything is in a predetermined state. But without manually extracting information from automation logs or running the framework's compliance check on nodes explicitly, we usually didn't get much insights.

These insights are incredibly interesting to both DevOps and management alike. Imagine a continuous list of compliance checks which verify your server hardening before each update. Now add the possibility of analytics with custom metrics and reports. It is easy to see, how this helps you illustrate the present and past state of your environment's hardening and compliance levels.

Once you start considering this combination, it quickly becomes clear, that you need a place to cover all these points. To combine both configuration and tests, the obvious solution is to have a nice web-interface, which contains everything from analytics to settings. 

## Customization

The current design of the hardening framework is a rather old one with the focus to solve a set of problems for just one company (essentially). It is important to take the next step and extend its configuration options considerably.

To me, Puppet has been more difficult in this regard than Chef, since our approach supports an older way of configuring your puppet modules. We have found a better way of handling this, which we will hopefully be able to introduce to this framework.

Additionally, there is more documentation needed on how each configuration option behaves and how best to approach them. Moreover, we also require some simplifications, since not all options are well-understood and shouldn't be overwritten manually with only limited background

## Next steps

This project has been a breeze to work at and we are heading in the great direction with it. With some internals still before us, we are looking forward to 2015 and the potential it holds.
