---
title: Unit Testing EmberJS Objects
published: false
cover: cover.png
---

So far in this guide we've written a number high level tests as our
examples. Although these integration tests are great for verifying
everything is working correctly together and showcasing business
requirements, they are absolutely awful at finding what broke when tests
start failing. This is because every one of these high level tests end
up invoking many different routes, controllers, models, views, and
templates. There is a very wide range of things that could be broken
when one of these tests fails.

Unit tests provide a solution to this problem because they test small
pieces of code in isolation. When a unit test fails you know exactly
what the reason for that failure was because the test is testing only
one function. These tests are great for finding whats broken as soon as
it breaks. However, since they only test one thing, they are bad at
verifying all of the pieces of your application work well together. 

A good test suite has both integration and unit tests. In this section
we will learn how to test pieces of an Ember application in isolation.

### A Simple Function

``Ember.String`` is an object that contains various string manipulation
functions. Let's add ``Ember.String.titleize``, which will be a function
that converts strings into titles. So ``titleize('hello world')`` would
return ``"Hello World"``.

The first thing we should do is write a couple of failing test case that
outline the behavior of our function.

    test("it should titleize a word", function() {
      equal(Ember.String.titleize("hello"), "Hello", "titleized word");
    });

    test("it should titleize a sentence", function() {
      equal(Ember.String.titleize("hello world"), "Hello World", "titleized sentence");
    });

We can begin writing our function now. Once these tests pass we know we
have written the correct code.

    Ember.String.titleize = function(string) {
      return string
        .split(/\s/)
        .map(Ember.String.capitalize)
        .join(" ");
    };

And our tests go green.

### Dependant Properties

Say we are building an application with a ``Car`` class that has a
``turnOn`` function to start the car. Our car is going to be  smart and
will do a bunch of checks before attempting to turn on. 

    App.Engine = Ember.Object.extend({
      hasGas: Ember.computed.alias('gasTank.notEmpty'),
      tires: [],

      turnOn: function() {
        var hasGas = this.get('hasGas'),
            tires = this.get('tires'),
            tiresHaveAir = tires.every(function(tire) {
              return tire.get('hasAir');
            });

        if (hasGas && tiresHaveAir) {
          this.set('on', true);
          return true;
        } else {
          return false;
        }
      }

Simple enough, we check to make sure we have gas in the tank and air in
the tires before turning on. If not, we return false. How are we going
to unit test this function?

Well, we could create a car, give it a bunch of tires, setup a gas tank,
make one of those tires flat, and then try to start the car.

    test("should not be able to start a car that has a flat tire", function() {
      var car = Car.create(),
          gasTank = GasTank.create(),
          tires = [Tire.create(), Tire.create()];

      gasTank.fillWithGas();
      tires[0].set('airLevel', 100);
      tires[1].set('airLevel', 0);

      car.setProperties({
        gasTank: gasTank,
        tires: tires
      });

      equal(car.turnOn(), false, 'cannot start car');
    });

This test works, but it is a bad test because if the test fails we don't
know what went wrong. Is our ``hasAir`` property broken, did we mess up
the ``GasTank``, or is the logic in ``turnOn`` incorrect? To find out
where the error is we need to dig deeper and investigate all of these
functions and their dependencies.

Another problem with this test is it's too heavily tied to the
implementation of other objects. What happens if we remove
``GasTank#fillWithGas`` or change ``Tire#airLevel``. Our test would
fail, while our ``turnOn`` function would still work.

So how do we test this function correctly? Well the first thing we need
to do is only focus on ``turnOn`` and nothing else. We should assume
that everything else is working correctly, which we can accomplish this
by stubbing out every dependent property with an expected value. We can
rewrite the above test to read:

    test("should not be able to start a car that has a flat tire", function() {
      var car = Car.create();
      
      car.set('hasGas', true);
      car.set('tires', { every: function() { return false; } });

      equal(car.turnOn(), false, 'cannot start car');
    });

Now if this test were to fail we know exactly what the problem is. Our
logic in ``turnOn`` is faulty, specifically around verifying that every
tire has air.

### Stubbing and Mocking

The above technique is called stubbing. Instead of relying on another
function we force its value in the test. Since JavaScript is a dynamic
and reflective language that allows for modifications to objects at
runtime you can do this sort of thing by hand as we did in the example
above. However, there is an excellent library called
[Sinon.JS](http://sinonjs.org/) that has an excellent API, and many
utility functions, that make stubbing, mocking, and spying a breeze.

In the next section we will continue to discuss unit testing, but focus
on how we can use these tests to make sure our controllers are
functioning properly.
