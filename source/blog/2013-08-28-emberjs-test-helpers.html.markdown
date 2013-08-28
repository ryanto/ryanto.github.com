---
title: Writing Test Helpers in EmberJS
cover: cover.png
published: true
---

Often times when writing a test we'll have common patterns that appear
over and over again. For example, to test that an element exists on a
page we would check that its length is equal to one.

    test("should show welcome message", function() {
      visit("/")
        .find("p.message")
        .then(function(element) {
          equals(element.length, 1, 'found welcome message');
        });
    });

A nice thing to have here would be an ``assertExists`` helper, which
would take a selector and assert that it exists on the page. This would
reduce the above test to the following:

    test("should show welcome message", function() {
      visit("/").assertExists("p.message");
    });

Much better. Now we just need to create the ``assertExists`` helper.
We'll give it the following signature: ``assertExists(selector, times)``
where

* ``selector`` is the jQuery selector we are looking for.
* ``times`` is the number of times it should be on the page, defaulting to 1.

### Registering Helpers

When we create a helper we need to register it with ``Ember.Test``.
There is a ``registerHelper`` function that allows us to do this
and when ``App.injectTestHelpers()`` is called all of these registered
helpers will be added to the global name space.

    Ember.Test.registerHelper('assertExists', function(app, selector, times) {
      if (!times) { 
        times = 1;
      }

      return wait()
        .find(selector)
        .then(function(element) {
          equal(element.length, times, "found " + selector + " " + times + "  times");
        });
    });

This is what you would expect from an ``assertExist`` helper, but there are
a few things here that need some explanation.

The first parameter passed to our registered helper is always an instance of the
Ember application. This is only needed when registering a helper and
it exists so that your helper can have access to the
application if need be. When calling a helper from an actual test you do not
need to worry about the ``app`` parameter. When invoked from a test, the first
parameter for our helper is ``selector``.

The second thing to note is the ``wait()`` function we return from the
test. This is because we do not want to start searching for the selector
until everything is ready. ``Wait`` simply waits for all of Ember's
asynchronous actions to complete before continuing.

While returning a chain that starts with ``wait()`` is not a requirement
for tests helpers it is a good idea to get in the habit of doing this.
It will ensure that your helper will not run until any previous
asynchronous actions have completed. I tend to have all my helpers return
a ``wait()`` chain as a default.

### Application Test Helpers

Our ``assertExists`` helper is simply a test helper that will DRY up a
common assertion. There is another class of test helpers that are
usually needed to change the state of the application at runtime. An
example of this would be a helper like ``loginAs()``, which would
automatically log a user into an account.

There are two ways to write a ``loginAs``. The first, is just to mimic
all the steps are user takes to login to the application. This helper
may look something like:

    Ember.Test.registerHelper("loginAs", function(app, username, password) {
      return wait()
        .visit("/login")
        .fillIn("form.login .username", username)
        .fillIn("form.login .password", password)
        .click("input.submit")
        .wait();
    });

This is a nice and declarative test and it's probably a good to have a
test that does this somewhere in your suite.  However, this may not be
the best approach for a test helper because every time it is called
it has to visit the login page, wait for the router to render the
template, fill in a bunch of form fields, click submit, and finally wait
for your application to handle the login. Even if this sort of action is
fast if you have 1,000 tests that invoke this helper that time adds up
quickly.

As faster approach might just be to modify your application's state to
treat the user logged in. Of course, this idea is dependent on your
application architecture and may not work for everyone.

Imagine if you will an application that stores a current user in its
container. In order to check if the user is logged in or not we keep
a ``loggedIn`` boolean on the current user. This boolean is most likely
set by an API call to a back end service, but for testing we don't want
to wait on that sort of thing. Our answer is just to directly modify
the ``loggedIn`` flag so our user appears logged in.

    Ember.Test.registerHelper("loginAs", function(app, username) {
      return wait()
        .then(function() {
          var currentUser = app.__container__.lookup('current:user');
          currentUser.setProperties({
            username: username,
            loggedIn: true
          });
        });
    });

Now in your test you can access a URL that requires the current user to
be logged in:

    test("should automatically login as ryan", function() {
      loginAs("ryan")
        .visit("/dashboard")
        .assertExists("h1:contains('Welcome ryan')");
    });

### Examples

Hopefully this guide outlined ways to use helpers for reducing test
boiler plate as well as using test helpers to quickly put your
application in a testable state. All of the examples on this page can be
seen in action with this [test runner](runner) (View the source to see
the code).

In the next section we'll take a look at how you can fake calls to your
back end service so you can get fast tests without waiting for your API
to return.
