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
title = "Swapping two boxes"
prompt = "Define <code>swap : 'a ref * 'a ref -> unit</code>, which exchanges the contents of two ref cells. Careful with evaluation order — you'll want a temporary. (What should happen when both arguments are the <em>same</em> box?)"
starter = '''
fun swap (a : 'a ref, b : 'a ref) : unit = raise Fail "unimplemented"
'''
solution = '''
fun swap (a, b) =
  let
    val tmp = !a
  in
    a := !b;
    b := tmp
  end
'''
tests = [
  { name = "swaps ints", expr = "let val a = ref 1 val b = ref 2 in (swap (a, b); (!a, !b) = (2, 1)) end" },
  { name = "swaps strings", expr = 'let val a = ref "x" val b = ref "y" in (swap (a, b); (!a, !b) = ("y", "x")) end' },
  { name = "self-swap is harmless", expr = "let val a = ref 5 in (swap (a, a); !a = 5) end" },
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