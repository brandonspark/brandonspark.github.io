+++
title = "Lecture 6 - Asymptotic Analysis"
path = "asymptotic"
template = "onefifty.html"

[extra]
name = "asymptotic"
number="06"
url="https://youtube.com/embed/ycsTdaJWc2g"
colorscheme="lecture_orange"
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