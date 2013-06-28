---
title: Prototyping EmberJS Applications
published: true
cover: cover.png
---

Prototyping applications with EmberJS and Ember-Data can be extremely
easy. In fact, it is possible have a nicely working prototype ready to
show off in under an hour. Most people think of JavaScript applications
as sort of the last stage, the final piece that is built on top of a
finished back end API service. While a back end will eventually be
required it may actually be easier to prototype an application starting
with the JavaScript side first.

READMORE

The examples from this post are all taken from a very simple project
management application written in Ember. The source code can be found on
[this github repo](https://github.com/ryanto/prototyping-app-talk).

## Start with URLs

Before creating a new Ember application it is best to write down a list
of URLs that one would expect to see. For example, a piece of project
management software would likely have the following URLs.

<pre><code class="text">/projects
/projects/new
/projects/1
/projects/1/tasks/15
</code></pre>

From the list of URLs above it is very clear what each page will
display. Creating this list is the hardest part of prototyping an Ember
application because afterwards everything else becomes a matter of
following Ember's conventions. Once there is a list of URLs, all of the
routes, controllers, models, and templates will naturally fall into
place.

## Router

Turning the above list of URLs into an EmberJS Router is very straight
forward. The nouns will be represented as **resources** and the verbs
will be created as **routes**.

In order to satisfy ``/projects`` a simple resource will be used

<pre><code class="javascript">App.Router.map(function() {
  this.resource('projects');
});
</code></pre>

New projects can will be created by visiting ``/projects/new``, which
will be controlled by the following nested route.

<pre><code class="javascript">this.resource('projects', function() {
  this.route('new');
});
</code></pre>

The URL ``/projects/1`` will be a dynamic route that is responsible for
displaying the given project. The router definition is as fallows:

<pre><code class="javascript">this.resource('projects', function() {
  this.resource('project', { path: '/:project_id' });
});
</code></pre>

And because projects have tasks there will be nested tasks resources
inside the project route. This will create the ``/projects/1/tasks/15``
URL.

<pre><code class="javascript">this.resource('project', { path: '/:project_id' }, function() {
  this.resource('tasks', function() {
    this.resource('task', { path: '/:task_id' });
  });
});
</code></pre>

Now every one of the desired URLs has a route that maps to it. The
final router looks like this:

<pre><code class="javascript">App.Router.map(function() {
  this.resource('projects', function() {
    this.route('new');
    this.resource('project', { path: '/:project_id' }, function() {
      this.resource('tasks', function() {
        this.resource('task', { path: '/:task_id' }, function() {
        });
      });
    });
  });
});
</code></pre>

## Conventions and Objects

Having the router mapped out means that our Models, Routes, Controllers,
Views and Templates just fall into place. Here is a table showing all
the possible objects that could be used based on the above router.

<table class="small">
<tr>
<th>URL</th>
<th>Model</th>
<th>Route</th>
<th>Controller</th>
<th>View</th>
<th>Template</th>
</tr>

<tr>
<th>/projects</th>
<td></td>
<td>ProjectsRoute</td>
<td>ProjectsController</td>
<td>ProjectsView</td>
<td>projects.handlebars</td>
</tr>

<tr>
<th></th>
<td></td>
<td>ProjectsIndexRoute</td>
<td>ProjectsIndexController</td>
<td>ProjectsIndexView</td>
<td>projects/index.handlebars</td>
</tr>

<tr>
<th>/projects/new</th>
<td></td>
<td>ProjectsNewRoute</td>
<td>ProjectsNewController</td>
<td>ProjectsNewView</td>
<td>projects/new.handlebars</td>
</tr>

<tr>
<th>/projects/1</th>
<td>Project</td>
<td>ProjectRoute</td>
<td>ProjectController</td>
<td>ProjectView</td>
<td>project.handlebars</td>
</tr>

<tr>
<th></th>
<td></td>
<td>ProjectIndexRoute</td>
<td>ProjectIndexController</td>
<td>ProjectIndexView</td>
<td>project/index.handlebars</td>
</tr>

<tr>
<th>/project/1/tasks</th>
<td></td>
<td>TasksRoute</td>
<td>TasksController</td>
<td>TasksView</td>
<td>tasks.handlebars</td>
</tr>

<tr>
<th></th>
<td></td>
<td>TasksIndexRoute</td>
<td>TasksIndexController</td>
<td>TasksIndexView</td>
<td>tasks/index.handlebars</td>
</tr>

<tr>
<th>/project/1/tasks/15</th>
<td>Task</td>
<td>TaskRoute</td>
<td>TaskController</td>
<td>TaskView</td>
<td>task.handlebars</td>
</tr>

<tr>
<th></th>
<td></td>
<td>TaskIndexRoute</td>
<td>TaskIndexController</td>
<td>TaskIndexView</td>
<td>task/index.handlebars</td>
</tr>

</table>

Note that not all of these objects are actually required for the
application to work. They will only have to be created if the behavior
is different from the Ember defaults, which are usually enough to get
your application up and running.

## Setting up the Projects Page

In our application ``/projects`` will display all of the projects.
Before any projects can be listed there needs to be a project model.

<pre><code class="javascript">App.Project = DS.Model.extend({
  name: DS.attr('string'),
  tasks: DS.hasMany('App.Task')
});
</code></pre>

And because the projects page displays a collection a projects an 
``ArrayController`` will be used.

<pre><code class="javascript">App.ProjectsController = Ember.ArrayController.extend();
</code></pre>

The template will simply list all projects with a link to each project.

<pre><code class="handlebars">&lt;h1&gt;All Projects&lt;/h1&gt;

&lt;p&gt;You have {{length}} projects&lt;/p&gt;

{{#each project in controller}}
 {{#linkTo project project}}  
   {{project.name}}
  {{/linkTo}}
{{/each}}
</code></pre>

## Using the Application

Going to ``/projects`` displays the correct page, a list of projects.
However, since there are no projects nothing is displayed. This is the
point where most prototyping of Ember applications either slows down or
heads down an incorrect path.

Projects need to exist in the prototype and there are a number of ways
to make that happen.

<h3>
  <span class="radius label alert">Don't</span> 
  Create a Back End API / Service 
</h3>

Although this will eventually be needed, it is probably too early to
start building out the back end API. Back ends are complicated, 
requiring a lot of code and testing taking days or weeks to complete. 
The idea is to get an Ember application prototyped as quickly as 
possible so little time should be spent on non Ember application design.

<h3>
  <span class="radius label alert">Don't</span> 
  Use /projects/new
</h3>

Using ``/projects/new`` is an easy way to add projects to the
application. However, those projects would not be persisted anywhere and
lost as soon as that page refreshed. When prototyping the application
the developer would have to manually add a new project after each
reload.

<h3>
  <span class="radius label alert">Don't</span> 
  Force Models into the ProjectsController
</h3>

When the user enters the ``ProjectsIndexRoute`` the route can create and push a 
bunch of dummy projects onto the ``ProjectsIndexController``.

<pre><code class="javascript">App.ProjectsIndexRoute = Ember.Route.extend({
  setupController: function(controller) {
    controller.pushObject([
      App.Project.createRecord({ name: "Test Project" }),
      App.Project.createRecord({ name: "Another Project" })
    ]);
  }
});
</code></pre>

This is problematic because it mixes code with test data. As the
application grows larger more and more test data will start appearing
throughout the code base. When the application is ready for production
there are now many files to edit and change. There is no easy way to
switch between test data and back end service.

<h3>
  <span class="radius label success">Do</span> 
  Use Ember Data's Fixture Adapter
</h3>

This is the answer to all of the above problems. The fixture adapter
gives the application access to stored data, so data survives a page
refresh. It simulates asynchronous loading of data, which is most likely
how the application will work in production. Most important, it keeps
test data separate from code.

The fixture adapter is built into Ember Data and can be used with just
the following code:

<pre><code class="javascript">App.Store = DS.Store.extend({
  rev: 12,
  adapter: DS.FixtureAdapter
});
</code></pre>

To seed the application with data a ``FIXTURES`` array should be placed
on each of the application's models.

<pre><code class="javascript">App.Project.FIXTURES = [{
  id: 1,
  name: "Test Project 1",
  tasks: [1, 2]
},{
  id: 2,
  name: "Another Project",
  tasks: [3, 4]
}];
</code></pre>

Now inside the application Ember-Data's methods will work as expected.

<pre><code class="javascript">project = App.Project.find(1);
project.get('name'); 
// => "Test Project 1"

projects = App.Project.find();
projects.get('length');
// => 2
</code></pre>

## Back to Projects

Inside the ``ProjectsRoute`` records can be loaded using Ember-Data's
``find()`` function. This allows the route to take the following form.

<pre><code class="javascript">App.ProjectsIndexRoute = Ember.Route.extend({
  model: function() {
    App.Project.find();
  
});
</code></pre>

Once the page is refreshed the fixtures turn into models and
are displayed.

## How the Fixture Adapter works

At this point it is worth explaining how the application actually uses
fixtures. It is very important to know that fixtures do not represent
already loaded data, what fixtures represent is data that your adapter
has access to.

### Loading Records

Specific fixtures can be loaded by id. When ``App.Project.find(1)`` is
called the adapter knows to return the fixture with id 1.

All fixtures can be loaded by calling find with no parameters.
``App.Projects.find()`` will return all fixtures as models.

### Custom Queries

When querying for a subset of records, such as ``App.Project.find({
search: 'test' })``, the fixture adapter has no idea which fixtures to
load. It is up to the developer to implement this logic and that is done
in the ``queryFixtures`` function of the adapter.

<pre><code class="javascript">App.Store = DS.Store.extend({
  adapter: DS.FixtureAdapter.extend({
    queryFixtures: function(fixtures, query, type) {
      // ...
    }
  })
});
</code></pre>

The signature of ``queryFixtures`` is ``queryFixtures(fixtures, query,
type)``.

* ``fixtures``: List of available fixtures.
* ``query``: The hash that was passed into ``find()``.
* ``type``: The model being queried.

The following will have ``App.Project.find({ search: 'test' })`` return
all of the projects whose name matches 'test'. This can be used to
simulate responses from a search service.

<pre><code class="javascript">queryFixtures(fixtures, query, type) {
  if (type == App.Project && query.search) {
    var searchRegex = new RegExp(query.search, "i");
    return fixtures.filter(function(project) {
      return searchRegex.test(project.name);
    });
  }
}
</code></pre>

### Fixture Latency

By default the fixture adapter simulates asynchrony by not returning the
models right away. Instead an object is returned that will later contain
the requested model(s).

<pre><code class="javascript">project = App.Project.find(1)
project.get('name') // => undefined
// wait 50ms
project.get('name') // => "Test Project"
</code></pre>

<pre><code class="javascript">projects = App.Project.find()
projects.get('length') // => 0
// wait 50ms
projects.get('length') // => 2
</code></pre>

The latency time can be changed or completely disabled inside the
adapter.

<pre><code class="javascript">DS.FixtureAdapter.extend({
  simulateRemoteResponse: true,
  latency: 10
});
</code></pre>

The object returned from any of the above ``find`` calls is thenable,
which means promises can be chained onto the queries. This makes event
handling a bit easier to follow.

<pre><code class="javascript">searchResults = App.Project.find({ search: 'test' })
  .then(function(results) {
    console.log(results.get('length') + ' have loaded');
  });
</code></pre>

## Back to Projects

The ``/projects/new`` page is probably the next natural page to follow.
In order to have a page that is responsible for creating new projects a
tempalte, controller, and route will be needed.

The template is going to be a simple form that accepts a name and has a
save button.

<pre><code class="handlebars">&lt;h1&gt;New Project&lt;/h1&gt;

&lt;form {{action save on="submit"}}&gt;
  &lt;div&gt;
    {{input value=name
      placeholder="Name"}}
  &lt;/div&gt;

  &lt;input type="submit" value="Create"&gt;
&lt;/form&gt;
</code></pre>

Because the template calls ``save`` on submit the ProjectsNewController
will need to have a ``save`` function. Once the save completes the
router will transition to a page that shows the project.

<pre><code class="javascript">App.ProjectsNewController = Ember.ObjectController.extend({
  content: null,

  save: function() {
    var project = this.get('content'),
        controller = this;

    project.save().then(function() {
      controller.transitionToRoute('project', project);
    });
  }
});
</code></pre>

And finally a route is needed to setup the controller with a new
project.

<pre><code class="javascript">App.ProjectsNewRoute = Ember.Route.extend({
  model: function() {
    return App.Project.createRecord();
  }
});
</code></pre>

## Back End API Design

If the entire application is prototyped using fixtures then when it
comes to API design very little work is actually needed. The fixtures
will translate nicely to the actual JSON responses the back end service
will be sending. 

<div>
  <div class="left" style="width: 49%;">
    <h3>Fixture</h3>
<pre><code class="javascript">App.Project.Fixtures = [{
  id: 1,
  name: "Test Project",
  tasks: [1, 2]
}];

App.Task.FIXTURES = [{
  id: 1,
  name: "Do this",
  project: 1
},{
  id: 2,
  name: "Do this too",
  project: 1
}];


</code></pre>
  </div>
  <div class="right" style="width: 49%;">
    <h3>JSON Response</h3>
<pre><code class="javascript">{
  project: {
    id: 1,
    name: "Test Project"
    task_ids: [1, 2]
  },

  tasks: [{
    id: 1,
    name: "Do this",
    project_id: 1
  }, {
    id: 2,
    name: "Do this too",
    project_id: 1
  }]
}
</code></pre>
  </div>
  <br style="clear: both;" />
</div>

At this point it is probably best the least amount of effort is put into
designing the API responses. A response that is equivalent to the
fixtures is all that is needed and projects like [Active Model
Serializers](https://github.com/rails-api/active_model_serializers) aim
to do just that with as little code as possible.

[JSONAPI.org](http://jsonapi.org) is also worth taking a look at, it
contains a few proposals for how servers providing a APIs can
communicate JSON in a well defined way. Ember Data's ``RESTAdapter``
plans to follow this specification.

## Switching to Production

When the back end service is built very little code change is needed in
the Ember application. In fact, since the back end is communicating it's
data similar to the fixtures only one line needs to change.

<pre><code class="javascript">App.Store = DS.Store.extend({
  adapter: DS.FixtureAdapter
});
</code></pre>

Turns into

<pre><code class="javascript">App.Store = DS.Store.extend({
  adapter: DS.RESTAdapter
});
</code></pre>

And this is the beauty of the fixture adapter. No code has to change
when thinking of the application in the context of prototyping, testing,
development, or production use.

## Real World Experience

About two months ago I built an Ember application for a startup that
relied very heavily on a  back end service. Of course, when we started
building the Ember application there was no back end for us to use, it
had not been built yet.

Two things started to happen: First, the developers designing the
back end service would constantly want to know how we were expecting the
responses to look. Everything from what keys would be included with each
object to what the entire JSON payload should look like. Second, they
wanted to experiment and change responses, especially normalization, as
time went on.

If the back end developers constantly had to wait for the front end team
to tell them what to include, that would certainly slow down development
of the back end as these questions could go for hours without having a
proper answer. And if the front end developers had to develop against an
API that was constantly changing that would require rewriting code on a
daily basis.

What we used here was the fixture adapter. The back end developers could
check the fixtures in the repository and know exactly how the front end
team wanted the JSON and relationships. The back end developers could break
the API whenever they wanted and once they were happy with how something
worked they would let the front end developers know to update their
fixtures.

This worked out great for both sides, and when it came time to push to
production all we had to do was switch to the ``DS.RESTAdapter`` in the
Ember application and everything magically worked. 
