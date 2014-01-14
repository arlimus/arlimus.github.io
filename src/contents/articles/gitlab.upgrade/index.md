---
title: Gitlab 2.8 to 6.4
author: arlimus
date: 2014-01.10
template: article.jade
---

We've been happily running Gitlab for more than a year now, even though it was unmanaged and never upgraded. A few weeks ago I got my hands on it and decide to give upgrading a shot. "Can't be that hard". Fast-forward 3 weeks: I'm in the middle of an 1 hour automated upgrade procedure which is taking gitlab from the stone age to the future.

<span class="more"></span>

How is it done? First off: Gitlab was running on a physical machine productively which I couldn't just take down without causing service downtimes. After all, it was Christmas, and that's not something you want to find in a giftbox. I switched to virtual machines which were easy to clone and back up.

# Blind copy

I wanted to see if I could recreate Gitlab 2.8 with all of my old data on a new box. It's certainly possible, but I soon realized it's not as easy as it looks. Copying all files and migrating MySQL data wasn't enough, as a persistent "500 Error" quickly told me. Since the goal isn't necessarily to upgrade Gitlab itself but only to get all the data into a new Gitlab, I decided to go a different route.

# Bootstrapping Gitlab 6.4

Instead of recreating Gitlab 2.8, I went for the version I wanted to end up with: Gitlab 6.4. I used [knife-solo](https://github.com/matschaffer/knife-solo) for deployment and the [gitlab cookbook](https://github.com/ogom/cookbook-gitlab). Simply whip up a kitchen:

```bash
knife solo init .
```

and configure gitlab for the destination node. It's well described in the [readme](https://github.com/ogom/cookbook-gitlab/blob/master/README.md#usage). After all is done, deployment was easy:

```bash
knife solo prepare git.mydomain.com
knife solo cook git.mydomain.com --no-chef-check
```

# Harsh upgrade

So the 'only' issue was getting all data into shape. The brute-force way of doing this is taking all data, throwing it into Gitlab 6.4 and pressing the migrate button.

Collecting old data was easy:

```bash
# get all mysql data
mysqldump -uUSER -pPASS gitlabhq_production | gzip > gitlab.sql-dump.gz

# get all repositories and keys
tar czf gitlab.repo-dump.tar.gz /home/git/repositories /home/git/.ssh/authorized_keys
```

So was extracting it on the new machine:

```bash
# extract the repositories
cd /
tar xf /root/gitlab.repo-dump.tar.gz

# inject the old db
# 1. create the structure in mysql
# 2. inject the data
echo "create database gitlabhq_production;" | mysql -u root -p$MYSQL_PW
gunzip < /root/gitlab.sql-dump.gz | mysql -u root -p$MYSQL_PW gitlabhq_production
```

Now, how about about a DB migration?

```bash
bundle exec rake db:migrate RAILS_ENV=production
```

Errors, as expected. After straightening out some migration sections, the core ran through, but I was greeted with the familiar "500 Error" again.

# Chain of fools

Remember the [chain of fools](http://www.youtube.com/watch?v=vPnehDhGa14)? Upgrading Windows from caveman to to the modern-age pain in the rear we know so well? Great stuff, let's try that.

Gitlab comes with [great update instructions](https://github.com/gitlabhq/gitlabhq/tree/master/doc/update). Since we already have the latest version, we only have to worry about whatever transforms data and ignore everything that transforms Gitlab itself.

The basic steps boil down to:

```bash
git reset --hard HEAD
git checkout -t origin/XXX-stable
bundle install
... do upgrade ...
```

After some cutting, the versions I ended up stepping through were: 3.1, 4.0, 4.1, 4.2, 5.0, 5.1, 5.4, 6.0, 6.2, and finally 6.4. It doesn't just run through, however, it requries some work. 

The final script is found [here](https://gist.github.com/arlimus/8365108). The adjustments required are:

* Older Gitlab versions need Ruby 1.9, newer need Ruby 2.0; Ruby must be adjusted during migration
* Gitlab 3.1 (and older) need a configuration file to run migrations; so mock one up on the fly
* Gitlab 6.0 transforms repos into a new structure; since we don't have it running live, it will fail when trying to update the project. However, if we rescue this step, it will still correctly migrate files on the system. So a tiny patch is introduced to accomplish this.

Additionally, even after a successful migration, I still ended up with errors. As it turns out, we were already having database inconsistencies in our old gitlab after some users were deleted. 

So in addition to all these steps, I had to fix the database as well. First I had to upgrade projects whose user doesn't exist anymore to have an owner:

```mysql
# find all projects without a valid owner
select P.id from projects P left join users U on P.owner_id = U.id where U.id is null;

# set their owner to a valid id
update projects set owner_id = "1" where id = "...";
```

Without this step these repos would not have been migrated into namespaces and thus would not have been available in new gitlab.

Also, update all projects' users to not include anyone who doesn't exist anymore:

```mysql
# find all users assigned to projects that don't exist anymore
select P.id from users_projects P left join users U on P.user_id = U.id where U.id is null

# remove these users
delete from users_projects where id = "...";
```


# Results

The final script ran for 20min backup and 30min migration. It didn't require and intervention. We found one more bug in the deployment keys after all was done, which required a quick manual fix. All in all, very successful! Thanks to everyone working on Gitlab for making this possible :)

<a href="https://gist.github.com/arlimus/8365108"><img id="gist-ribbon" src="/css/gistbanner.png" alt="Gist on GitHub"></a>