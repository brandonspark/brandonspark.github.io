+++
title = "Lecture 1 - Prologue"
path = "prologue"
template = "onefifty.html"

[extra]
name = "prologue"
number="01"
url="https://youtube.com/embed/jjX68oHAw-Y"
colorscheme="lecture_black"
[[extra.exercises]]
kind = "choice"
title = "What makes it functional?"
prompt = "Per lecture, what most fundamentally distinguishes a functional language like SML from an imperative language?"
choices = [
  "Functional programs have no <em>state</em> — variables are never mutated",
  "Functional programs are shorter",
  "Functional languages do not have loops",
  "Functional languages are interpreted rather than compiled",
]
answer = 0
explain = "The lecture framed the difference in terms of <em>state</em>: imperative programs mutate variables over time, while in SML a binding never changes. (Brevity and loop-avoidance are consequences at best, and compilation is orthogonal.)"

[[extra.exercises]]
title = "Your first function"
prompt = "Define <code>square : int -> int</code>, which squares its argument. (Click Run tests — all the code on this page runs in your browser.)"
starter = '''
fun square (n : int) : int = raise Fail "unimplemented"
'''
solution = '''
fun square (n : int) : int = n * n
'''
tests = [
  { name = "square 0 = 0", expr = "square 0 = 0" },
  { name = "square 5 = 25", expr = "square 5 = 25" },
  { name = "square ~3 = 9", expr = "square ~3 = 9" },
]
+++

This lecture served at the introductory lecture to the course. We
introduced the {{ emph(s="Standard ML")}} language, which we will be working in
for the remainder of the semester, and discussed some philosophical
objectives for what ideals we should strive for as programmers.

Functional programming can be seen as a reification of these ideals,
by striving towards improving our ability to communicate as programmers
through descriptive, modular, and maintainable code. We will see later
on in the semester how functional programming really achieves this, but
the ultimate goal is stated as not just programming, but programming **better**.