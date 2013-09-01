---
title: Unit Testing EmberJS Controllers
published: false
cover: cover.png
---

Unit testing controllers in EmberJS is very similar to unit testing
other objects, but there are a few things to know about controller
dependencies before beginning. Let's test the following controller:

    App.PostController = Ember.ObjectController.extend({
      needs: 'posts'.w(),

      selected: Ember.computed.equal('model', 'controllers.posts.selected'),

      title: function() {
        return this.get('model.title').capitalize();
      }.property('model.title')
    });

This is a simple controller that wraps a ``post`` model. It has a
``selected`` property that checks if the this post is the currently
selected post as well as a ``title`` property that converts the model's
title to all caps.

If we try to test this controller in isolation we quickly run into
problems.

    var testController = App.PostController.create();

    // ERROR!
    // Uncaught TypeError: Cannot call method 'has' of null  

This is because the controller has a dependency on ``PostsController``,
which is what ``needs`` sets up for us. In order to initialize an
instance of this controller we need to give it a ``PostsController``.

Of course, we want to be testing things in isolation and we
certainly do not want our tests to be creating instances of other
controllers. So how do we get around this?

### Use the Container

When an Ember application boots up everything is wired together and
placed inside of the application's container. Every time we call
``App.reset()`` a newly created container is available to us.

We can use the following example to rely on the container for providing
us with instances of our controller.

    var model, controller;

    module("Post Controller Test", {
      setup: function() {
        App.reset();
        controller = App.__container__.lookup('controller:post');
        model = App.Post.create();
        controller.set('model', model);
      },
      teardown: function() {
        controller = null;
        model = null;
      }
    });

    test("it should capitalize the title", function() {
      model.set('title', 'hello world');
      equal(controller.get('title'), "HELLO WORLD", 'all caps title');
    });

When taking this approach the container will give us back an instance of
``PostController`` that has been fully wired to ``PostsController``.

### Fake the Container

Another approach that is possible is to use a small container
when creating the ``PostController``. When a controller is created it is
given a container and at that point anything the controller ``needs`` it
gets from that container. We can give the controller a container
with some fake objects to quickly initialize it.

    var model, controller;

    module("Post Controller Test", {
      setup: function() {
        var container = new Ember.Container();

        // an empty object will act as our PostsController
        container.register('controller:posts', {});

        // pass in our container
        controller = App.PostController.create({ container: container });
        model = App.Post.create();

        controller.set('model', model);
      },

      teardown: function() {
        controller = null;
        model = null;
      }
    });

    test("it should capitalize the title", function() {
      model.set('title', 'testing testing');
      equal(controller.get('title'), "TESTING TESTING", 'all caps title');
    });

While the above example gives us more control of what dependencies are
used when testing controllers it may be too tightly tied to the
implementation of how Ember controllers use and expect containers.

### Examples

It is probably fine to use either of the above methods when testing
controllers, but your decision should be based on the situation you are
testing.

Examples showing both of these approaches can be found in this [test
runner](runner), remember to view the source to see the JavaScript.

