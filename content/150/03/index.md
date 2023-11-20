+++
title = "Lecture 3 - Induction and Recursion"
path = "induction"
template = "onefifty.html"

[extra]
name = "induction"
number="03"
url="https://youtube.com/embed/6HsZypI7Osg"
colorscheme="lecture_teal"
+++

Early on, it was claimed that almost every function in 150 would be recursive.
This lecture introduces a very deep idea that induction and recursion are two
sides of the same coin, and follow similar principles of **solving problems
via using answers to smaller subproblems**.

We reviewed the idea of induction, which lets us prove theorems on the natural
numbers by a rigid structure of a {{ emph(s="base case") }} and {{
emph(s="inductive step") }}. This lets us essentially show that a theorem can be
proven for any given number, via finite repetitions of the inductive step to the
base case.

This process ends up being very similar to the act of writing a recursive
function, by connecting the idea of assuming an induction hypothesis with
assuming that a recursive function already works, a technique dubbed the {{
emph(s="recursive leap of faith") }}.

We then went over more aspects of the SML language, including {{
emph(s="patterns") }}, which are the fundamental constructs by which we break
down data into simpler parts, in SML.