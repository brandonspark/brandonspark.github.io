+++
title = "Lecture 6 - Asymptotic Analysis"
path = "asymptotic"
template = "onefifty.html"

[extra]
name = "asymptotic"
number="06"
url="https://youtube.com/embed/ycsTdaJWc2g"
colorscheme="lecture_orange"
[[extra.exercises]]
kind = "choice"
title = "Solving a work recurrence"
prompt = "A function satisfies the recurrence <code>W(n) = W(n - 1) + c</code> (constant work per call, one recursive call on <code>n - 1</code>). Unrolling it, what asymptotic bound do you get?"
choices = ["O(1)", "O(log n)", "O(n)", "O(n<sup>2</sup>)"]
answer = 2
explain = "Unrolling: <code>W(n) = c + c + … + c</code>, once per level, and there are <code>n</code> levels before reaching the base case — so <code>W(n)</code> is in <code>O(n)</code>. Compare <code>W(n) = W(n/2) + c</code>, which halves instead of decrementing and gives <code>O(log n)</code>."

[[extra.exercises]]
kind = "choice"
title = "Work vs. span"
prompt = "A function makes <em>two</em> recursive calls that could be evaluated in parallel, each on input half the size, plus constant extra work. Its <em>span</em> recurrence is:"
choices = [
  "<code>S(n) = 2 S(n/2) + c</code>",
  "<code>S(n) = S(n/2) + c</code>",
  "<code>S(n) = S(n - 1) + c</code>",
  "<code>S(n) = c</code>",
]
answer = 1
explain = "Span measures time on a machine with unbounded parallelism: the two calls run <em>simultaneously</em>, so only the longer one counts — one <code>S(n/2)</code>, not two. (Work, which counts everything, would be <code>W(n) = 2W(n/2) + c</code>.)"
+++

Estimating the time complexity of a given function can be a tough task. Usually
such reasoning is done in a casual way, which can mask errors in an analysis.
When reasoning about the runtime of recursive functions, however, it turns out
that we can write {{ emph(s="recurrence relations") }}, which are mathematical
equations that describe the runtime in a recursive way, and can be solved to
a closed form.

We saw how we could examine SML code to obtain these recurrences, which describe
the {{ emph(s="work") }}, or runtime cost, of a function. By using a simple
{{ emph(s="unrolling") }} method, we can obtain a closed form, and then derive
an asymptotic bound for a function's cost.

Next we introduced the concept of {{ emph(s="span") }}, which is the work done
by a parallel computer which can evaluate arbitrarily many expressions at the
same time, and saw that we could similarly derive recurrences for estimating the
span of a function.