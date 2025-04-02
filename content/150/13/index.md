+++
title = "Lecture 13 - Regular Expressions"
path = "regex"
template = "onefifty.html"

[extra]
name = "regex"
number="13"
url="https://youtube.com/embed/cVkPmxI2MO0"
colorscheme="lecture_pinkish_red"
+++

String validation is an important problem in computer science. We are often
interested in processing some kind of text and extracting information from it,
or verifying that it matches some expected input schema. {{ emph(s="Regular
expressions") }} are an extremely well-established tool in the field of computer
science, which aim to solve exactly that problem.

In this lecture, we explored the theory of regular expressions, and saw how they
could be defined by a simple SML datatype. Regular expressions are defined to
correspond to a particular set of strings, known as a {{ emph(s="language") }},
according to a simple recursive mathematical description.

We then used this SML datatype of `regexp` to define a function that attempts to
match a string to a regular expression, by recursive decomposition on the structure
of the regular expression. We found that this admitted a reasonably terse and
simple implementation, via a `match` function with a particular specification
having to do with splitting the string into a prefix and suffix satisfying
certain conditions.

While this description seems scary, it is easier to think of in terms of a
picture, which gives credence to thinking about code behind a layer of intuitive
abstraction, whenever possible. By reasoning via specification or picture, we
can prove our implementation correct, and learn how to implement such a function
well.