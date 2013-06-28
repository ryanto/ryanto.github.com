---
title: Using Rake Pipeline to Build Ember Applications
published: false
---

When writing single page applications in JavaScript you'll often find
yourself with a large number of files such as models, views,
controllers, templates, and third party libraries. Including each of
these files with their own script tags quickly becomes unmaintainable.

This is where asset complication comes in. All of your files will be
concatenated into a single JavaScript file - meaning you'll only need
one script tag on your page and your entire application can be
downloaded in a single HTTP request. Other benefits of using static
asset complication include minification, ordering of third party
dependencies, and wrapping objects inside of their own closures.

READMORE

This post will be a guide for using the rake asset pipeline (called
rakep), which is a common choice among Ember.js developers. Rake
pipeline serves your files from a local server when in development mode.
When preparing to push to production you can use rakep to compile your
assets into a single file that can be committed to your repository.

## Setting Up

You'll need to install Ruby in order to use Rake Pipeline. Don't
worry, on most systems installing ruby is very easy. I would recommend
installing [RVM](https://rvm.io/) to help manage your Ruby installs.

* Once you have RVM installed it is probably best to install the latest
  Ruby. ``rvm install ruby`` and ``rvm use ruby`` will take care of
  that for you.
* Create a ``Gemfile`` in the root your project. A Gemfile lets the
  defines and installs all of the dependencies your project will need.
  [Use this Gemfile to get started]().
* Install everything by running ``bundle install`` in your project root.

## Using Rake Pipeline

Rake Pipeline uses filters to transform your projects files into a final
compiled application. You can think of each filter as a step in the
transformation process. There is a filters for concatenation,
uglification, compilation, and so on.

Before using any filters you should create an ``Assetfile`` in your
project's root directory. This is the file that will tell Rake Pipeline
how to build your application.

Lets explore a simple filter that comes pre-packaged. The ``concat``
filter will concatenate all JavaScript files in a single directory into
one file. For example all of the ``*.js`` files in the app directory
will be concatenated into ``complied-app/app.js``. 

<pre><code class="ruby">output "compiled-app"
input "app" do
  match "&#042;&#042;/&#042;.js" do
    concat "app.js"
  end
end
</code></pre>

There are many more filters that come with the [Rake
Pipeline](https://github.com/livingsocial/rake-pipeline) project. There
are also a number of great filters for most web development stacks that
come as part of the [Rake Pipeline Web
Filters](https://github.com/wycats/rake-pipeline-web-filters) project.
It is also very easy to write your own filters, which we will explore
later.

### Development Mode

Running ``bundle exec rakep server`` will start an HTTP development
server. This creates a web server on port 9292 that will serve your
compiled files. Rake Pipeline will process and serve your files with
each request. 

If we want to see our concatenated JavaScript files we can visit:
``http://localhost:9292/compiled-app/app.js``. 

Whenever a change to one of our files occurs Rake Pipeline will process
that change during the next request to the server. This means that we
never have to worry about recompiling our application as we make changes
to the source code.

### Serving your Application

Rake Pipeline will compile and serve all of the JavaScript, but what
about the rest of the application. There any many files, like images and
HTML, that do not need to be compiled, but are still needed for the
application to function correctly.

We will pass all of these files through Rake Pipeline, but we will not
modify or compile them in any way. In order to do this a simple ``copy``
filter can be used.

<pre><code class="ruby">output "compiled-app"
input "app" do
  match "index.html" do
    copy
  end

  match "images/&#042;&#042;/&#042;.png" do
    copy
  end
end
</code></pre>

Now when visiting ``http://localhost:9292/`` our index HTML file is
served.

### Proxy Passing Backends

While the above will serve all the files needed for a single page
application it does not take any requests to the backend service into
account.  For example, the JavaScript may want to make an AJAX request
to ``/api/resource/1``, we need to make sure Rake Pipeline will redirect
that request to the approiate service.

In order to do this a simple web service will be created with Ruby's
rack. In the root of your directory create a file called ``config.ru``
and make sure it contains the following.

<pre><code class="ruby">require 'rake-pipeline'
require 'rake-pipeline/middleware'
require "rack/streaming_proxy"

use Rack::StreamingProxy do |request|
  if request.path.start_with?("/api")
    "http://localhost:3000/#{request.path.sub("/api", "")}"
  end
end

use Rake::Pipeline::Middleware, Rake::Pipeline::Project.new("Assetfile")
run Rack::Directory.new('./')
</code></pre>

The above will forward all requests that being with ``/api`` over to a
server listening on localhost:3000. All other requets will be served
with Rake Pipeline.

## Building Large JavaScript Applications

When building larger JavaScript applications we will need more than the
concat and copy filters. We will need filters for processing a project's
classes, templates, sass/stylesheets, and third party libraries.

The following will be a guide to this
[Assetfile](https://github.com/ryanto/ryanto.github.com/blob/master/Assetfile).

### Wrap JavaScript in Minispade

We will wrap all of our Ember classes in a minispade closure. There are
a number of benefits to using minispade, such as:

* Very easy to require dependencies. If class ``Car`` depends on class
  ``Vehicle`` minispade will make sure that Vehicle is defined before
  defining Car.
* We can delay execution of JavaScript. This means that although we are
  downloading all of our JavaScript files with the first request, we can
  delay their execution to a later time.

Our Assetfile should look like this if we want to wrap every JavaScript
file inside of ``app/`` in a minispade closure.

<pre><code class="ruby">output "compiled-app"

input "app" do
  match "&#042;&#042;/&#042;.js" do
    minispade(
      :rewrite_requires => true, 
      :string => false, 
      :module_id_generator => Proc.new { |input|
        input.path.dup.sub(/\.js$/, '')
       }
    )
  end
end
</code></pre>

In order to load one of our classes we would need to use the require
function. So for example: 

<pre><code class="javascript">/* app/models/vehicle.js */
App.Vehicle = Ember.Object.extend()
</code></pre>

<pre><code class="javascript">/* app/models/car.js */
require('models/vehicle');
App.Car = App.Vehicle.extend();
</code></pre>

Minispade has a ``requireAll`` function that will include any files that
match a ``RegExp`` object. If we wanted to load all of our models the
following would work.

<pre><code class="javascript">minispade.requireAll(new RegExp('models/.&#042;'));</code></pre>

### Handlebars Templates

Writing handlebar templates inside of script tags is really nice for
sharing small code snippets and examples, but is a nightmare to maintain
in a large application. We can write our templates as individual
handlebars files and have Rake Pipeline turn them into the actual
JavaScript that Ember can use.

A template is going to be a file that is in the ``app/templates``
directory (including sub-directories) and has a ``.handlebars``
extension. For example ``app/templates/post.handlebars`` and
``app/templates/post/edit.handlebars`` would be valid templates.

Templates names will be based on the path and filename.

* ``lib/templates/post.handlebars`` will compile to ``post``
* ``lib/templates/post/edit.handlebars`` will compile to ``post/edit``

The following filter will convert our handlebar files into actual usable
templates within our Ember application.

<pre><code class="ruby">output "compiled-app"
input "app" do
  match "templates/&#042;&#042;/&#042;.handlebars" do
    handlebars :key_name_proc => Proc.new { |input| 
      input.path.\
        gsub(/\.handlebars$/, '').\
        gsub(/^templates\//, '')
    }
  end

  match "&#042;&#042;/&#042;.js" do
    concat "app.js"
  end
end
</code></pre>

Now inside of our views we could reference these templates by their names. 

<pre><code class="javascript">App.PostEditView = Ember.View.extend({
  templateName: "post/edit"
});
</code></pre>

### Stylesheets and SCSS

Stylesheets, SCSS, and Sass are incredibly easy to compile with Rake
Pipeline. Here is a filter that will compile and concatenate any of the
applications scss into ``compiled-app/app.css``.

<pre><code class="ruby">output "compiled-app"
input "app" do
  match "&#042;&#042;/&#042;.scss" do
    sass
    concat "app.css"
  end
end
</code></pre>

### Third Party Code

Third party libraries, like jQuery and Ember, can be compiled into a
single JavaScript file in order to cut down on HTTP requests. For these
libraries we will use a special concatenation filter that considers
ordering. This is because jQuery and Handlebars will need to be loaded
before Ember.

This filter will concatenate the following files in ``libs`` into
``compiled-app/libs.js``.

<pre><code class="ruby">output "compiled-app"
input "libs" do
  match "&#042;&#042;/&#042;.js" do
    filter(
      Rake::Pipeline::OrderingConcatFilter, 
      [
        "jquery.js", 
        "handlebars.js",
        "ember.js",
      ], 
      "libs.js"
    )
  end
end
</code></pre>

If there are any files in ``libs`` that are not explicitly passed into
the filter they will be concatencated last. If you look in the
thirdparty directory ``minispade.js`` is a good example of this.

It is important to note that **anything** in the third party directory
will be compiled into thirdparty.js. So do not leave multiple versions
of jQuery or Ember sitting around there.

## More Filters

There are more filters that are available, such as a coffee script
compiler, uglifyer, and cache buster. Many of these [filters come
included with
Rake-Pipeline-Web-Filters](https://github.com/wycats/rake-pipeline-web-filters/).

## Our Own Filters

So far we have only used the filters that come with Rake Pipeline or the
Rake Pipeline Web Filters. We can create our own filters quite easily.
All a filter needs to function is a ``generate_output`` method. This
method will take a list of inputs and write some data to a piece of
output.

Lets create a filter that will turn some YAML based configuration files
files into JSON.

<pre><code class="ruby">class Yaml2JSON < Rake::Pipeline::Filter
  def initialize
    # convert .yaml extension to .js
    super(&proc { |input| input.sub(/\.yaml$/, '.js') })
  end

  def generate_output(inputs, output)

    inputs.each do |input|
      name = File.basename(input.path)
      json = input.read.to_json
      output.write "#{name} = #{json};"
    end

  end
end
</code></pre>

To apply this filter to a group of files we would do:

<pre><code class="ruby">output "compiled-app"
input "app" do
  match "&#042;&#042;/&#042;.js" do
    filter YamlToJSONFilter
    concat "app.js"
  end
end
</code></pre>

Now when we view ``compiled-app/app.js`` we will see our YAML files
represented as JavaScript objects.

## Production

When we ship applications off to production we will want to often do
some additional processing. For example, to cut down on file size we can
minify our JavaScript code. We don't do this in development mode,
because it makes debugging difficult.

Using an environmental variable, ``RAKEP_MODE``, we can change which
filters are applied. When we are ready to compile production code we can
execute the following from command line.

``RAKEP_MODE=production bundle exec rakep build``

Note that ``rakep build`` will simply compile all of our files and exit. 

To deal with minification in only production mode we can add the following to our Assetfile.

<pre><code class="ruby">require "uglifier"

output "compiled-app"
input "app" do
  match "&#042;&#042;/&#042;.js" do
    if ENV['RAKEP_MODE'] == "production"
      uglify
    end
    concat "app.js"
  end
end
</code></pre>

## Full Examples

TODO
