+++
title = "Lecture 19 - Imperative Programming"
path = "imperative"
template = "onefifty.html"

[extra]
name = "imperative"
number="19"
url="https://youtube.com/embed/x49LBQzRt80"
colorscheme="lecture_grey"
[[extra.exercises]]
title = "A stateful counter"
prompt = "Define <code>makeCounter : unit -> (unit -> int)</code>. Each call to <code>makeCounter ()</code> creates a <em>fresh</em> counter: a function that returns 1, then 2, then 3, … Use a <code>ref</code> cell captured in the closure."
starter = '''
fun makeCounter () : unit -> int =
  raise Fail "unimplemented"
'''
solution = '''
fun makeCounter () =
  let
    val r = ref 0
  in
    fn () => (r := !r + 1; !r)
  end
'''
tests = [
  { name = "counts up", expr = "let val c = makeCounter () in (c (); c ()) = 2 end" },
  { name = "starts at one", expr = "let val c = makeCounter () in c () = 1 end" },
  { name = "counters are independent", expr = "let val c1 = makeCounter () val c2 = makeCounter () in (c1 (); c1 (); c2 ()) = 1 end" },
]

[[extra.exercises]]
kind = "choice"
title = "Aliasing"
prompt = "What is <code>!a</code> after this runs?<pre><code>val a = ref 1\nval b = a\nval _ = b := 5</code></pre>"
choices = ["5", "1", "It does not typecheck", "It raises an exception"]
answer = 0
explain = "<code>val b = a</code> does not copy the box — it binds <code>b</code> to <em>the same box</em>. Assigning through either name changes the one shared cell, so <code>!a</code> is 5. This aliasing is exactly why unrestricted mutability makes programs harder to reason about — and why we default to immutability."
+++

The whole semester, we have been dealing in the pure fragment of SML, which acts
much like a purely functional programming langauge. SML is not, however, a purely
functional language, as it actually has imperative features that we have been
avoiding, up until this lecture.

Mutability is a problem, but generally moreso when it is used unrestrictedly. We
favor the style of *immutability by default*, which simply entails avoiding
mutability, and defaulting to immutability, rather than going so far as to
forbid mutability entirely. This allows us the strength of functional
programming, without necessarily completely shutting ourselves out from
convenience when necessary.

We achieve this in SML by the `t ref` type, which is a type of {{
emph(s="mutable boxes") }} storing values of type `t`. The key takeaway is that
these boxes may remain the same, but the contents of the boxes can change. We
went over the `!`, `ref` and `:=` functions, which allow us to interface with
these boxes.

Mutability can break some of our nice notions of purity and extensional
equivalence, but can be a convenient tool in small doses.