---
title: EmberJS Enumerable Mixin
cover: cover.png
published: true
---

An EmberJS Mixin is an object that allows for code to be shared across
unrelated classes that behave in a similar fashion. This is a powerful
concept because it allows for easy code reuse and forces well thought
interface design.

READMORE

An example of this can be shown with the following data structures:
arrays, linked lists, and hash maps. Each of these classes will have
different implementations, but there is common functionality that is
expected in all three. For example iterating over every element in the
collection. If iteration can occur than it is reasonable to expect
functions like map, filter, and reduce to exist. Since these functions
are higher level concepts they should be abstracted into a library
that any collection like class can use.

This is exactly what Ember's Enumerable Mixin is. An object that
implements many of the higher level enumeration functions, like map,
filter, and reduce. In fact, any class can use the enumerable mixin
as long as it follows two simple rules:

* The class must have a ``lengh`` property.
* The class must implement ``nextObject``, a function that returns the
  next object in the collection.

### Linked List

The following will be a guide to creating a linked list class that mixes
in enumerable. A linked list is a data structure that represents a
collection of nodes that point to each other.

<div class="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Singly-linked-list.svg/816px-Singly-linked-list.svg.png"
    width="400" /><br />
  <small>From <a href="https://en.wikipedia.org/wiki/Linked_list">Wikipedia</a></small>
  <br /><br />
</div>

    Node = Ember.Object.extend({
      value: null,
      next: null
    });

    var head = Node.create({
      value: 12,
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

#### Length Property

In order to calculate the length of a linked list a function just needs
to keep track of how many times it can go to the next object before
hitting undefined.

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

#### Next Object

Ember's Enumerable mixin requires next object to have the following
signature: ``nextObject(index, previousObject, context)`` where:

* ``index`` is the Nth item we are looking for. An index of 0 means the
  first item.
* ``previousItem`` is the value that the previous call to ``nextObject``
  returned .
* ``context`` is a scratch pad that can be used to save temporary data.

For a linked list ``nextObject`` only needs to take advantage of the
``index`` argument.

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

#### Mixing in Enumerable

To make a class Enumerable the mixin just needs to be applied to the
extend method.

    Node = Ember.Object.extend(Ember.Enumerable, {
      length: // ...
      nextOjbect: // ..
      next: // ...
      value: // ...
    });

Now any of the functions defined in
[Ember.Enumerable](https://github.com/emberjs/ember.js/blob/master/packages/ember-runtime/lib/mixins/enumerable.js)
will work for the Node class.

    var head = Node.create({
      value: 1,
      next: Node.create({
        value: 2,
        next: Node.create({
          value: 3
        })
      })
    });

    var nodeTimesTwo = function(node) { 
      return node.get('value') * 2;
    };

    head.map(nodeTimesTwo); // => [2,4,6]

    // and

    var nodeSum = function(total, node) { 
      return total + node.get('value');
    };

    head.reduce(nodeSum, 0) // => 6 

#### Overriding

Map and reduce functions work great, but when filter is applied to the
list something strange happens.

    head.filter(function(node) {
      return node.get('value') < 3;
    }); 

    // => [node({ value: 1 }), node({ value: 2})]

Although the correct nodes are returned, the data structure is
incorrect. ``Node#filter`` should return nodes expressed as a linked
list, not an array.

To correct this ``Node#filter`` will need to implement its own function
that returns a list.

    Node = Ember.Object.extend(Ember.Enumerable, {
      // ...
      
      filter: function(fn, context) {
        var arrayOfNodes = this._super.apply(this, arguments),
            arrayOfValues = arrayOfNodes.mapProperty('value');
        return Node.createFromArray(arrayOfValues);
      }
    });

This is a nice use of ``super``. It's silly to reinvent ``filter``
since it already exists, but our filter function should change the
return value from an array to a list.

The last required function is ``Node.createFromArray``, which creates a
list from an array of values.

    Node.reopenClass({
      createFromArray: function(array) {
        var createNode = function(item) {
              return Node.create({ value: item })
            },
            nodes = array.map(createNode),
            head = nodes[0],
            linkNodes = function(first, second) {
              first.set('next', second);
              return second;
            };

        nodes.reduce(linkNodes);
        return head;
      }
    });

    var head = Node.createFromArray([1,2,3,4]);

    head.get('value'); // => 1
    head.get('next.next.value'); // => 3

With these two functions lists can be filtered into brand new lists.

    var head = Node.createFromArray([1,2,3,4]);

    var filtered = head.filter(function(node) {
      return node.get('value') % 2 === 0;
    });

    filtered.get('length') // => 2
    filtered.get('next.value') // => 4
