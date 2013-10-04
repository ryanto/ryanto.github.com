---
title: Testing EmberJS Templates
published: false
cover: cover.png
---

We can use both integration and unit tests to ensure our application,
views, and templates are working properly. However, we can also test
views and templates interaction with the DOM in isolation from the rest
of our application.

### Testing Templates

Let's test this template:

    <script type="text/x-handlebars" data-template-name="post">
      <h1 class="title">{{title}}</h1>
      <p class="body">
        {{body}}
      </p>
    </script>

The easiest way to test a template is with a single view. The following
example creates a one off view, appends it to DOM, and then inspects
the page to make sure the expected HTML was inserted.

    module("Testing a Template", {
      setup: function() {
        controller = {};
        view = Ember.View.create({
          templateName: 'post',
          controller: controller,
          container: App.__container__
        });
      },
      teardown: function() {
        Ember.run(function() {
          view.destroy();
        });
        controller = null;
      }
    });

    test("it should show the title", function() {
      controller.title = "Hello World";

      Ember.run(function() {
        view.appendTo('#qunit-fixture');
      });

      equal(
        $('#qunit-fixture .title').text().trim(),
        "Hello World",
        "found title"
      );
    });

There are a few things to note in the above test.

First, when creating a view to test our template we need supply a
container. We are going to give our temporary view access to
``App.__container__`` so that it can find the ``post`` template.

Second, when we insert and remove the view from the page we need to wrap
the code in ``Ember.run`` since the auto run loop is disabled when
testing.

### Testing Partial Templates


Let's say we are building an e-commerce site that sells beer and other
age restricted items. We're going to have a partial on each page that
displays a message letting the user know if he can or cannot buy our
beer.

    <script type="text/x-handlebars" data-template-name="_can_buy_beer">
      {{#if userIsOver21}}
        You can buy our beer.
      {{else}}
        Sorry you cannot buy beer.
      {{/if}}
    </script>

To test this partial we are going to use  a similar strategy to testing
templates. However, instead of creating a view that directly uses the
partial as its template, we will create a view that invokes that partial
through its template.

In other words, we create a one off view and a one off template to
simulate how the partial is used in our application.

    module("Testing a Partial", {
      setup: function() {
        controller = {};
        view = Ember.View.create({
          template: Ember.Handlebars.compile("{{partial 'can_buy_beer'}}"),
          controller: controller,
          container: App.__container__
        });
      },
      teardown: function() {
        Ember.run(function() {
          view.destroy();
        });
        controller = null;
      }
    });

    test("it should say the user can buy beer when the user is over 21", function() {
      controller.userIsOver21 = true;

      Ember.run(function() {
        view.appendTo('#qunit-fixture');
      });

      equal(
        $('#qunit-fixture').text().trim(),
        'You can buy our beer.',
        'displayed message'
      );
    });

    test("it should show a sorry message when the user is under 21", function() {
      controller.userIsOver21 = false;

      Ember.run(function() {
        view.appendTo('#qunit-fixture');
      });

      equal(
        $('#qunit-fixture').text().trim(),
        'Sorry you cannot buy beer.',
        'displayed message'
      );
    });

Examples of these tests can be found in this [test runner](runner).
Remember to view the source to see the code.

### Is it Necessary to Test Templates?

Templates tend to consist of declarative markup with data bindings, so
there is not a lot of need to test them. In fact, most template testing
can be effectively done with integration tests.

If you find yourself in a situation with templates that contain so much
logic that tests are required then there is most likely a code smell.
Try moving some of that logic into view helpers or outlets. Templates
should really be logic-less.

Larger templates actually become hard to test in isolation, which is
reason enough to avoid testing templates outside of integration tests.
An example of this is a template that invokes the ``{{#linkTo}}`` helper
will now be dependent on the router and linked route.

However, testing templates in isolation will ensure that your template
and view are functioning as expected, outputting the correct HTML, and
interacting with the DOM correctly.  I find these types of a test most
valuable when my template is a commonly used partial or relies on a
jQuery plugin. Isolation in these scenarios is valuable because when
something breaks it is easy to pinpoint.

### Next

In the next section of this guide we will dive into testing view
helpers.
