---
title: Chef, Stop Failing
author: arlimus
date: 2014-09-06
template: article.jade
---

Sometimes your Chef run fails. Even though you're greeted with bold red letters, you may still want the run to continue. Imagine, for example, bootstrapping nodes for the first time when no monitoring system is up yet. Or later on if monitoring fails. Your Chef run will break down due to missing components, even though you actually want it to complete, instead of failing halfway through.

<span class="more"></span>

<img src="error.png">

## Full control

In case this happens to a resource you control, you have the wonderful `ignore_failure` attribute to modify this behavior. Adding it to e.g. a service, will enable Chef to continue a run, even if this resource is failing.

```ruby
service "apache" do
  action :enable
  ignore_failure true
end
```

Sometimes, however, a failure may happen to a resource you don't control yourself. To me, this happened with the `sensu-chef` cookbook. This opens up 2 options for you to choose.


## #1 Modify a foreign cookbook

This is as simple as it gets: Clone/fork the repository of whatever cookbook you want to modify, alter the resource, and enjoy.

For the `sensu-chef` example, you can modify the `client_service` recipe to look something like this:

```ruby
sensu_service "sensu-client" do
  init_style node.sensu.init_style
  action [:enable, :start]
  ignore_failure true
end
```

(One more component is missing for sensu, which we will see at the end of article)

This approach is very legible and clear. Instead of forking the repository you could have also added a modified "vendor" copy to your repo. Whichever suits you best.

However, this approach also comes at a price. You now have to actively manage the repository and updates. This means monitoring upstream changes and merging them with your modification. Your patch also sits right inside these source files.

This isn't a bad thing, necessarily. In a productive environment you have to manage updates anyway.


## #2 Another way

In our case, we took a slightly different approach. We have chosen a test-based approach, where we pull in update regularly and verify them, instead of reviewing every modified line of code all the time. Once approved, updates are pushed to the production environment and deployed.

This approach works without altering the original source files or creating a clone. As you probably guessed, adding `ignore_failure` wasn't an option anymore. When you pull in a cookbook via `include_recipe` or your run list, you have no field to add this attribute to.

```ruby
# this will eventually include sensu::client_service
include_recipe "monitor::default"
```

So how can we prevent the following from happening?

```bash
  * sensu_service[sensu-client] action start
    * service[sensu-client] action start
      
      ================================================================================
      Error executing action `start` on resource 'service[sensu-client]'
      ================================================================================
      
      Mixlib::ShellOut::ShellCommandFailed
```

The solution is surprisingly simple: Just add the following line to the recipe

```ruby
resources('sensu_service[sensu-client]').ignore_failure(true)
```

The `resources` call is a shortcut to search for a resource within the run context:

```ruby
# http://rubydoc.info/gems/chef/11.4.4/Chef/Recipe#resources-instance_method
def resources(*args)
  run_context.resource_collection.find(*args)
end
```

As the argument, you can add the resource string you see in the error message. Here, I have chosen the parent resource `sensu_service[sensu-client]`.

As a small downside, this call will fail if the resource can't be found. Since we want to prevent failures, a better option is to add a library function instead:

```ruby
class Chef::Recipe
  def ignore_failure lookup
    res = resources(lookup)
    if res.nil?
      Chef::Log.warn("Can't find resource to ignore: #{lookup}")
    else
      Chef::Log.info("Ignore failure for resource: #{lookup}")
      res.ignore_failure(true)  
    end
  end
end
```

Which you can now use in your recipe:

```ruby
ignore_failure 'sensu_service[sensu-client]'
```

## Summary

Chef isolated your components into wonderful cookbooks and recipes. In some rare border cases, you may find yourself wishing to break this idyllic system and to alter some small behavior.

You have the option to either clone and modify the code directly, thus preserving each compartment, or change its behavior with a few calls from the outside. Both methods have their merits and much depends on the style you and and your team prefer to use.


## One more thing

There is some cases, where resources are dynamically created during the Chef run, after you have long issued your `ignore_failure` call. This usually happens inside a `ruby_block`, which is interpreted during resource execution. Your `ignore_failure` call happens too early in the run, for the resource to exist, and thus won't have any effect.

This is also true for my `service[sensu-client]` example. In this special case, the resource is created by a LWRP and later triggered by a ruby block, which you can easily hijack to alter its behavior.

The complete code block to stop both failures is:

```ruby
ignore_failure 'sensu_service[sensu-client]'

resources("ruby_block[sensu_service_trigger]").block do
  ignore_failure 'service[sensu-client]'
end
```