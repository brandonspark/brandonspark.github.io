+++
title = "Lecture 15 - Functors"
path = "functors"
template = "onefifty.html"

[extra]
name = "functors"
number="15"
url="https://youtube.com/embed/2d5-DdZyRDE"
colorscheme="lecture_dark_orange"
+++

This lecture continues our exploration of the SML module system, by introducing
the idea of {{ emph(s="functors") }}, which are simply module-level functions
which take in structures and produce other structures.

We motivated this idea by trying to implement a structure for polymorphic
dictionaries, which are dictionaries that can map from keys of arbitrary (but fixed)
type to values of also arbitrary type. To do this, we required taking in a
comparison function to order the keys, but this ended up producing unsafe behavior
in the event that this comparison function was used erroneously.

We found that a safer approach was to parameterize our structure on a {{
emph(s="type class") }} `ORD`, which describes structures of types that have
included comparison functions. By defining it according to a singular instance
of the `ORD` type class, we were able to then translate the code into a functor,
which assumed the type class as an argument.

We then saw that we could reuse the same dictionary-creating code for many
different type classes, at minimal extra burden. This demonstrates the power of
functors, which allow us to parameterize software components based on other
software components in a well-specified way.