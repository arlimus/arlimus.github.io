---
title: Ready for ES6?
author: arlimus
date: 2015.02.11
template: article.jade
---

We have lately seen some great articles on using ES6 features with projects like [6to5](https://6to5.org) and [traceur](https://github.com/google/traceur-compiler). So are we ready to switch? Let's take a look.

<span class="more"></span>

## Transpilers

Taking any mainstream browser in its most current release, we get about half of the features ES6 specifies (as seen [here](http://kangax.github.io/compat-table/es6/)). This is only true for desktop browsers (not counting IE). Mobile browsers are lacking behind further.

All of this is no surprise. ES6, or ES2015 as it is sometimes called, has not been released yet. It should be ready by the middle of this year. Even then, there will be a transitional phase, where users are upgrading their browsers to support ES6. We have seen this before and we'll be ready with ES6-shims to bridge this period.

But can we start switching our code-base today? Transpilers like [6to5](https://6to5.org) and [traceur](https://github.com/google/traceur-compiler) are great ways to give us the power of ES6 right now, with great coverage and translation to ES5 code.

## Ready for ES6

I was curious to give ES6 a try for a few smaller projects and see if we can introduce it at [Sessionbird](https://sessionbird.com). I choose [6to5](https://6to5.org) for translation and added it to my Grunt workflow:

    npm install --save-dev grunt-6to5

With a little configuration in `Gruntfile.js`:

    '6to5': {
        options: {
            sourceMap: true
        },
        dist: {
            files: [{
                expand: true,
                cwd: 'js/',
                src: ['**/*.js'],
                dest: '<%= yeoman.app %>/scripts/',
            }]
        }
    },

I was ready to start refactoring some code for ES6. A great resource of available features is [here](https://6to5.org/docs/learn-es6/). I was excited about arrows, template strings, iterators, promises and modules. It all worked as expected.

However, to wrap up my typical workflow, I wanted a helper for quality control on my code style. This is where it gets complicated. We have been using `jshint` for this task, but the current lack in support for ES6 made me switch to `eslint` instead. If you use their current development branch, you can get a preview for ES6:

    npm install -g eslint@es6jsx

It already works reasonably well, but you will have to create your own Grunt task to make it work with this release. Also, it's still a moving target, so expect some bugs and strange errors.

## Should I switch?

After a few hours of experimentation, I was seriously asking myself, if I should switch right now, or wait a bit longer. On the list of downsides I added the preview eslint support and adding custom build tasks, which I don't want to maintain. As for the list of advantages: Is there any killer feature that would push me towards ES6 right now?

```javascript
var odds = evens.map(v => v + 1);
```

Let's take a look at list again. There is [arrows](https://6to5.org/docs/learn-es6/#arrows), which looks similar to CoffeeScript function definitions. I have always like this clear style of function definition, but with ES6 it comes with and interesting twist. Since the meaning of `this` is changed in the function body, it quickly broke a few code pieces I tried to refactor, leaving me with the lesson, that these "arrows" are not simply a style change.

```javascript
class Dog extends Cat {
  constructor(strangeness) { ... }
```

[Classes](https://6to5.org/docs/learn-es6/#classes) are another feature I remember well from CoffeeScript, but not one I'd miss terribly. I have gotten used to the way JavaScript handles object creation and have never felt like I was missing classes. 

```javascript
var s = `Dog eats ${insertBone}
         in multiple
         lines`
```

[Template strings](https://6to5.org/docs/learn-es6/#template-strings) is indeed high up on my list, as string interpolation is something I've been used to in both CoffeeScript and Ruby. On the other hand, Go and Scala have taught me to stop whining and just write it explicitly. The bigger advantage here is support of multi-line strings, which is a potential big plus. Then again, the problem doesn't come up too often to warrant the argument.

```javascript
// Declare in outside scope
let x;
{
  // OK, new in block scope
  const x = "sneaky";
  // Not possible:
  x = "can't do this";
}
// Already declared x, error
let x = "not again";
```

[Let and const](https://6to5.org/docs/learn-es6/#let-const) are two constructs which I'm truly excited about. However, their scoping enhancement is [not yet supported by 6to5](http://es6rocks.com/2015/01/temporal-dead-zone-tdz-demystified/), which crosses it off my list for now.

[Comprehensions](https://6to5.org/docs/learn-es6/#comprehensions) are great, as seen in the example:

    var results = [
      for(c of customers)
        if (c.city == "Seattle")
          { name: c.name, age: c.age }
    ]

But can be reached similarly with lodash:

    var results = _.filter(customers, {city: "Seattle"})
      .map(function(c){
        return { name: c.name, age: c.age }
      })

Admittedly, the comprehension is a bit more readable.

[Modules](https://6to5.org/docs/learn-es6/#modules) are great to finally make it into the core, but we have built our ways around it successfully (AMD, CommonJS).

The updated [object, string, number and math APIs](https://6to5.org/docs/learn-es6/#math-number-string-object-apis) are also welcome additions. So are [tail calls](https://6to5.org/docs/learn-es6/#tail-calls) and the [reflect API](https://6to5.org/docs/learn-es6/#reflect-api).

Then there is the list of "nice to have"s: [Enhanced object literals](https://6to5.org/docs/learn-es6/#enhanced-object-literals), [destructing](https://6to5.org/docs/learn-es6/#destructuring), [defaults, rest and spread](https://6to5.org/docs/learn-es6/#default-rest-spread), [unicode](https://6to5.org/docs/learn-es6/#unicode), [maps and sets](https://6to5.org/docs/learn-es6/#map-set-weak-map-weak-set).

```javascript
return getDog().then( (dog) => {
  return dog.goFetch()
})
```

Finally, we have native [promises](https://6to5.org/docs/learn-es6/#promises). I was actually most excited about this feature when I initially heard about ES6. Since the rise of [bluebird](https://6to5.org/docs/learn-es6/#promises), however, it's not something I miss anymore; It is always there, in almost every project I write.

## Summary

ES6 now or later?

Transpilation with [6to5](https://6to5.org) invites you with wide open arms, and it's certainly easy to get started. Once linters and Grunt/&lt;insert-task-runner&gt; catch up, there is almost no downside to making the switch. For the time being, however, I don't see my production code moving yet. There is no single feature on the list, that can't wait another few months.

On the other hand, some of my smaller projects have now moved to ES6. More importantly: I have refactored some CoffeeScript code into 'vanilla' JavaScript under ES6. I still prefer many parts of CoffeeScript in terms of style and clarity by a long stretch (long-term Haskell fan). But moving to ES6 will help me take the step towards type-based JavaScript later on (TypeScript, AtScript).

What do you think? Have you switched to ES6 already?