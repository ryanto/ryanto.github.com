---
title: PHP Dependency Injection
published: false
---

Dependency injection is the answer to more maintainable, testable,
modular code.

READMORE

Every project has dependencies and the more complex the project is the
more dependencies it will most likely have. The most common dependency
in today's web application is the database and chances are if it goes
down the application will all together stop working. That is because
the code is dependent on the database server, which is perfectly fine. 
Not using a database server because it could one day crash is a bit
ridiculous. Even though the dependency has its flaws, it still makes
life for the code, and thus the developer, a lot easier.

The problem with most dependencies is the way that code handles and
interacts with them. What I really mean is the problem is in the code
and not the dependency. If you are not using dependency injection,
chances are your code looks something like this:

<pre><code class="php">class Book {

  public function __construct() {

    $registry  = RegistrySingleton::getInstance();
    $this-&gt;_database = $registry-&gt;database;

    // or

    global $databaseConnection;
    $this-&gt;_database = $database;
  }

}
</code></pre>

The book object now is given full access to the database once it is
constructed. That is good, the book needs to be able to talk to the
database and pull data. The problem lies in the way the book gained its
access. In order for the book to be able to talk to the database the
code must have an outside variable named $database, or worse, it must
have a singleton pattern class (registry) object containing a record for
a database connection. If neither of these exist the book fails, making
the code far from modular.

This raises the question, how exactly does the book get access to the
database?  This is where inversion of control comes in.

In Hollywood a struggling actor does not call up a director and ask for
a role in his next film. No, the opposite happens. The director calls
up the actor and asks him to play the main character in his next movie. 
Objects are struggling actors, they do not get to pick the roles they
play, the director needs to tell them what to do. Objects do not get to
pick the outside systems they interact with, instead, the outside
systems are given to the objects. Remember this as Inversion of
Control.

This is how a developer tells his objects how to interact with outside
dependencies:

<pre><code class="php">class Book {

  private $_databaseConnection;

  public function __construct() { }

  public function setDatabaseConnection($databaseConnection) {
    $this-&gt;_databaseConnection = $databaseConnection;
  }

}
</code></pre>

<pre><code class="php">$book = new Book();
$book-&gt;setDatabase($databaseConnection);
</code></pre>

This code allows for the book class to be used in any web application. 
The Book is no longer dependent on anything other than the developer
supplying a database shortly after object creation.

This is, at its finest, dependency injection. There are two common ways
of injecting dependencies. The first being constructor injection and
the second being setter injection. Constructor injection involves
passing all of the dependencies as arguments when creating a new
object. The code would look something like this:

<pre><code class="php">$book = new Book($databaseConnection, $configFile);
</code></pre>

There are some issues with constructor injection. First, the more
dependencies a class has the messier the constructor becomes. Passing
in three or four dependencies all in a constructor is extremely hard to
read. Also, the less work a constructor does the better.

This leaves us with our second method of dependency injection, setter
injection. A dependency is set by using a public method inside the
class.

<pre><code class="php">$book = new Book();
$book-&gt;setDatabase($databaseConnection);
$book-&gt;setConfigFile($configFile);
</code></pre>

This is easy to follow, but it leads writing more and more code for your
application. When a book object is created three lines of code are
required. If we have to inject another dependency, a 4th line of code
is now needed. This gets messy quickly.

The answer to this problem is a container, which is class that is
designed to hold, create, and inject all the dependencies needed for an
application or class. Here is an example:

<pre><code class="php">class Container {

  public static $_database;

  public static function makeBook() {

    $book = new Book();
    $book-&gt;setDatabase(self::$_database);
    // more injection...

    return $book;
  }

}
</code></pre>

And then:

<pre><code class="php">$book = Container::makeBook();
</code></pre>

All dependencies should be registered into the container object during
run time. This object is now the gateway that all dependencies must
pass through before they can interact with any classes. This is the
dependency container.

The reason makeBook is a public static function is for ease of use and
global access. When I started this article off I made a reference to
the singleton pattern and global access being a poor choices of code. 
They are, for the most part. It is bad design when they control access,
but it is perfectly ok when they control creation. The makeBook
function is only a shortcut for creation. There is no dependency
what-so-ever between the book class and the container class. The
container class exists so we can contain our dependencies in one
location and automatically inject those dependencies with one line of
code creation.

The container class removes all of the extra work of dependency
injection.  

Before injection:

<pre><code class="php">$book = new Book();
</code></pre>

And now:

<pre><code class="php">$book = Container::makeBook();
</code></pre>

Hardly any extra work, but tons of extra benefits.

When test code is run, specifically unit tests, the goal is to see if a
method of a class is working correctly. Since the book class requires
database access to read the book data it adds a whole layer of
complexity. The test has to acquire a database connection, pull data,
and test it. All of a sudden the test is no longer testing a single
method in the book class, it is now also testing database. If the
database is offline, the test would fail. This is far from the goal a
unit test.

A way of dealing with this is just using a different database dependency
for the unit tests. When the test suite starts up a dummy database is
injected into the book. The dummy database will always have the data
the developer expects it to have. If a live database was used in a unit
test the data could potentially change causing tests to unnecessarily
fail.  

The code is more modular because it can dropped into any other web
application. Create the book object and inject a database connection
with ``$book-&gt;setDatabase()``.  It does not matter if the database is in
Registry::Database, $database, or $someRandomDatabaseVarible. As long
as there is a database connection the book will work inside any system.

The code is more maintainable because each object is given exactly what
it needs. If separate database connections are required between
different instances of the same class then there no extra code needed
inside the class what-so-ever. Give book1 access to database1 and book2
access to database2.

<pre><code class="php">Container::$_database = $ourDatabaseVarForDB1;

$book1 = Container::makeBook();
$book2 = Container::makeBook();
$book2-&gt;setDatabase($database2);
</code></pre>

Dependency injection really is the answer to more maintainable,
testable, modular code.

<hr>

I titled this article PHP Dependency Injection, but there is really
nothing in here that is specific to PHP. The reason I choose to include
PHP and write all of the code examples in PHP is because I constantly
see PHP projects not using DI. I believe the best place to teach good
coding practices is in popular frameworks by forcing the users of the
framework to develop within the guidelines of a certain pattern. Take
MVC for example, nowadays all developers understand it and most of the 
underlying principles that accompany it. This is because the frameworks
they use force them to use MVC.

Also, please note that the code samples used in this article are just
really simple examples to show the nuts and bolts of dependency
injection and inversion of control. If you wish to implement injection
into your project please take a look at an already built <a
href="http://www.potstuck.com/2010/09/09/php-dependency-a-php-dependency-injection-framework/">dependency
injection framework</a>.
