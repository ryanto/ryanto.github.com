---
title: Setting up your EmberJS Application for Testing
cover: cover.png
published: true
---

This guide will outline how to test your EmberJS application with
[QUnit](http://qunitjs.com/), a JavaScript testing framework. Our
reasons for choosing QUnit are simple, it's the framework that
powers the tests behind the Ember code base, it has excellent support for
testing Ember applications, and it's very easy to get started with.

### Test Harness

The first thing we will need is a test harness, which is simple HTML
file that loads our application and kicks off the tests. We can start
with this HTML file that loads QUnit, jQuery, Handlebars, and Ember.

    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>EmberJS Testing</title>
      <link rel="stylesheet" 
        href="http://cdnjs.cloudflare.com/ajax/libs/qunit/1.11.0/qunit.min.css">
    </head>
    <body>
      <div id="qunit"></div>
      <div id="qunit-fixture"></div>
      <script type="text/javascript"
        src="http://cdnjs.cloudflare.com/ajax/libs/qunit/1.11.0/qunit.min.js"></script>
      <script type="text/javascript"
        src="http://cdnjs.cloudflare.com/ajax/libs/jquery/1.10.2/jquery.js"></script>
      <script type="text/javascript"
        src="http://cdnjs.cloudflare.com/ajax/libs/handlebars.js/1.0.0/handlebars.js"></script>
      <script type="text/javascript"
        src="http://builds.emberjs.com/ember-1.0.0-rc.7.js"></script>
    </body>
    </html>

If you load up this page you should see the QUnit test runner saying ``0
assertions of 0 passed, 0 failed``. Nice, now let's add a simple tests.

### Introduction to QUnit

If you've ever done any sort of testing before then QUnit will feel
right at home for you. If this is your first time testing then have no
fear.  QUnit has an [easy to use API](http://api.qunitjs.com/) that's
simple enough we can dive right in and you'll learn TDD along the way.

Tests are all written in JavaScript and can be added to the HTML file
between a ``<script>`` tag or with an external JavaScript file. Here is
a simple function and test.

    function add(a, b) {
      return a + b;
    }

    test("should add two numbers togeather", function() {
      var answer = add(1, 2);
      equal(answer, 3, 'added 1 + 2 correctly');
    });

And once we add this function and test to the test harness we should see
``1 assertions of 1 passed, 0 failed``. 

### Ember Testing

Before we can begin testing your Ember application we need to have
it play nicely with the test harness. The first thing we are going to do
is put the application inside ``div#qunit-fixture``. Since QUnit will be
displaying HTML about test passes and failures we don't want your
templates getting in the way. The ``div#qunit-fixture`` is setup for the
purpose, to hide your application while QUnit is running.

We'll also want to put Ember into testing mode, which will disable the
automatic run loop behavior. This is needed because we do not want
asynchronous functions firing in between or during other tests. We don't
need to worry about this, Ember is going to handle everything for us.

    // put app in qunit-fixture
    App = Ember.Application.create({
      rootElement: '#qunit-fixture'
    });

    // turn on testing mode
    App.setupForTesting();

That's it. Let's write another simple test to make sure everything is
working at this point.

    test("should be an ember applicaiton", function() {
      equal(
        App.constructor, Ember.Application,
        'App is an Ember App!'
      );
    });

In the next guide we'll take a look at writing real high level tests for
your application. The test harness that was used in the above examples
can be accessed [here](harness) (view source to see code).
