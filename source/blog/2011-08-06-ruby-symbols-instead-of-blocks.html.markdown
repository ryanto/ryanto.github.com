---
title: Ruby Symbols Instead of Blocks
cover: cover.png
published: false
---

Every wonder why this works? It's straight forward and easy to read, but how
does it work internally in Ruby?

READMORE

## Meet &

The ``&`` operator in Ruby lets us go from Proc to block and vise-versa, but only
in certain places.

In fact, there are two two places where we can use ``&``:

In a method definition ``&blk`` will turn the block argument into a proc,
allowing it to be called.

<pre><code class="ruby">def block_to_proc(&blk)
  blk.call
end
block_to_proc { "hello" }
# => "hello"
</code></pre>

And in a method call it coverts the argument into a block.

<pre><code class="ruby">def proc_to_block
  yield
end
proc_to_block(&proc { "hello" })
# => "hello"
</code></pre>

## To Proc

Ruby has a lot of ``to_X`` methods. They are designed to express their receiver
as another type. For example ``String#to_i`` converts strings into integers. 

<pre><code class="ruby">"1".to_i + 2
# => 3
</code></pre>

Well, ``to_proc`` exists too. Expressing non proc objects as procs? When and
why would we ever do that? An example is our ``prices.reduce(&:+)`` piece. A
quick, simple, and shorthand way to express ``+`` without having to write out
``proc { |number| self + number }``.

Anytime we are trying to express an object as a proc Ruby will check to see if
that object responds to ``to_proc``. If it does it will use the return value to
express the object as a proc. Since ``&object`` can covert procs to blocks the
``&`` is going to need the object to first be proc before it does anything. In
other words, ``&object`` is just shorthand for be ``&object.to_proc``.

## Symbol's To Proc

Symbol's ``to_proc`` is what allows us to pass it in place of a block. It
might look a little strange at first, but once you see it used it becomes
pretty cool.

<pre><code class="ruby">
class Symbol
  def to_proc
    proc { |obj, *args| obj.send(self, *args) }
  end
end
</code></pre>

This returns a proc that takes 2 parameters

* First is an object that will receive the method.
* The second is the arguments that will be passed into the method.

And when that proc is called

* Sends the original symbol to the object with the arguments.

This means that ``:methods.to_proc`` will be the equivalent to the following.

<pre><code class="ruby">def methods_to_proc(obj)
  obj.send(:methods)
end
</code></pre>

This results in:

<pre><code class="ruby">my_little_proc = :methods.to_proc
# my little proc is ready to call :methods on any object

my_little_proc.call(String)
# => returns an array all of String's methods
</code></pre>

## The Setup

Now we're going to be creating a proc from a symbol that can be used to send
that symbol into any object. In fact, a more fitting name for ``my_little_proc``
would be something like ``call_my_symbol_on``.

<pre><code class="ruby">class String
  def introduce
    puts "Hi I'm #{self}"
  end

  def introduce_to name
    puts "Hi #{name}, I'm {self}"
  end
end

call_my_symbol_on = :introduce.to_proc
call_my_symbol_on("ryan")
# => "Hi I'm ryan"
</code></pre>

Since the proc that ``to_proc`` returned is allowed to take arguments.

<pre><code class="ruby">call_my_symbol_on = :introduce_to.to_proc
call_my_symbol_on("ryan", "steve")
# => "Hi steve, I'm ryan"
</code></pre>

If you think about it, this is really simple. ``call_my_symbol_on`` is just
going to call ``introduce_to`` because we used ``:introduce_to`` to
create it on the first parameter. It is going to send any additional
parameters as arguments.

## With Map

Ok, lets get to the real world examples. We often see ``to_proc`` commonly
used with an enumerable. Lets say we want to introduce a bunch of names.

<pre><code class="ruby">['ryan', 'steve', 'jill'].map(&:introduce)
# => Hi I'm ryan
# => Hi I'm steve
# => Hi I'm jill
</code></pre>

Is really:

<pre><code class="ruby">['ryan', 'steve', 'jill'].map(&:introduce.to_proc)
</code></pre>

Which can be expressed as:

<pre><code class="ruby">['ryan', 'steve', 'jill'].map( 
  & proc{ |obj, *args| obj.send(:introduce, *args) } 
)
</code></pre>

And & is now going to covert that proc into a block. That line can now become:

<pre><code class="ruby">['ryan', 'steve', 'jill'].map do |obj, *args| 
  obj.send(:introduce, *args)
end
</code></pre>

And since map only passes one argument, the element, to its block there
is really no need to express the additional arguments:

<pre><code class="ruby">['ryan', 'steve', 'jill'].map do |obj| 
  obj.send(:introduce)
end
</code></pre>

Which just is sending the message ``introduce`` our object, the
same as:

<pre><code class="ruby">['ryan', 'steve', 'jill'].map do |obj| 
  obj.introduce
end
</code></pre>

You can see that by expanding and reducing the ``&:symbol`` notation we can
end up with a very familiar map and block. 

## Now with some *Args

So what about ``*args``? We were able to drop it because map only
expects a block that will yield to one element. We need to find a common
Ruby method that yields more than one argument to a block.

How about ``inject``? Its block expects two parameters, result and
element.

``Enumerable.inject(start) { |result, element| ... }``

Lets do what we did above, expand the ``&:+`` notation.

<pre><code class="ruby"># turn
(1..10).inject(&:+)

# into
(1..10).inject do |result, element| 
  result + element
end
</code></pre>

Here we go

<pre><code class="ruby">(1..10).inject(&:+)
(1..10).inject(&:+.to_proc)

# can be expressed as

(1..10).inject( &proc{ |obj, &#42;args| obj.send(:+, &#42;args) } ) 

# which & will covert into

(1..10).inject( |obj, &#42;args| obj.send(:+, &#42;args) } ) 

# which we can convert to

(1..10).inject do |obj, &#42;args| 
  obj.send(:+, &#42;args) 
end

# and then we can just rename our parameters to something more friendly

(1..10).inject do |result, element| 
  result.send(:+, element) 
end

# => 55
</code></pre>
