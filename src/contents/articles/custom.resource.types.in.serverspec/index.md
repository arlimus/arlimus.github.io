---
title: Custom Resource Types in Serverspec
author: arlimus
date: 2014-08-30
template: article.jade
---

[Serverspec](http://serverspec.org) comes ready to go with many useful [resource types](http://serverspec.org/resource_types.html). Sometimes, however, you may find yourself in a situation, where you need something special. Let's see how it's done.

<span class="more"></span>

## Not enough

This happened to me while initially writing tests for [Nginx hardening](https://github.com/TelekomLabs/tests-nginx-hardening). For all configuration checks, these tests looked for values inside `/etc/nginx/nginx.conf`:

```ruby
describe file( nginx_conf ) do
  its(:content) { should match(/^\s*server_tokens off;$/) }
end

...
```

With that out of the way, I started the implementation in Chef. Since hardening is designed as an overlay on top of existing cookbooks, we chose `miketheman/nginx` as the base provider.

This led to a crucial discovery: Some values were configured inside `nginx.conf`, while others were just not available (as seen in the [template](https://github.com/miketheman/nginx/blob/master/templates/default/nginx.conf.erb)). 

For Nginx, an easy and clean solution is to create a configuration file inside `conf.d` and add all remaining values there. This leads to a split in configuration parameters between both configuration files, which must be reflected serverspec.

Some tests now didn't target `nginx.conf` anymore, but the hardening configuration `conf.d/90.hardening.conf`:

```ruby
describe file( hardening_conf ) do
  its(:content) { should match(/^\s*more_clear_headers 'Server';$/) }
end
```

The obvious issue with this decision popped up during the implementation in Puppet. Here, a different provider for nginx was used: `jfryman/nginx`. Its `nginx.conf` had other values configured than the Chef equivalent (as seen in the [template](https://github.com/jfryman/puppet-nginx/blob/master/templates/conf.d/nginx.conf.erb)). Unfortunately, the serverspec tests were expecting parameters in `nginx.conf`, that had now moved to `conf.d`. There was no way to check both with the same set of tests anymore.

The ideal solution would have been to move all configuration values to the custom configuration file in `conf.d`. However, this would have broken the overlay design. A user may still configure a parameter that ends up in both `nginx.conf` and `conf.d`.

## Extending Serverspec

I needed a resource provider, that could check nginx configuration in multiple files at once:

```ruby
conf_paths = [ nginx_conf, hardening_conf ]

describe multi_file( conf_paths )
  its(:content) { should match(/^\s*more_clear_headers 'Server';$/) }
end
```

First, add a new file for the provider. Your directory structure may look like this:

```
.
└── serverspec
    ├── nginx_spec.rb
    ├── spec_helper.rb
    └── type
        └── multi_file.rb
```

The type provider extends `Serverspec::Type` by adding a method `multi_file`. This is the method you call when writing your tests. Additionally, we create a class that holds the object which is tested. This class includes methods that expose values for matchers (e.g. `:content`) and must be extended from `Serverspec::Type::Base`.

```ruby
module Serverspec
  module Type
     
    class MultiFile < Base
  
      def initialize(paths)
        @paths = paths
      end
     
      def content
        @paths.map{|x| @runner.get_file_content(x) }.join("\n")
      end

    end

    def multi_file(paths)
      MultiFile.new(paths)
    end
  end
end

include Serverspec::Type
```

Additionally, you can create endpoints for checks like:

```ruby
describe multi_file( conf_paths )
  it { should be_valid }
end
```

Simply add a method `valid?` to your object:

```ruby
    class MultiFile < Base

      ...

      def valid?
        # check if the files are valid
      end

    end
```

A great source of inspiration is serverspec's own [collection of types](https://github.com/serverspec/serverspec/tree/master/lib/serverspec/type).

Finally, don't forget to include this file, preferably in your `spec_helper.rb`:

```ruby
...

# additional requirements
require 'type/multi_file'
```

Now, `:content` provides the content of all files combined. Using the existing matchers, it's easy to write the tests.

# Final thoughts

Our serverspec tests in the hardening project are not limited to just verifying Chef and Puppet runs. We also want them to check if a system has a valid configuration (compliance checks). Without custom resource types, this is not possible, as you sometimes cannot expect a system to be configured in a certain way. This includes configurations for Apache, MySQL, or even Sysctl, which all feature a directory structure where additional configuration files are applied.

It's important to remember what these resource types provide, and what they don't cover. Stick to rspec and [serverspec matchers](https://github.com/serverspec/serverspec/tree/master/lib/serverspec/matchers) for checking values themselves. Use resource types to get your values exposed to these matchers.

Happy testing!