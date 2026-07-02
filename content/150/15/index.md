+++
title = "Lecture 15 - Functors"
path = "functors"
template = "onefifty.html"

[extra]
name = "functors"
number="15"
url="https://youtube.com/embed/2d5-DdZyRDE"
colorscheme="lecture_dark_orange"
[[extra.exercises]]
title = "Your first functor"
prompt = "Complete the functor <code>MaxFn</code>, which takes a structure of the <code>ORD</code> type class and produces a structure with a <code>max</code> function for that type."
starter = '''
signature ORD =
sig
  type t
  val compare : t * t -> order
end

functor MaxFn (O : ORD) =
struct
  fun max (a : O.t, b : O.t) : O.t = raise Fail "unimplemented"
end

structure IntMax = MaxFn (struct type t = int val compare = Int.compare end)
structure StrMax = MaxFn (struct type t = string val compare = String.compare end)
'''
solution = '''
signature ORD =
sig
  type t
  val compare : t * t -> order
end

functor MaxFn (O : ORD) =
struct
  fun max (a, b) =
    case O.compare (a, b) of
      LESS => b
    | _ => a
end

structure IntMax = MaxFn (struct type t = int val compare = Int.compare end)
structure StrMax = MaxFn (struct type t = string val compare = String.compare end)
'''
tests = [
  { name = "int instance, second larger", expr = "IntMax.max (2, 5) = 5" },
  { name = "int instance, first larger", expr = "IntMax.max (7, 3) = 7" },
  { name = "string instance", expr = 'StrMax.max ("apple", "banana") = "banana"' },
]

[[extra.exercises]]
kind = "choice"
title = "Why a type class?"
prompt = "The lecture's dictionary functor takes an <code>ORD</code> structure rather than having every operation accept a comparison function argument. The main benefit is:"
choices = [
  "It runs faster, because functors are compiled away",
  "One fixed ordering is baked in at instantiation, so operations can never be called with inconsistent comparisons",
  "It avoids currying, which is expensive",
  "It allows the dictionary to store keys of several different types at once",
]
answer = 1
explain = "If every <code>insert</code> and <code>lookup</code> took its own comparison function, nothing would stop a caller from mixing two different orderings on the same dictionary — silently corrupting the search-tree invariant. Instantiating the functor with one <code>ORD</code> makes the ordering part of the dictionary's identity."
+++

This lecture continues our exploration of the SML module system, by introducing
the idea of {{ emph(s="functors") }}, which are simply module-level functions
which take in structures and produce other structures.

We motivated this idea by trying to implement a structure for polymorphic
dictionaries, which are dictionaries that can map from keys of arbitrary (but fixed)
type to values of also arbitrary type. To do this, we required taking in a
comparison function to order the keys, but this ended up producing unsafe behavior
in the event that this comparison function was used erroneously.

We found that a safer approach was to parameterize our structure on a {{
emph(s="type class") }} `ORD`, which describes structures of types that have
included comparison functions. By defining it according to a singular instance
of the `ORD` type class, we were able to then translate the code into a functor,
which assumed the type class as an argument.

We then saw that we could reuse the same dictionary-creating code for many
different type classes, at minimal extra burden. This demonstrates the power of
functors, which allow us to parameterize software components based on other
software components in a well-specified way.