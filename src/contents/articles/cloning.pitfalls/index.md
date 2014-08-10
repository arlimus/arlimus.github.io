---
title: Cloning Pitfalls
author: arlimus
date: 2014-08-10
template: article.jade
---

It's a simple enough task: Create a copy of an object and hand it off for some jolly processing. But there's a few traps on the way.

<span class="more"></span>

## Cloning (JavaScript)

Let's try cloning with [lo-dash](http://lodash.com/docs)

```javascript
a = {b: {c: 12 }}
t = _.clone(a)
t.b.c // = 13
```

Simple.

Generally, however, you won't clone and just read a value; Instead you'll most likely process it in some form:

```javascript
t.b.c = 3
```

Imagine a larger project where things like this happen deep in a code-cave. It's easy to think of the object as being fully cloned, even though it isn't:

```javascript
a.b.c // = 3
```

Since javascript doesn't have (verified) immutable types, this is a typical pitfall waiting for you.

You'll quickly find a solution to this problem:

```javascript
a = {b: {c: 12 }}
t = _.cloneDeep(a)
t.b.c = 1
a.b.c // = 12
```

Or using jQuery's `extend`

```javascript
t = $.extend(true, {}, a)
```

Or plain old JSON (if you don't care about methods)

```javascript
t = JSON.parse(JSON.stringify(a))
```

For more inspiration take a look at this [benchmark here](http://jsperf.com/deep-cloning-of-objects).

## Pointers (Go)

The tricky part about javascript is, that this behavior isn't always apparent. Other languages are much more explicit with copies and references.

Here's the same example in Go:

```go
type B struct { C int }
type A struct { B B }
a := A{B: B{C: 12}}
```

Versus:

```go
type B struct { C int }
type A struct { B *B }
a := A{B: &B{C: 12}}
```

This explicit pointer `*` makes a huge difference in reasoning about the program. It clearly shows that it doesn't hold the value itself, but a copy. It doesn't necessarily make cloning the object any easier, but it simplifies the search for errors a lot: You know that it's either a value `{ A Structure }` (or a copy of such), or a pointer to some object `{ A *Structure }`.

The larger your project gets, the more likely you'll have these and similar constructs with potential cloning pits waiting (though less likely here).


## Constants (Scala)

Go supports constants, but only in a very limited way:

```go
const c = 123    // possible
const a = A{...} // not
```

Let's have a look at a final language for constants: Scala.

Mutability is handled explicitly here:

```scala
var a = 123
val b = 123
a = 12
b = 12 // won't compile
```

Even if you take more complex structures like maps and lists, you'll usually have the choice of going mutable or immutable:

```scala
val a = List(1,2,3)
a(0) = 12 // won't compile
```

Versus

```scala
import collection.mutable.LinkedList
val b = LinkedList(1,2,3)
b(0) = 12
```

This is much more explicit with regard to what can be changed and what can't. Using Scala's type system you get a lot of control over how users may use your custom objects. 

## Final words

In my opinion, opening up mutability in many situations gains a lot of simplicity and flexibility. Unless you're around languages with more advanced language constructs like Scala or Haskell, you'll often work with more mutable state than not. 

Many functional languages will make immutable objects feel more accessible and usable and thus close some potential traps in your way. On the other hand, languages like Go will make you harness the full potential of you allocated memory bits, even though it requires some care in its handling.