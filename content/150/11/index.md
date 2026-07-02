+++
title = "Lecture 11 - Continuation-Passing Style"
path = "cps"
template = "onefifty.html"

[extra]
name = "cps"
number="11"
url="https://youtube.com/embed/0-h8bwNXaTc"
colorscheme="lecture_blue"
[[extra.exercises]]
title = "Summing with a continuation"
prompt = "Define <code>sumk : int list * (int -> 'a) -> 'a</code> in continuation-passing style: <code>sumk (xs, k)</code> passes the sum of <code>xs</code> to the continuation <code>k</code>. The recursive case should call <code>sumk</code> with an <em>extended</em> continuation."
starter = '''
fun sumk (xs : int list, k : int -> 'a) : 'a =
  raise Fail "unimplemented"
'''
solution = '''
fun sumk ([], k) = k 0
  | sumk (x::xs, k) = sumk (xs, fn r => k (x + r))
'''
tests = [
  { name = "identity continuation", expr = "sumk ([1, 2, 3], fn x => x) = 6" },
  { name = "empty list", expr = "sumk ([], fn x => x) = 0" },
  { name = "continuation is used", expr = 'sumk ([1, 2], Int.toString) = "3"' },
]

[[extra.exercises]]
kind = "choice"
title = "What is a continuation?"
prompt = "In continuation-passing style, the continuation argument <code>k</code> represents:"
choices = [
  "The work <em>left to do</em> after the current computation finishes",
  "The result accumulated <em>so far</em>, like an ordinary accumulator",
  "The depth of the call stack",
  "A cached copy of the function's previous results",
]
answer = 0
explain = "A continuation is the rest of the computation, reified as a function: instead of returning a result, you hand it to <code>k</code>, which knows what to do next. An ordinary accumulator stores <em>results</em> computed so far; a continuation stores <em>instructions</em> for later — spiritually dual, as in lecture."
+++

So far in this course, we have used accumulators as tools to implement
functions which are tail recursive, by storing our intermediate computations
in an extra argument to the function in question, as we recurse.

{{ emph(s="Continuation-passing style") }} is a natural extension of accumulation,
where instead of using an accumulator of a type like `int`, the accumulator is a
function which represents the *work left to do* by the function. This allows us
to store *computations* in our accumulator argument, called the {{ emph(s="continuation") }}, and discharge them all at a later time.

Philosophically, continuation-passing style can be seen as contrasting to
direct-style recursion by noting down instructions of what instructions to execute,
rather than executing instructions themselves and storing the results in the
accumulator. These end up being spiritually the same information, but having
slightly different implications for implementation.

We saw that we could use continuation-passing style to make the control flow of
our programs extremely clear, and implement backtracking and doubly-recursing
functions easily via using them. Written in such a way, these programs have a
more explicit evaluation order, and rely less on implicit evaluation rules.