---
title: Faking API Calls with Test Fixtures
published: true
cover: cover.png
---

Most Ember applications are going to rely on a back end service for
loading and saving data. While your test suite is running you probably
do not want to rely on these remote services for a number of reasons.
You would have to reset the state of your back end before every test
run, which is probably a lot more difficult than it seems. Also, relying
on a remote network service means much slower test times. We want to
have hundreds, if not thousands, of tests so we cannot afford to add
100ms to each test run that expects a remote response.

Most data libraries have a solution for this called test fixtures. In
this guide we are going to focus on how Ember Data uses fixtures and how
we can build tests cases around them.

### Remote Testing Done Locally

Lets say we have a ``PostRoute`` that loads a post from our back end. It
would probably look something like this

    App.PostRoute = Ember.Route.extend({
      // ok, ok, this isn't needed, but I wanted to be explicit 
      // in showing what is happeing here.
      model: function(params) {
        return App.Post.find(params.post_id);
      }
    });

Our goal is going to make the following test pass. This test simply
checks to make sure the correct post title is loaded into the template.

    test("should display the post title", function() {
      visit("/posts/1")
        .assertExists("h1:contains('Hello World Test Post')");
    });

And to make all this happen we won't have a back end service to rely on.

### Fixtures

The fixture adapter allows Ember Data to load all of its data
locally using in memory JSON representations of your models. Fixtures
for a post would look like this.

    App.Post.FIXTURES = [{
      id: 1,
      title: 'Hello World Test Post',
    },{
      id: 2,
      title: 'The Second Post',
    }];

To make Ember Data load this data a store must be created with the
fixture adapter.

    App.Store = DS.Store.extend({
      adapter: DS.FixtureAdapter
    });

When ``App.Post.find(1)`` is called, it will load the data from the
fixture.

Once the post fixture and fixture adapter are placed into our
application the above test case should pass. The code for this example
can be viewed [here](runner) (view the source to see the JavaScript).

### Asynchronous Fixtures

By default the fixture adapter loads your fixtures asynchronously, which
is a nice feature because this is how your application will work when
using the REST adapter. The default latency is 50ms, but this can be
changed inside the fixture adapter. 

    App.Store = DS.Store.extend({
      adapter: DS.FixtureAdapter.extend({
        simulateRemoteResponse: true,
        latency: 50,
      })
    });

It is worth noting that with this latency enabled your fixtures will not
load right away. 

    var post = App.Post.find(1)
    post.get('title') // => undefined
    // wait 50ms
    post.get('title') // => "Hello World Test Post"

### Differences in the Adapters

There are some slight differences between the REST adapter and the
fixture adapter. 

First, the REST adapter converts snake cased keys into camel case. For
example, if you have a created at attribute on your model it would be
named ``createdAt``. However, your API would respond with
``created_at``. The REST adapter automatically converts the snake cased
API key to the camel cased model attribute. The fixture adapter does not.

Another difference between these two adapters is how relationships are
handled. In the REST adapter the relationships keys are postfixed with
``_ids``, but in the fixture adapter they are not.

<div class="row">
  <div class="large-6 small-12 columns">
    <h4>REST</h4>
<pre><code class="javascript">"post": {
  id: 1,
  title: "Hello World Test Post",
  author_id: 1,
  created_at: "2013-08-27"
}</code></pre>
  </div>
  <div class="large-6 small-12 columns">
    <h4>Fixture</h4>
<pre><code class="javascript">App.Post.FIXTURES = [{
  id: 1,
  title: "Hello World Test Post",
  author: 1,
  createdAt: "2013-08-27"
}];</code></pre>
  </div>
</div>

### Choosing Adapters at Runtime

You can use an initializer to choose which adapter to use at runtime.
When in testing mode we can use the fixture adapter, but when in
development, staging, or production modes we want to use the REST
adapter.

In our HTML file we'll define an ``ENV`` variable that states the mode we
are in.

    <script type="text/javascript">
      window.ENV = {
        mode: 'test', // or development, staging, production, etc
      };
    </script>

We should also define different adapters, one for each of our modes.

    App.TestAdapter        = DS.FixtureAdapter.extend();
    App.DevelopmentAdapter = DS.RESTAdapter.extend();
    App.StagingAdapter     = DS.RESTAdapter.extend();
    App.ProductionAdapter  = DS.RESTAdapter.extend();

Now the initializer will take the mode and wire the corresponding adapter
into the store.

    Ember.Application.initializer({
      name: "dataAdpater",
      before: "store",

      initialize: function(container, applicaiton) {
        var adapterName = "adapter:" + ENV.mode;
        application.inject("store:main", "adapter", adapterName);
      }
    });

Now every time your Ember application starts up it will automatically
use the adapter that matches the mode defined in the HTML file.

### Data Libraries

**Ember Data**'s [fixture
adapter](https://github.com/emberjs/data/blob/master/packages/ember-data/lib/adapters/fixture_adapter.js).

**Ember Model** has a [fixture
adapter](https://github.com/ebryn/ember-model/blob/master/packages/ember-model/lib/fixture_adapter.js).

**Ember.js Persistence Foundation** has a [local
adapter](https://github.com/GroupTalent/epf/blob/master/lib/local/local_adapter.js).

