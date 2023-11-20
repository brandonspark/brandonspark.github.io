+++
title = "Lecture 14 - Structures and Signatures"
path = "modules"
template = "onefifty.html"

[extra]
name = "modules"
number="14"
url="https://youtube.com/embed/qLjeuTyFNHo"
colorscheme="lecture_brown"
+++

In this course, so far we have been implementing simple and not-so-simple functions
that stand for themselves for the most part, and which solve well-defined problems
that have been handed to you, for the most part.

Computer science is often a collaborative art, and in particular, when producing
software, such well-defined structure does not always exist. The problem of
software engineering is determining how to produce such well-architected code,
which remains both easy to maintain and clear to its readers.

This lecture introduced SML's sophisticated {{ emph(s="module") }} system, which
entails a language of {{ emph(s="structures") }}, which are constructs that may
store exceptions, datatypes, and values, the things that we have been working so far
in the course. We also saw that we could use {{ emph(s="signatures") }} to denote
the interface of such modules, which is akin to a "type" that describes the contents
of a given module.

These structures are important because they exhibit {{ emph(s="information
hiding") }}, which lets us cleanly separate the boundaries between areas of a
codebase, by defining well-specified interfaces between them, using the language of
types and values.

We saw how we could use {{ emph(s="opaque ascription") }} and {{
emph(s="transparent ascription") }} to control the degree of information hiding,
the former allowing us to define {{ emph(s="abstract types") }} whose definitions
are unknown to users, something which grants us great strength by forbidding the
breaking of abstraction, and in particular, implementation invariants.
