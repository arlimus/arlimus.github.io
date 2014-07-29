---
title: SSH and locked users
author: arlimus
date: 2014-07-28
template: article.jade
---

After the first release of [hardening for SSH](https://github.com/TelekomLabs/chef-ssh-hardening) I sometimes ran into the issue, where I suddenly couldn't log into an account anymore. Since hardening prohibits the use of passwords, the culprit isn't found immediately. The client's SSH key was authorized and there wasn't an obvious reason why he shouldn't be able to login.

<span class="more"></span>

A quick solutions that comes to mind after throwing this question at Google, is to set

    UsePAM yes

It works as advertised. But why?

If you look at `man sshd_config` it will tell you, that:

    UsePAM    Enables the Pluggable Authentication Module interface.
              If set to ``yes'' this will enable PAM authentication
              using ChallengeResponseAuthentication and
              PasswordAuthentication in addition to PAM account and
              session module processing for all authentication types.

Both of these authentication types are disabled by hardening, so `UsePAM` should remain off by default.

However, if you enable this setting, there is another implication that follows: By default the system will not allow entry to any "locked" user. Once `UsePAM` is enabled, even locked users can enter.

Initially this looks wrong. A locked user should not be "locked out of the system", right?

Not quite so. In `usermod` or `passwd` terms, user locking results in:

    Lock a user's password. This puts a '!' in front of the 
    encrypted password, effectively disabling the password. 

So in your `/etc/shadow`, you will see:

    myuser:!:16199:0:99999:7:::

The `!` in the password hash is something that cannot be reached with any password input, since the user's input is always hashed. In essence, a locked account is one that you cannot log into with a password. So it's not about disabling the account, as the man-page shows further down:

    Note: if you wish to lock the account (not only access
    with a password), you should also set the EXPIRE_DATE to 1. 

Locked accounts don't make much sense in the context of SSH with key-based login only. The obvious solution of `UsePAM` set to `yes` has the nice byproduct of interpreting locked accounts as 'disabled' instead of 'password-locked'.

For those that want to remain compliant without involving PAM in SSH, there's still a way to get users with impossible password-login without account locking. Essentially, replace the `!` in the password hash with any equivalent like `*`:

    myuser:*:16199:0:99999:7:::

In normal login terms, this account is not locked, while making any password input fail. SSH in the default hardening configuration will still allow users with valid keys to log into the account. This way may be longer, but keeps a few settings at their intended purpose without aiming for a simple byproduct. Though if you prefer PAM, you still have the option of enabling it.