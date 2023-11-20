+++
title = "Lecture 11 - Continuation-Passing Style"
path = "cps"
template = "onefifty.html"

[extra]
name = "cps"
number="11"
url="https://youtube.com/embed/0-h8bwNXaTc"
colorscheme="lecture_blue"
+++

So far in this course, we have used accumulators as tools to implement
functions which are tail recursive, by storing our intermediate computations
in an extra argument to the function in question, as we recurse.

{{ emph(s="Continuation-passing style") }} is a natural extension of accumulation,
where instead of using an accumulator of a type like `int`, the accumulator is a
function which represents the *work left to do* by the function. This allows us
to store *computations* in our accumulator argument, called the {{ emph(s="continuation") }}, and discharge them all at a later time.

Philosophically, continuation-passing style can be seen as contrasting to
direct-style recursion by noting down instructions of what instructions to execute,
rather than executing instructions themselves and storing the results in the
accumulator. These end up being spiritually the same information, but having
slightly different implications for implementation.

We saw that we could use continuation-passing style to make the control flow of
our programs extremely clear, and implement backtracking and doubly-recursing
functions easily via using them. Written in such a way, these programs have a
more explicit evaluation order, and rely less on implicit evaluation rules.