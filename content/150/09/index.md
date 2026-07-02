+++
title = "Lecture 9 - Higher-Order Functions"
path = "hofs"
template = "onefifty.html"

[extra]
name = "hofs"
number="09"
url="https://youtube.com/embed/c78ypORDm0Q"
colorscheme="lecture_turquoise"
[[extra.exercises]]
title = "A higher-order function"
prompt = "Define <code>exists : ('a -> bool) -> 'a list -> bool</code>, curried, which tells whether some element of the list satisfies the predicate. (Don't use <code>List.exists</code> — write the recursion yourself.)"
starter = '''
fun exists (p : 'a -> bool) (xs : 'a list) : bool =
  raise Fail "unimplemented"
'''
solution = '''
fun exists p [] = false
  | exists p (x::xs) = p x orelse exists p xs
'''
tests = [
  { name = "finds a match", expr = "exists (fn x => x > 2) [1, 2, 3] = true" },
  { name = "no match", expr = "exists (fn x => x < 0) [1, 2, 3] = false" },
  { name = "works at other types", expr = 'exists (fn s => s = "b") ["a", "b"] = true' },
  { name = "partial application", expr = "let val hasEven = exists (fn x => x mod 2 = 0) in hasEven [1, 3, 5] = false andalso hasEven [1, 4] = true end" },
]

[[extra.exercises]]
kind = "choice"
title = "The type of map"
prompt = "Without looking it up: what is the type of <code>List.map</code>?"
choices = [
  "<code>('a -> 'b) -> 'a list -> 'b list</code>",
  "<code>('a -> 'b) * 'a list -> 'b list</code>",
  "<code>'a list -> ('a -> 'b) -> 'b list</code>",
  "<code>('a -> 'a) -> 'a list -> 'a list</code>",
]
answer = 0
explain = "<code>map</code> is curried (function first, list second — enabling partial applications like <code>List.map Int.toString</code>), and the element types may differ before and after: <code>'a</code> in, <code>'b</code> out."
+++

We have so far learned that values can be passed into functions and returned
from functions, even complex values such as constructors of a variant type,
or tuples. One core idea in this class is that {{ emph(s="functions are values") }},
which by transitivity implies that functions can be given as arguments to functions
and returned from functions.

This is an idea which gives rise to {{ emph(s="currying") }} and {{ emph(s="higher-order functions") }}, which describe functions which do both of these
things. In the last lecture, we exploited the latter to write a generic sorting
function, which could be instantiated with any comparison function to achieve
a sort for that particular relation.

Higher-order functions give us an idea of parameterizing our code over other
code -- viewed in this way, we can write functions which can vary their behavior
based on the behavior of their arguments. This ends up being very powerful for
the purpose of eliminating boilerplate, as we can then write functions which
abstract over common patterns in our code, and lead to simpler code overall.