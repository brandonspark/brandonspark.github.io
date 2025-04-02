+++
title = "Lecture 12 - Exceptions"
path = "exceptions"
template = "onefifty.html"

[extra]
name = "exceptions"
number="12"
url="https://youtube.com/embed/SREtX_MwCTM"
colorscheme="lecture_light_purple"
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