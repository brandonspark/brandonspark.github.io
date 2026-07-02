+++
title = "Lecture 12 - Exceptions"
path = "exceptions"
template = "onefifty.html"

[extra]
name = "exceptions"
number="12"
url="https://youtube.com/embed/SREtX_MwCTM"
colorscheme="lecture_light_purple"
[[extra.exercises]]
title = "Handling an exception"
prompt = "Define <code>safeDiv : int * int -> int option</code>, which returns <code>SOME (x div y)</code>, or <code>NONE</code> if the division raises <code>Div</code>."
starter = '''
fun safeDiv (x : int, y : int) : int option =
  raise Fail "unimplemented"
'''
solution = '''
fun safeDiv (x, y) = SOME (x div y) handle Div => NONE
'''
tests = [
  { name = "ordinary division", expr = "safeDiv (7, 2) = SOME 3" },
  { name = "division by zero", expr = "safeDiv (1, 0) = NONE" },
  { name = "negative floor division", expr = "safeDiv (~7, 2) = SOME ~4" },
]

[[extra.exercises]]
kind = "choice"
title = "Which handler catches it?"
prompt = "What does this expression evaluate to?<pre><code>((raise Div) handle Match => 1) handle Div => 2</code></pre>"
choices = [
  "1",
  "2",
  "It raises <code>Div</code> uncaught",
  "It does not typecheck",
]
answer = 1
explain = "A <code>handle</code> only catches exceptions its patterns match. The inner handler is looking for <code>Match</code>, so <code>Div</code> sails through it and propagates outward — where the outer handler matches it and produces 2."
+++

We have so far described three behaviors that are allowed of a legal SML program --
it may either evaluate to a value, loop forever, or raise an exception. While we have
been brief on the last of these three, it is a useful language mechanism for
dealing with cases where we do not necessarily desire to give back a value.

In this lecture, we learned that {{ emph(s="exceptions") }} are values of a type
called `exn`, which enjoys the property of {{ emph(s="extensibility") }}, in that
constructors may be added to it dynamically, via using the `exception` keyword.

These include common exceptions such as `Bind`, `Div`, and `Match`, but also
custom exceptions, which may be defined to take in information in the form of
other values, much like other constructors. This is useful, because exceptions
may also be {{ emph(s="handled") }} via the `handle` keyword, which allows us to
recover from potentially-fatal errors at a different location.

This is both useful for error recovery, and for nuanced control flow. We saw
that using this, we were able to write functions in an {{
emph(s="exception-handling style") }}, which resembled the form of
continuation-passing style code.