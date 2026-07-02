+++
title = "Lecture 10 - Combinators and Staging"
path = "staging"
template = "onefifty.html"

[extra]
name = "staging"
number="10"
url="https://youtube.com/embed/w-WpXPUMtM4"
colorscheme="lecture_hot_pink"
[[extra.exercises]]
title = "The pipe operator"
prompt = "Declare and define the pipe operator <code>|></code>, so that <code>x |> f</code> applies <code>f</code> to <code>x</code>. The <code>infix</code> declaration is provided — you write the function."
starter = '''
infix |>
fun x |> f = raise Fail "unimplemented"
'''
solution = '''
infix |>
fun x |> f = f x
'''
tests = [
  { name = "single pipe", expr = "([1, 2, 3] |> List.length) = 3" },
  { name = "chained pipes", expr = "(5 |> (fn x => x + 1) |> (fn x => x * 2)) = 12" },
  { name = "other types", expr = '("hello" |> String.size) = 5' },
]

[[extra.exercises]]
kind = "choice"
title = "Staging"
prompt = "Suppose <code>expensive : int -> int</code> takes a long time. Compare:<pre><code>fun f x = let val h = expensive x in fn y => h + y end\nfun g x y = expensive x + y</code></pre>After <code>val f5 = f 5</code> and <code>val g5 = g 5</code>, what is the difference when each is called many times?"
choices = [
  "No difference — they are extensionally equivalent, so they cost the same",
  "<code>f5</code> computed <code>expensive 5</code> once, up front; <code>g5</code> recomputes it on every call",
  "<code>g5</code> is faster because it avoids building a closure",
  "<code>f5</code> recomputes <code>expensive 5</code> on every call",
]
answer = 1
explain = "This is staging: <code>f</code> does the expensive work when it receives its <em>first</em> argument, so the returned closure has the result <code>h</code> already in hand. <code>g5</code> is <code>fn y => expensive 5 + y</code> — the work re-runs per call. They compute the same values (extensionally equivalent!) but at very different cost."
+++

With higher-order, curried functions, we now have an idea of functions of
"multiple arguments", where those arguments may be given to the function at
different times. This leads us to the idea of {{ emph(s="partial evaluation")
}}, where we can specialize a function for later use by giving it a subset of
its curried arguments.

With this comes the idea of {{ emph(s="staging") }}, which entails realizing
that useful work can be moved around a function with respect to its arguments.
This can allow us to do some optimization in terms of labor saved, by ensuring
that we reuse computations wherever possible, and avoid doing extraneous work,
as well as ensuring finer-grained control over our computations in general.

Another idea introduced in this lecture is that of the pipe operator, `|>`,
which is a higher-order function that helps us write code, by sequencing
operations in a way that can be read more intuitively. We also saw its cousin,
the option-oriented `>>=`, which lets us pipe together operations that may fail,
in a similar way. These are just examples of how higher-order functions give us
more fundamental power in the expressivity and customizability of our code.