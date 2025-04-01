+++
title = "Lecture 4 - Structural Induction and Tail Recursion"
path = "structural"
template = "onefifty.html"

[extra]
name = "structural"
number="04"
url="https://youtube.com/embed/BlOKPMMCiNM"
colorscheme="lecture_green"
+++

Simple induction on the natural numbers can get us reasonably far
when it comes to proving theorems, but in this class we are also
interested in proving theorems on SML code, not just for mathematical
propositions. In such cases, we would like to be able to induct on
the structure of data, which leads us to a phenomenon known as
{{ emph(s="structural induction") }}, a more powerful, more general
form of induction.

We saw how we could employ structural induction to induct on the structure of a
list, by proving a base case and inductive case, using the principle of
structural induction for lists. This is similar to the principle of simple
induction for natural numbers, which involves a base case and inductive step of
$n$ and $n+1$, but instead operates on SML lists in the cases of `[]` and
`x::xs`.

We then introduced the concept of {{ emph(s="tail recursion") }}, which concerns
recursive functions which perform a recursive call, as the last thing that they
do. We saw that these have implications for efficiency benefits, because by not
needing to remember to do things after the recursive call, we avoid needing to use
excess memory, and we applied this knowledge to write the tail-recursive version
of the `length` function, in `tlength`.