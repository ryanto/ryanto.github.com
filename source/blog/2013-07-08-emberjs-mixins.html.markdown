---
title:  EmberJS Mixins
cover: cover.png
published: true
---

In EmberJS the Mixin class can create objects whose properties
and functions can be shared amongst other classes and instances. This
allows for an easy way to share behavior between objects as well as
design objects that may need multiple inheritance.

READMORE

Mixins are great for abstracting pieces of reusable code into smaller
single responsibility objects. For larger applications this makes code
easier to reason about and easier to test.

<pre><code class="javascript">App.HelloMixin = Ember.Mixin.create({
  sayHello: function() {
    alert("Hello " + this.get('name'));
  }
});
</code></pre>

The mixin can then be added to any class with the ``extend`` function.

<pre><code class="javascript">App.Person = Ember.Object.extend(App.HelloMixin);
App.Product = Ember.Object.extend(App.HelloMixin);

ryan = App.Person.create({ name: 'ryan' });
book = App.Product.create({ name: 'A Storm of Swords' });

ryan.sayHello(); // "Hello ryan"
book.sayHello(); // "Hello A Storm of Swords"
</code></pre>

### Examples

Mixins are applicable to all class of Ember including models,
controllers, and views. This allows you to take advantage of some
specific idioms and conventions that exist in Ember.

A mixin can be used to quickly wire up controllers that may depend on
another controller. For example, a couple of controllers might need
access to the application's current user.

<pre><code class="javascript">App.CurrentUserMixin = Ember.Mixin.create({
  needs: 'currentUser',
  currentUser: Ember.computed.alias('controllers.currentUser')
});

App.ProfileController = Ember.ObjectController.extend(
  App.CurrentUserMixin, {

  isCurrentUsersProfile: function() {
    return this.get('currentUser') === this.get('model');
  }.property('currentUser', 'model');
});
</code></pre>

The same can be done if views need to share a common piece of code.
Imagine a view that wants to use jQuery UI's resizable feature.

<pre><code class="javascript">App.ResizableViewMixin = Ember.Mixin.create({
  didInsertElement: function() {
    this.$().resizable();
  }
});

App.PictureView = Ember.View.extend(App.ResiableViewMixin);
</code></pre>

### Mixins at Runtime

Mixins can also be applied to instances of objects at runtime. This
allows for only certain objects to gain behavior.

<pre><code class="javascript">App.Coffee = Ember.Object.extend();

starbucks = App.Coffee.create({ name: 'Starbucks' });
dunkindonuts = App.Coffee.create({ name: 'Dunkin Donuts' });

App.HelloMixin.apply(starbucks);

starbucks.sayHello(); // "Hello Starbucks"
dunkindonuts.sayHello(); // No method error
</code></pre>

### Mixin Detection

An object can quickly be checked for the presence of a mixin using the
``detect`` function. Building off the example above.

<pre><code class="javascript">App.HelloMixin.detect(starbucks) // => true
App.HelloMixin.detect(dunkindonuts) // => false
</code></pre>

### Included Mixins

Ember comes with many mixins available to use in any class or instance.
There are mixins to deal with a very wide range of abstractions such as
immutability, sorting, enumeration, and events. A full list of mixins
can be found in
[ember-runtime](https://github.com/emberjs/ember.js/tree/master/packages/ember-runtime/lib/mixins).
