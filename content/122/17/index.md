+++
title = "Lecture 17 - Sequences"
path = "seq"
template = "onefifty.html"

[extra]
name = "seq"
number="17"
url="https://youtube.com/embed/Y9YuN4Aw3LE"
colorscheme="lecture_yellow"
+++

We have discussed the importance of parallelism several times thus far in the
course, and even conducted mathematical analysis of time complexity in the
presence of parallelism, but so far given a limited selection of
parallel-friendly data structures. Our go-to data structure for parallelism
purposes is the tree, as the list is an inherently sequential data structure,
but it doesn't need to be the only one.

In this lecture, we introduced {{ emph(s="sequences") }}, which are essentially
immutable arrays. They are fixed-size lists that admit constant-time access to
any given element, which is a very strong property that allows us to have nice
parallel operations. For instance, mapping a function onto a sequence can be done
faster than $O(n)$ in the length of the sequence, as each cell can be done at the
same time, whereas on a list it is bottlenecked to be at least linear, due to
needing to traverse to the end of the list.

We walked through the sequence library, which provided many familiar list
functions, albeit on sequences. We also discussed the theory of {{ emph(s="cost
graphs") }}, which are a mathematical tool that we can use to analyze the time
complexity of nested sequence operations.

While sequences are useful, they are generally better for bulk operations when
the number of elements is known ahead of time. For serial operations involving
singular elements, lists tend to be better. Sequences are overall an interesting
application of a module with an abstract interface, as well as a nice case study
of how we can obtain the benefits of imperative structures like arrays, without
compromising immutability.