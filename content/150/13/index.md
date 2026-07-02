+++
title = "Lecture 13 - Regular Expressions"
path = "regex"
template = "onefifty.html"

[extra]
name = "regex"
number="13"
url="https://youtube.com/embed/cVkPmxI2MO0"
colorscheme="lecture_pinkish_red"
[[extra.exercises]]
kind = "choice"
title = "Reading a regular expression"
prompt = "Consider the regular expression <code>a*b</code> (any number of <code>a</code>s, then one <code>b</code>). Which of these strings is <em>not</em> in its language?"
choices = ["b", "ab", "aaab", "aba"]
answer = 3
explain = "<code>a*</code> can match zero <code>a</code>s (so <code>b</code> is in), one (<code>ab</code>), or three (<code>aaab</code>). But <code>aba</code> has a trailing <code>a</code> after the <code>b</code>, and nothing in <code>a*b</code> can match anything after the <code>b</code>."

[[extra.exercises]]
kind = "choice"
title = "The matcher's specification"
prompt = "In the lecture's matcher, matching <code>Concat (r1, r2)</code> against a string <code>s</code> requires finding:"
choices = [
  "A split of <code>s</code> into a prefix matching <code>r1</code> and a suffix matching <code>r2</code>",
  "That <code>s</code> matches both <code>r1</code> and <code>r2</code> entirely",
  "That <code>s</code> matches either <code>r1</code> or <code>r2</code>",
  "That some character of <code>s</code> matches <code>r1</code> and the rest match <code>r2</code>",
]
answer = 0
explain = "Concatenation means: some way of cutting <code>s</code> into <code>p ^ q</code> where <code>p</code> is in the language of <code>r1</code> and <code>q</code> in that of <code>r2</code>. The matcher searches over the possible split points — this is why reasoning via the prefix/suffix specification (or the picture!) keeps the implementation honest."
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