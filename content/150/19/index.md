+++
title = "Lecture 19 - Imperative Programming"
path = "imperative"
template = "onefifty.html"

[extra]
name = "imperative"
number="19"
url="https://youtube.com/embed/x49LBQzRt80"
colorscheme="lecture_grey"
+++

The whole semester, we have been dealing in the pure fragment of SML, which acts
much like a purely functional programming languge. SML is not, however, a purely
functional language, as it actually has imperative features that we have been
avoiding, up until this lecture.

Mutability is a problem, but generally moreso when it is used unrestrictedly. We
favor the style of *immutability by default*, which simply entails avoiding
mutability, and defaulting to immutability, rather than going so far as to
forbid mutability entirely. This allows us the strength of functional
programming, without necessarily completely shutting ourselves out from
convenience when necessary.

We achieve this in SML by the `t ref` type, which is a type of {{
emph(s="mutable boxes") }} storing values of type `t`. The key takeaway is that
these boxes may remain the same, but the contents of the boxes can change. We
went over the `!`, `ref` and `:=` functions, which allow us to interface with
these boxes.

Mutability can break some of our nice notions of purity and extensional
equivalence, but can be a convenient tool in small doses.