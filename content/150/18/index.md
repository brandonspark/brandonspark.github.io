+++
title = "Lecture 18 - Lazy Programming"
path = "lazy"
template = "onefifty.html"

[extra]
name = "lazy"
number="18"
url="https://youtube.com/embed/dBb1HnvPX0A"
colorscheme="lecture_light_blue"
[[extra.exercises]]
title = "An infinite stream"
prompt = "Using the stream type below (<code>take</code> is given), define <code>nats : int -> int stream</code>, the infinite stream counting up from its argument. The recursive call must live <em>inside</em> the thunk — otherwise it would run forever!"
starter = '''
datatype 'a stream = Cons of 'a * (unit -> 'a stream)

fun take (Cons (x, tl), n) =
  if n <= 0 then [] else x :: take (tl (), n - 1)

fun nats (start : int) : int stream =
  raise Fail "unimplemented"
'''
solution = '''
datatype 'a stream = Cons of 'a * (unit -> 'a stream)

fun take (Cons (x, tl), n) =
  if n <= 0 then [] else x :: take (tl (), n - 1)

fun nats start = Cons (start, fn () => nats (start + 1))
'''
tests = [
  { name = "first five naturals", expr = "take (nats 0, 5) = [0, 1, 2, 3, 4]" },
  { name = "starts where asked", expr = "take (nats 10, 3) = [10, 11, 12]" },
  { name = "negative start", expr = "take (nats ~2, 4) = [~2, ~1, 0, 1]" },
]

[[extra.exercises]]
kind = "choice"
title = "Why thunks delay work"
prompt = "Wrapping an expression as <code>fn () => e</code> suspends its computation because:"
choices = [
  "A function body is only evaluated when the function is <em>applied</em>",
  "The <code>unit</code> type tells the compiler the value is unused",
  "Functions are compiled lazily in SML",
  "<code>fn</code> expressions are cached after their first evaluation",
]
answer = 0
explain = "SML is eager everywhere except one place: the body of a <code>fn</code> waits until the function is called. A thunk exploits exactly that — <code>e</code> costs nothing until you say <code>thunk ()</code>. (Note the last option describes memoization, which plain thunks do <em>not</em> do: calling twice recomputes.)"
+++

We are now comfortable with the idea of using functions as first-class values,
which means that the can be bound to variables, passed to functions, and treated
like pretty much any other value.

This lecture introduces {{ emph(s="lazy programming") }}, which entails
programming by trying to do as little work as possible, until it is absolutely
necessary. For instance, when mapping a function onto a list, SML will eagerly
compute each new entry, even if we don't use any of the entries for anything.

We can simulate such lazy structures by using {{ emph(s="thunks") }}, which
are functions that take in a useless `unit` parameter, which suspends the
body of the function, causing no computations to occur. This lets us define
{{ emph(s="lazy data structures") }}, which compute elements only when they
are asked for them. This results in less work overall, and the ability to
theoretically store "infinitely" many elements.

In addition to lazy lists, we discussed {{ emph(s="streams") }}, which are
lazy lists that are {{ emph(s="maximally lazy") }}, by making sure that
the least amount of work is done when the stream is not being actively
queried for elements.