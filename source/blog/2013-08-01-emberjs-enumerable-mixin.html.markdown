---
title: EmberJS Enumerable Mixin
cover: cover.png
published: false
---

An EmberJS Mixin is an object that allows for code to be shared across
unrelated classes that behave in a similar fashion. This is a powerful
concept because it allows for easy code reuse and forces well thought
interface design.

READMORE

An example of this can be shown with the following data structures:
arrays, linked lists, and hash maps. Each of these classes will have
different implementations, but there is common functionallity that is
expected in all three. For example, iterating over every element in the
collection. If interation can occur than it is reasonable to expect
functions like map, filter, and reduce to exist. Since these functions
are higher level concepts they should be abstractable into a library
that any collection like class can use.

This is exactly what Ember's Enumerable Mixin is. An object that
implements many of the higher level enumeration functions, like map,
filter, and reduce. In fact, any class can use the enumerable function
as long as it follows two simple rules:

* The class must have a ``lengh`` property.
* The class must implement ``nextObject``, a function that returns the
  next object in the collection.

### Linked List

The following will be a guide to creating a linked list class that mixes
in enumerable. A linked list is a data structure that represents a
collection of nodes that point to each other. Linked lists have O(1)
addition and deletion times, but suffer from slow O(n) lookup times.

From Wikipedia:
https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Singly-linked-list.svg/816px-Singly-linked-list.svg.png

```javascript
Node = Ember.Object.extend({
  value: null,
  next: null
});

var head = Node.create({
  value: 12
  next: Node.create({
    value: 99,
    next: Node.create({
      value: 37
    })
  })
});

head.get('value') // => 12
head.get('next.value') // => 99
head.get('next.next.value') // => 37
head.get('next.next.next') // => undefined
```

#### Length Property

In order to cacluate the length of a linked list a function just needs
to keep track of how many times it can go to the next object before
hitting undefined.

```
Node = Ember.Object.extend({
  // ...

  length: function() {
    var timesWeFoundNext = 1,
        next = this.get('next');

    while (next) {
      ++timesWeFoundNext;
      next = next.get('next');
    }

    return timesWeFoundNext;
  }.property('next.length')
});

var head = Node.create({ value: 'a' });
head.get('length') // => 1

head.set('next', Node.create({ value: 'b' }));
head.get('length') // => 2
```

#### Next Object

Ember's Enumerable mixin requires next object to have the following
sigature: ``nextObject(index, previousObject, context)`` where:

* ``index`` is the Nth item we are looking for. An index of 0 means the
  first item.
* ``previousItem`` is the value that the previous call to ``nextObject``
  returned .
* ``context`` is a scratchpad that can be used to save temporary data.

For a linked list ``nextObject`` only needs to take advantage of the
``index`` argument.

```javascript
Node = Ember.Object.extend({
  // ...

  nextObject: function(index) {
    var atNodeNumber = 0,
        next = this;

    while (atNode < index) {
      ++atNode;
      next = next.get('next');
    }

    return next;
  } 
});

var head = Node.create({ value: 'hello' });
head.nextObject(0).get('value') // => 'hello'

head.set('next', Node.create({ value: 'world' }));
head.nextObject(1).get('value') // => 'world'
```

#### Mixing in Enumberable



