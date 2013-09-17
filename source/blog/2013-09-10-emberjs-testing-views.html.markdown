---
title: Testing EmberJS Views and Templates
published: false
cover: cover.png
---

We can use both integration and unit tests to ensure our views are
working properly. However, we can also test our views and templates
interaction with the DOM in isolation from the rest of our application.

The idea behind this test is to create a view and append it to
``#qunit-fixture`` and then ensure that ``#qunit-fixture`` contains the
correct template.

Let's say we are building an eCommerce site that sells beer and other
age restricted items. We might have a button on every page to buy beer:

    <script type="text/x-handlebars" data-template-name="beer/buy_button">
      {{#if userIsOver21}}
        {{#linkTo "beer.buy"}}Buy Beer{{/linkTo}}
      {{else}}
        Sorry you cannot buy beer.
      {{/if}}
    </script>

In order to test this view we can use the following:

    var qunitFixture = $('#qunit-fixture'),
        view;

    module("Buy Beer View", {
      setup: function() {
        view = Ember.View.extend({
          templateName: "beer/buy_button"
        });

        view.append();
      },
      teardown: function() {
        view.destroy();
      }
    });

    test("it should show the buy link when the user is over 21", function() { 


This sort of strategy is useful when testing reusable views such as
partials.
