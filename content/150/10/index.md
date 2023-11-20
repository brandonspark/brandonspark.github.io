+++
title = "Lecture 10 - Combinators and Staging"
path = "staging"
template = "onefifty.html"

[extra]
name = "staging"
number="10"
url="https://youtube.com/embed/w-WpXPUMtM4"
colorscheme="lecture_hot_pink"
+++

With higher-order, curried functions, we now have an idea of functions of
"multiple arguments", where those arguments may be given to the function at
different times. This leads us to the idea of {{ emph(s="partial evaluation")
}}, where we can specialize a function for later use by giving it a subset of
its curried arguments.

With this comes the idea of {{ emph(s="staging") }}, which entails realizing
that useful work can be moved around a function with respect to its arguments.
This can allow us to do some optimization in terms of labor saved, by ensuring
that we reuse computations wherever possible, and avoid doing extraneous work,
as well as ensuring finer-grained control over our computations in general.

Another idea introduced in this lecture is that of the pipe operator, `|>`,
which is a higher-order function that helps us write code, by sequencing
operations in a way that can be read more intuitively. We also saw its cousin,
the option-oriented `>>=`, which lets us pipe together operations that may fail,
in a similar way. These are just examples of how higher-order functions give us
more fundamental power in the expressivity and customizability of our code.