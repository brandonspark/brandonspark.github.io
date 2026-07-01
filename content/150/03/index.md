+++
title = "Lecture 3 - Induction and Recursion"
path = "induction"
template = "onefifty.html"

[extra]
name = "induction"
number="03"
url="https://youtube.com/embed/6HsZypI7Osg"
colorscheme="lecture_teal"

[[extra.exercises]]
title = "Factorial"
prompt = "Define <code>fact : int -> int</code> so that <code>fact n</code> evaluates to <code>n!</code>. You may assume <code>n >= 0</code>."
starter = '''
fun fact (n : int) : int = raise Fail "unimplemented"
'''
tests = [
  { name = "fact 0 = 1", expr = "fact 0 = 1" },
  { name = "fact 5 = 120", expr = "fact 5 = 120" },
  { name = "fact 10 = 3628800", expr = "fact 10 = 3628800" },
]

[[extra.exercises]]
kind = "choice"
title = "The recursive leap of faith"
prompt = "When proving <code>fact</code> correct by induction on <code>n</code>, the <em>induction hypothesis</em> corresponds to which assumption about the code?"
choices = [
  "That <code>fact 0</code> evaluates to <code>1</code>",
  "That the recursive call <code>fact (n - 1)</code> correctly computes <code>(n - 1)!</code>",
  "That <code>fact</code> terminates on every input",
  "That multiplication is commutative",
]
answer = 1
explain = "The leap of faith from lecture <em>is</em> the induction hypothesis: assume the recursive call already works on the smaller input, and show that the current case is correct given that. (The base case is proven separately, and termination is what the decreasing argument buys you.)"
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