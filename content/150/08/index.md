+++
title = "Lecture 8 - Polymorphism"
path = "poly"
template = "onefifty.html"

[extra]
name = "poly"
number="08"
url="https://youtube.com/embed/kQ9Zo7bbIWA"
colorscheme="lecture_red"
+++

This semester, we have been type-annotating all of our declarations and
functions, which gives them a concrete type that we can them use them at.

In general, however, some functions that we write have the property that
they could be used more generally than we annotate them to be. For instance,
we can write the `length : int list -> int` function, but if not for
the fact that we specified it to be for `int list`s, there's no reason why
it should not also be able to be used for `string list`s.

This lecture explores that idea by introducing {{ emph(s="parametric
polymorphism") }}, which is a language feature in SML that allows {{
emph(s="polymorphic types") }} which makes use of {{ emph(s="type variables")
}}, which allow a given value to be used at multiple different types. This
allows us the power of writing code which can be used *generically*, without
needing to constrain it to particular use cases.

Our ability to make use of polymorphic types is also greatly aided by the
fact that Standard ML can perform {{ emph(s="type inference") }}, which allows
it to determine the types of expressions, without any annotations needed. Type
annotations turn out to actually be totally optional, which allows us to
take full power of the SML type system.

We finished off the lecture by discussing {{ emph(s="parameterized types") }},
such as the `list` type constructor, which allow us to create types from arbitrary
other types. We also implemented a generic `sort` function, which achieved a
polymorphic type by taking in a function, which was itself a generic comparison
function.
