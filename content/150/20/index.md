+++
title = "Lecture 20 - Special Topics: Compilers"
path = "compilers"
template = "onefifty.html"

[extra]
name = "compilers"
number="20"
url="https://youtube.com/embed/4tVxgxeS1Pc"
colorscheme="lecture_light_turquoise"
+++

Compilers are one of the most interesting and essential advances in the field of
computer science, which form the backbone of every piece of software that has ever
been produced in the world today.

Functional programming is good for many things, but in particular, writing
compilers is an extremely powerful use case for it. In this lecture, we went
over the historical context behind compilers, the theory behind how they
operate, and the bird's-eye view for the various steps behind implementing a
compiler.

We went specifically into the phases of a compiler, {{emph(s="lexing")}},
{{emph(s="parsing")}}, {{emph(s="IR generation")}}, {{emph(s="optimization")}},
and {{emph(s="code generation")}}. Each of these presents their own theory and challenges, but many benefit from the kind of rich data that can be described by
algebraic datatypes.

Ultimately, programs are themselves representable by data structures,
and a program really is just a fancy kind of tree. Compilers must be able to read
and interpret programs, so compilers can be seen as really nothing more than a
series of pure transformations on trees, which functional programming excels at.
