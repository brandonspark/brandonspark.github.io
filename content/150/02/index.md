+++
title = "Lecture 2 - Equivalence, Binding, and Scope"
path = "equivalence"
template = "onefifty.html"

[extra]
name = "equivalence"
number="02"
url="https://youtube.com/embed/QTXrbizKQOs"
colorscheme="lecture_purple"
+++

Following the first lecture, this lesson went into more about
the evaluation model of SML.

In the first lecture, we talked about the difference between
functional and imperative languages in the former's lack of
{{ emph(s="state") }}, which involves the mutation of a
variable to have multiple different values over time.

We explored the idea of {{ emph(s="binding") }}, which distinguishes
variable declarations in SML from variable declarations in an imperative
language, in that **bound variables never change**. Instead, they may
be {{ emph(s="shadowed") }}, which simply introduces a new, unrelated
variable that happens to be named the same.

We then looked more examples of SML code, using the mechanism of
{{ emph(s="pattern matching") }}, which lets us decompose more complex
values, like tuples, into their constituent components.

To wrap up the lecture, we discussed the concept of {{ emph(s="extensional
equivalence") }}, which allows us to perform analysis of code in the same way
that one might reason about an algebraic equation (also called {{
emph(s="equational reasoning") }}). We applied this to a small example, and
saw how simple algebraic reasoning can greatly help us simplify our code.
