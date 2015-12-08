---
title: Yield to inverse
tags: Ember
published: true
---

Currently I'm working on a project that is rolling out features behind
feature flags for specific users. That's to say we build and ship a new
feature, but only activate it for a small number of users. Once we get
usage statistics and user feedback from that small group we
know if the feature is going to be a success or not. Successful features
get turned on for the rest of the population and unsuccessful features get
removed.

As an example, let's say we're building a piece of blog software and we
want to conditionally turn on a new editor component for a select group
of users. The code would look something like this:

    {{! an ember app for editing blog posts }}

    {{#if post.isUsingNewEditor}}
      {{new-post-editor post=post}}
    {{else}}
      {{old-post-editor post=post}}
    {{/if}}

This works well, but for the software project I'm working on the
condition for seeing the new editor is a bit more complicated. It
depends many things like the blog, the post, and the current user. Not
only that, but if the current user is an admin they can toggle between
the new and old editor.

In order to encapsulate all of this complexity there is a ``beta-feature``
component that decides which editor should be shown. You can imagine a
component that looks like this:

    {{#beta-feature name="new-post-editor" as |feature|}}
      {{#if feature.isActive}}
        {{new-post-editor post=post}}
      {{else}}
        {{old-post-editor post=post}}
      {{/if}}
    {{/beta-feature}}

This works, but it looks a little funny with the component yielding a
`feature.isActive` value and expecting the caller to use it with an `if`
statement. It suffers from a leaky abstraction, which makes it
error prone.

We can design a better a `beta-feature` component. In fact,
wouldn't this API be nice?

    {{#beta-feature name="new-post-editor"}}
      {{new-post-editor post=post}}
    {{else}}
      {{old-post-editor post=post}}
    {{/beta-feature}}

That's much easier to remember and far less error prone, but how do we
pass an else block to a component? That's where Ember's inverse yield
comes in.

Here is how our `beta-feature` component looks if we want it to be aware
of the `{{else}}` block:

    // components/beta-feature/component.js

    export default Ember.Component.extend({
      isActive: Ember.computed('...', function() {
        // Here is where our complex logic for figuring out if a feature
        // should be turned on lives...
        return true;
      })
    })

And the template...

    {{! components/beta-feature/template.hbs }}

    {{#if isActive}}
      {{yield}}
    {{else}}

      {{! yielding to inverse will show what was given to our
          components else block. cool! }}
      {{yield to="inverse"}}

    {{/if}}

Inverse yield is available in Ember 1.13+ and is a great way to deal
with components that can be in one of two states based on some
condition, like our `beta-feature`.
