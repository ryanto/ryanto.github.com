---
title: A Guide To Testing EmberJS Applications
cover: cover.png
cover_position: top center
published: true
---

The following pages serve as a guide for testing your EmberJS
applications. Having tests in large applications is a great way to
understand requirements, layout code correctly, and prevent regressions
and bugs as new features are added.

Testing large JavaScript applications has always been a little
difficult. This could be because having to deal with asynchronous behavior
inside a test suite adds a layer of complexity. The last thing you worry
about is pausing and continuing a test suite while asynchronous calls
complete.

EmberJS makes testing easy by treating your test cases as first
class citizens. Ember is aware of the problems driven from testing
asynchronous code and gives you a very nice API to manage this
complexity before it can bite you. This guide will give you all the
tools and knowledge needed to efficiently test your Ember applications
so you and your team to reap the benefits of test driven development.

* [Setting up your EmberJS Application for Testing](/blog/emberjs-testing-setup)
* [High Level Integration Tests for EmberJS](/blog/emberjs-integration-testing)
* [Writing Test Helpers in EmberJS](/blog/emberjs-test-helpers)
* [Faking API Calls with Test Fixtures](/blog/emberjs-test-fixtures)
* [Unit Testing EmberJS Objects](/blog/emberjs-unit-testing)
* [Unit Testing EmberJS Controllers](/blog/testing-emberjs-controllers)
* [Testing EmberJS Templates](/blog/emberjs-testing-templates)
