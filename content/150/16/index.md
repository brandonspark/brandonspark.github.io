+++
title = "Lecture 16 - Red-Black Trees"
path = "redblack"
template = "onefifty.html"

[extra]
name = "redblack"
number="16"
url="https://youtube.com/embed/csS1WNGTEFc"
colorscheme="lecture_dark_red"
+++

A key motivation given for SML's module system is in its treatment of {{
emph(s="abstract types") }}, where we can have modules which contain types whose
definitions are not known, which forbids users from creating invalid instances
of values of that type. This is especially useful when dealing with data
structures with inner invariants, which could cause unsafe behavior when those
invariants are broken.

A classic example of a data structure with invariants is a binary search tree,
which maintains an ordering invariant on its keys. A stronger example still is
that of the {{ emph(s="self-balancing binary tree") }}, which is a binary search
tree which maintains rough balance (and thus $O(\log n)$ complexity operations)
via disciplined use of invariants. This includes {{ emph(s="red-black trees") }}.

We saw that red-black trees employ three main invariants, which involve keeping
a color for each node in the tree. We discussed the theory behind why these
invariants would preserve efficient lookup and insertion, and devised a scheme
for preserving the invariants by briefly breaking them, and then restoring them
again.

This provided another strong example for the efficacy of reasoning via
specification, as by fixing a specification that contained desirable properties,
and then focusing solely on incrementally maintaining that specification, we
were able to implement our desired data structure. Via our usage of modules,
these invariants also have the extremely strong property that they can never be
broken via a consumer of the library.