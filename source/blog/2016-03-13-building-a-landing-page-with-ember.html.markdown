---
title: Building a landing page with Ember.js
date: 2016-03-13 13:55 EDT
tags: ember, EmberMap
published: false
---

Sam and I just published a landing page for
[EmberMap](https://embermap.com), a series of
always up to date Ember videos that help teams stay current.
If you’d like early access to our videos we’ve got a signup form on the
website or you can send me an email:
[ryanto@gmail.com](mailto:ryanto@gmail.com).

> *NOTES: Show screenshots, desktop + mobile.*

We created the landing page using Ember.js and we found quiet a few
benefits in doing so.

### Deployment

Deployment is so easy. We're using ember-cli-deploy to deploy the
application to CloudFront. It took about 10 lines of code to set this up
and now all of our content is being served from a CDN with edge nodes on
five continents.

> *NOTES: Screenshot of deployment*

We're serving our index.html from the CDN as well, which comes with a
downside: Redeploys take about 15 minutes since we need to do cache
invalidation. However, the landing page content rarely changes, about
once every two days so far, so this is acceptable. When we get to a
point where we need to deploy multiple times a day we'll reconfigure
ember-cli-deploy to use another strategy for our index.html, but keep
the rest of our deployment pipeline the same. These sort of changes are
minimal and that keeps them easy.

### Addons

We wanted to collect metrics for how people interact with the site. This
enables to see how visitors progress through our funnel as well as A/B
test different content. Setting this up was as easy thanks to
ember-metrics

> *NOTES: Screenshot of metrics + GA*

We also wanted to add animations, liquid fire made that easy.

Ember screen made it easy for us to use different content on different
devices and screen sizes. No media queries or CSS hacks required for
responsive content.

When I look at our page most of the hard-to-code things are handled by
addons. This lets us focus on content and allows us to publish quickly.

As we add more features to the page we’ll look to add ons to help us.
The Ember community does an amazing job keeping add ons simple, well
documented, up to date, and developer friendly.

> *NOTES: link to addons.*

### Iteration

Currently our website is only a landing page, but we've got plans to
turn it into an application. However, there's no magic moment when we
suddenly have an application. By using Ember we can incrementally add
features and improve content over time. Our website will transform from
a coming soon page to a full featured video player without any launches
or big rewrites. Ember makes this sort of thing so easy.

## Tradeoffs

Of course there are tradeoffs to using Ember to build your landing page.
Here's a few of the downsides we had to consider when building the
landing page.

Ember is a JavaScript framework and that means the browser has to
download, parse, and execute JS code before any content is rendered.
This is added overhead when compared to serving a landing page as static
HTML. Our site is targeted at developers with fast Internet and modern
browsers, so we felt like this tradeoff was an acceptable one.

Ember isn't something you learn in a day. We've built many Ember apps in
the last four years so creating this one only took a few hours. Without
experience it's easy to run into questions you don't know how to answer.
This sort of complexity significantly slow down development and should
always be considered when picking a tool.

All programming decisions involve some sort of trade off to be made.
While these tradeoffs might be non starters for your landing page we
felt the benefit of add ons and feature iteration made them well worth
it.

If you're excited about learning how to use Ember in a team environment
head on over to [embermap.com](https://www.embermap.com)




