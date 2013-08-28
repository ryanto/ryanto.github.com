---
title: High Level Integration Tests for EmberJS
cover: cover.png
published: true
---

This guide will walk you through higher level testing for your EmberJS
application. Adding these types of integration tests is recommended
because they'll test the overall functionality of your application,
touch multiple routes, and be an excellent source of business logic and
requirements. They're also extremely easy to write.

The first thing we need to do is create a setup function that will
have your Ember application reset before each test run. This is needed
to clear out the state of the application and create a pristine instance
for each test run.

We'll also want to inject test helpers during setup. These helpers will
give us an easy to use API for a lot of the actions we'll be using
inside our tests.

To create a setup function in QUnit use the following:

    module("Testing the homepage", {
      setup: function() {
        App.reset();
        App.injectTestHelpers();
      }
    });

Any test the follows the module will invoke the modules ``setup``
function before running.

### Failing Test Case

The first thing we are going to do is create a failing test case and
then create the code to make the test pass. This is better known as TDD
or red, green, refactor.

So lets say we want a homepage and on that homepage we are going to
display a welcome message. Our test would look like this.

    test("should display a welcome message", function() {
      visit("/")
        .find("h1.welcome")
        .then(function(title) {
          equal(title.length, 1, 'found title');
        });
    });

Once we run this test we should see a failure with an error message
about not finding the title. We need to add an ``h1.welcome`` tag.  Easy
enough.

    <!-- index template -->
    <script type="text/x-handlebars" data-template-name="index">
      <h1 class="welcome">Welcome</h1>
      <p class="message">Welcome to my website</p>
    </script>

And now our test passes. 

You'll notice inside the test we used two of Ember's built in test
helpers, ``visit`` and ``find``. 

* The ``visit`` helper visits a URL in your application, it's quite
simple, it just tells the router to load the given URL.
* The ``find`` helper will look for a selector and return it. Under the
covers this uses jQuery's selector API so ``find('#hello')`` is
equivalent to jQuery's ``$('#hello')``.

You can see this test in action on [this page](runner). View the source to see the
JavaScript code.

### More helpers

Ember comes with many more testing helpers available for use.

#### Visit

#####``visit(url)``

Tells to router to load the URL and render its template.

    visit("/hello")
      .then(function() {
        // we are now on the hello page
      });

#### Click

#####``click(selector)``

Sends a click a event to the selector and waits for any asynchronous
behavior to complete before continuing the test chain.

Given the following template:

    {{#linkTo "person" person
      class="show-person"}}Ryan{{/linkTo}}

The following will load the person page:

    click("a.show-person")
      .then(function() {
        // we are now on the person route for Ryan
      });

#### Key Event

#####``keyEvent(selector, eventType, keyCode)``

Sends ``eventType`` to the selector with the given key code. For example if
you wanted to press enter inside of an input you would use.

    keyEvent("input.name", 'keypress', 13);

#### Fill In

#####``fillIn(selector, value)``

Fills the value into the given form field.

    // fills in input
    fillIn("input.email", "ryanto@gmail.com")
      .then(function() {
        // email is set to ryanto@gmail.com
      });

This helper can also be used to change the value of select drop down
fields. Just make sure the given value exists as an option.

    fillIn("select.year", "1999")
      .then(function() {
        // year is set to 1999
      });

#### Find

#####``find(selector)``

Returns the jQuery object wrapping the selector to the next function in
the test chain.

    find("#world")
      .then(function(world) {
        // world is jQuery's $("#world")
      });

#### Find With Assert

#####``findWithAssert(selector)``

Similar to find, but raises an exception if the selector cannot be
found. Throwing an exception is enough to fail a test.

#### Wait

#####``wait()``

The wait helper will return a promise that fulfills when there is no
more asynchronous behavior left to complete. This is helpful when you
need to wait for something to complete, like a page render or AJAX
request.


    visit("/").
      then(function() {
        $.get('/ajax.json');
        return wait();
      })
      .then(function() {
        // will not run until the ajax completes
      });

The wait helper polls a handful of items and will not fulfil until all
of the following are true.

* There are no pending jQuery AJAX requests.
* The router has finished loading all pages.
* There are no scheduled timers in the run loop.
* The Ember run loop is not currently running.

These cases cover all of the asynchronous behavior that exist in a
typical Ember application.

### Chaining Helpers

All of these helpers can be chained together to make writing tests
easy and declarative. Each step of the test can be a part of the chain
with a final assertion on the end. This makes it easy to capture high
level business logic in a simple test case.

For example, let's create a test that asserts a user should be able to
sign up for our service with only a name and e-mail address.

    visit("/")
      .click(".button.signup")
      .fillIn("form.signup .name", "ryan")
      .fillIn("form.signup .email", "ryanto@gmail.com")
      .click("form.signup .submit")
      .find("h1:contains('Welcome')")
      .then(function(welcome) {
        equal(welcome.length, 1, 'found welcome h1');
      });

### Promises

The reason for chaining all of these test helpers together is because
each of these helpers is a function that returns a promise. This is a
great way to control the steps of your tests since the next step will
not run until the previous promises fulfills.

The reason for this is that these helpers invoke asynchronous behavior.
For example, imagine a test with ``visit('/hello').find("#world")``.  We
would not be able to to start looking for ``#world`` until the hello
route finished loading and rendered its template. The promise based
testing API easily lets us wait for visit to complete before searching for
``#world``. The beauty of this is that we do not really know, or care,
that visit is asynchronous.  Our tests read as if everything is a step of
synchronous behavior, which is much easier to conceptualize and reason
about when writing tests.

Since every helper returns a promises we can add our own ``thens`` anywhere
in the chain. This can be used to inspect state during each step of a
test or to insert assertions.

    test("Inspect each step", function() {
      visit("/")
        .then(function() {
          // we have loaded the index page
          console.log( $('#qunit-fixture') );
        })
        .find("h1.welcome")
        .then(function(h1) {
          // we have found the h1 tag
          console.log(h1);
        })
        .then(function() {
          // insert an assertion
          ok(true);
        })
        .click(".button.signup")
        .then(function() {
          // we are on the signup page
          console.log( $('#qunit-fixture') );
        });
    });

In the next section we will take a writing some of our own test helpers
in order to DRY up some common assertions and patterns we will most
likely be using throughout our test suite.
