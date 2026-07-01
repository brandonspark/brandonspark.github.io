+++
title = "Lecture 4 - Structural Induction and Tail Recursion"
path = "structural"
template = "onefifty.html"

[extra]
name = "structural"
number="04"
url="https://youtube.com/embed/BlOKPMMCiNM"
colorscheme="lecture_green"
[[extra.exercises]]
kind = "choice"
title = "Spotting tail recursion"
prompt = "Which of these functions is tail-recursive?"
choices = [
  "<code>fun f [] = 0 | f (x::xs) = x + f xs</code>",
  "<code>fun g (acc, []) = acc | g (acc, x::xs) = g (acc + x, xs)</code>",
  "<code>fun h n = if n = 0 then 1 else n * h (n - 1)</code>",
]
answer = 1
explain = "In <code>g</code>, the recursive call is the <em>entire</em> result — nothing remains to do when it returns. <code>f</code> and <code>h</code> both have work pending after the call (<code>x + …</code> and <code>n * …</code>), so they must remember it, costing stack space."

[[extra.exercises]]
title = "Tail-recursive sum"
prompt = "Define <code>tsum : int list -> int</code> which sums a list <em>tail-recursively</em>: write a helper that carries an accumulator, in the style of <code>tlength</code> from lecture. (The tests cannot check tail recursion itself — that part is on you.)"
starter = '''
fun tsum (xs : int list) : int = raise Fail "unimplemented"
'''
tests = [
  { name = "tsum [] = 0", expr = "tsum [] = 0" },
  { name = "tsum [1, 2, 3] = 6", expr = "tsum [1, 2, 3] = 6" },
  { name = "negatives cancel", expr = "tsum [~1, 1, ~2, 2] = 0" },
]
+++

Simple induction on the natural numbers can get us reasonably far
when it comes to proving theorems, but in this class we are also
interested in proving theorems on SML code, not just for mathematical
propositions. In such cases, we would like to be able to induct on
the structure of data, which leads us to a phenomenon known as
{{ emph(s="structural induction") }}, a more powerful, more general
form of induction.

We saw how we could employ structural induction to induct on the structure of a
list, by proving a base case and inductive case, using the principle of
structural induction for lists. This is similar to the principle of simple
induction for natural numbers, which involves a base case and inductive step of
$n$ and $n+1$, but instead operates on SML lists in the cases of `[]` and
`x::xs`.

We then introduced the concept of {{ emph(s="tail recursion") }}, which concerns
recursive functions which perform a recursive call, as the last thing that they
do. We saw that these have implications for efficiency benefits, because by not
needing to remember to do things after the recursive call, we avoid needing to use
excess memory, and we applied this knowledge to write the tail-recursive version
of the `length` function, in `tlength`.