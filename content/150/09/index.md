+++
title = "Lecture 9 - Higher-Order Functions"
path = "hofs"
template = "onefifty.html"

[extra]
name = "hofs"
number="09"
url="https://youtube.com/embed/c78ypORDm0Q"
colorscheme="lecture_turquoise"
+++

We have so far learned that values can be passed into functions and returned
from functions, even complex values such as constructors of a variant type,
or tuples. One core idea in this class is that {{ emph(s="functions are values") }},
which by transitivity implies that functions can be given as arguments to functions
and returned from functions.

This is an idea which gives rise to {{ emph(s="currying") }} and {{ emph(s="higher-order functions") }}, which describe functions which do both of these
things. In the last lecture, we exploited the latter to write a generic sorting
function, which could be instantiated with any comparison function to achieve
a sort for that particular relation.

Higher-order functions give us an idea of parameterizing our code over other
code -- viewed in this way, we can write functions which can vary their behavior
based on the behavior of their arguments. This ends up being very powerful for
the purpose of eliminating boilerplate, as we can then write functions which
abstract over common patterns in our code, and lead to simpler code overall.