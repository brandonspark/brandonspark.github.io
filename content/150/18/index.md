+++
title = "Lecture 18 - Lazy Programming"
path = "lazy"
template = "onefifty.html"

[extra]
name = "lazy"
number="18"
url="https://youtube.com/embed/dBb1HnvPX0A"
colorscheme="lecture_light_blue"
+++

We are now comfortable with the idea of using functions as first-class values,
which means that the can be bound to variables, passed to functions, and treated
like pretty much any other value.

This lecture introduces {{ emph(s="lazy programming") }}, which entails
programming by trying to do as little work as possible, until it is absolutely
necessary. For instance, when mapping a function onto a list, SML will eagerly
compute each new entry, even if we don't use any of the entries for anything.

We can simulate such lazy structures by using {{ emph(s="thunks") }}, which
are functions that take in a useless `unit` parameter, which suspends the
body of the function, causing no computations to occur. This lets us define
{{ emph(s="lazy data structures") }}, which compute elements only when they
are asked for them. This results in less work overall, and the ability to
theoretically store "infinitely" many elements.

In addition to lazy lists, we discussed {{ emph(s="streams") }}, which are
lazy lists that are {{ emph(s="maximally lazy") }}, by making sure that
the least amount of work is done when the stream is not being actively
queried for elements.