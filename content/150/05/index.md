+++
title = "Lecture 5 - Trees"
path = "trees"
template = "onefifty.html"

[extra]
name = "trees"
number="05"
url="https://youtube.com/embed/2s1o_oqcEHI"
colorscheme="lecture_pink"
+++

Like lists, trees are immensely important data structures in computer science.
In this lecture, we saw how we could formulate trees in SML using a new language
feature of {{ emph(s="datatype declarations") }}, which allow us to create brand
new types, with their own constructors.

We then explored the idea of different kinds of {{ emph(s="tree traversals") }},
which are prescribed ways to traverse the nodes of a binary tree, and which
also admit a simple recursive implementation in SML.

To prove theorems on trees, we saw that we also can derive a principle of
structural induction on trees, which differs from that of lists in that it
involves assuming two induction hypotheses -- one for the left subtree, and one
for the right. We then used this technique to prove a theorem showing the
equivalence of summing the elements of a tree by first turning it into a list,
and by summing the elements of the tree directly.

This lecture also introduced the idea of {{ emph(s="totality citations") }},
which are an important part of ensuring that our proofs on SML code remain accurate.

We finished off by discussing the `order` type, which is a type with three constructors,
corresponding to the output of a comparison function. We saw how using a new type
explicitly for this purpose is more robust than other methods, like using an `int` or
a `string`. This represents a core benefit of a functional language like SML, which lets
us design our types to fit our use cases faithfully.