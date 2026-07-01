+++
title = "Lecture 2 - Equivalence, Binding, and Scope"
path = "equivalence"
template = "onefifty.html"

[extra]
name = "equivalence"
number="02"
url="https://youtube.com/embed/QTXrbizKQOs"
colorscheme="lecture_purple"
[[extra.exercises]]
kind = "choice"
title = "Shadowing"
prompt = "What does <code>y</code> evaluate to?<pre><code>val x = 5\nval y = let val x = 10 in x + x end</code></pre>"
choices = ["10", "15", "20", "This code does not typecheck"]
answer = 2
explain = "The inner <code>val x = 10</code> <em>shadows</em> the outer binding — it is a brand-new variable that happens to share the name. Inside the <code>let</code>, <code>x</code> is 10, so <code>x + x</code> is 20. The outer <code>x</code> is unchanged (and unused)."

[[extra.exercises]]
title = "Pattern matching on tuples"
prompt = "Define <code>dist : (int * int) * (int * int) -> int</code> computing the Manhattan distance between two points: <code>|x1 - x2| + |y1 - y2|</code>. Use tuple patterns to take the points apart, and <code>abs</code> for absolute value."
starter = '''
fun dist (p1 : int * int, p2 : int * int) : int =
  raise Fail "unimplemented"
'''
tests = [
  { name = "same point", expr = "dist ((0, 0), (0, 0)) = 0" },
  { name = "axis-aligned", expr = "dist ((0, 0), (3, 0)) = 3" },
  { name = "general", expr = "dist ((1, 2), (4, 6)) = 7" },
  { name = "order does not matter", expr = "dist ((4, 6), (1, 2)) = 7" },
]
+++

Following the first lecture, this lesson went into more about
the evaluation model of SML.

In the first lecture, we talked about the difference between
functional and imperative languages in the former's lack of
{{ emph(s="state") }}, which involves the mutation of a
variable to have multiple different values over time.

We explored the idea of {{ emph(s="binding") }}, which distinguishes
variable declarations in SML from variable declarations in an imperative
language, in that **bound variables never change**. Instead, they may
be {{ emph(s="shadowed") }}, which simply introduces a new, unrelated
variable that happens to be named the same.

We then looked more examples of SML code, using the mechanism of
{{ emph(s="pattern matching") }}, which lets us decompose more complex
values, like tuples, into their constituent components.

To wrap up the lecture, we discussed the concept of {{ emph(s="extensional
equivalence") }}, which allows us to perform analysis of code in the same way
that one might reason about an algebraic equation (also called {{
emph(s="equational reasoning") }}). We applied this to a small example, and
saw how simple algebraic reasoning can greatly help us simplify our code.
