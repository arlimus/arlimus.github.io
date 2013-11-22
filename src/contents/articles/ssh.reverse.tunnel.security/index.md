---
title: Securing reverse SSH tunnels
author: arlimus
date: 2013-11-05
template: article.jade
---

SSH reverse tunnels are a quick way to expose client services on a server, if you want to control access to this service without additional firewall rules. In cloud scenarios it's especially difficult to configure firewalls without reverting to DNS names, since IP addresses may change at any time. But there are some hidden traps when using reverse tunnels that you may not be aware of.

<span class="more"></span>

Let's start with a simple usage example where one client wants to expose a local service to a server:

    client1> ssh -T -N -R 8001:localhost:80 server

<img src="1.jpeg" style="width: 100%; max-width: 1435px; margin-left: auto; margin-right: auto;" />

As you can see, the server can now access the client's service on port 8001.

We used this trick for clients that have simple service APIs that only few servers should be able to reach. While we could have gone the route of configuring static IP addresses or overarching DNS names for all of these clients and securing it with firewall rules, we instead went with reverse tunnels. Now every client can control the access to his service, by creating a secure (and verified) connection to the server.

Let's add another client:

    client2> ssh -T -N -R 8002:localhost:80 server

<img src="2.jpeg" style="width: 100%; max-width: 1435px; margin-left: auto; margin-right: auto;" />

Now, let's say that `client1` belongs to one customer and `client2` to another. What looks like directional pipes going from these clients to the central hub is by default actually a two-way road. That means, that without adjustments, you can potentially do this:

    client2> ssh -T -N -L 81:localhost:8001 server

<img src="3.jpeg" style="width: 100%; max-width: 1435px; margin-left: auto; margin-right: auto;" />

This may not be something you want, especially with backend systems. Many of these APIs aren't hardened and offer a nice way to jump from one tenant or client to another, once you get an entry point. In a cloud scenario this is a disaster waiting to happen.

Alas, there are a few ways to get around this issue.

First, if you have OpenSSH at version [6.2](http://www.openssh.com/txt/release-6.2) or above you can add this configuration to your `sshd_config` on the server:

    GatewayPorts no
    AllowTcpForwarding remote

This means that you can still create reverse tunnels to localhost, but forwarding tunnels can only be created to remote ports:

<img src="4.jpeg" style="width: 100%; max-width: 1435px; margin-left: auto; margin-right: auto;" />

If you want to play around with this configuration, have a look at this [Vagrantfile](https://gist.github.com/arlimus/7592670).

Another option, which also works with older versions of OpenSSH, is to use whitelisting in the `.ssh/authorized_keys`:

    permitopen="255.255.255.255:9" ssh-rsa AAAAB3Nza.... user@client2

This will prevent clients from opening forwarding ports to any address except the one specified. For clarification: `255.255.255.255` is officially reserved for future use and [port 9](http://en.wikipedia.org/wiki/Discard_Protocol) is a fancy way of saying _"discard my input"_. Kudos to Kurt Huwig for the whitelisting idea.
