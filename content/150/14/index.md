+++
title = "Lecture 14 - Structures and Signatures"
path = "modules"
template = "onefifty.html"

[extra]
name = "modules"
number="14"
url="https://youtube.com/embed/qLjeuTyFNHo"
colorscheme="lecture_brown"
[[extra.exercises]]
title = "Implement a signature"
prompt = "Implement <code>structure Stack</code> so it satisfies <code>STACK</code> (then uncomment the opaque ascription). <code>toList</code> lists the stack top-first."
starter = '''
signature STACK =
sig
  type 'a stack
  val empty : 'a stack
  val push : 'a * 'a stack -> 'a stack
  val pop : 'a stack -> ('a * 'a stack) option
  val toList : 'a stack -> 'a list
end

structure Stack (* :> STACK *) =
struct
  (* your implementation here *)
end
'''
solution = '''
signature STACK =
sig
  type 'a stack
  val empty : 'a stack
  val push : 'a * 'a stack -> 'a stack
  val pop : 'a stack -> ('a * 'a stack) option
  val toList : 'a stack -> 'a list
end

structure Stack :> STACK =
struct
  type 'a stack = 'a list
  val empty = []
  fun push (x, s) = x :: s
  fun pop [] = NONE
    | pop (x::s) = SOME (x, s)
  fun toList s = s
end
'''
tests = [
  { name = "empty stack", expr = "Stack.toList Stack.empty = ([] : int list)" },
  { name = "push order (top first)", expr = "Stack.toList (Stack.push (2, Stack.push (1, Stack.empty))) = [2, 1]" },
  { name = "pop returns the top", expr = "case Stack.pop (Stack.push (1, Stack.empty)) of SOME (1, s) => Stack.toList s = [] | _ => false" },
  { name = "pop of empty", expr = "case Stack.pop (Stack.empty : int Stack.stack) of NONE => true | SOME _ => false" },
]

[[extra.exercises]]
kind = "choice"
title = "Opaque ascription"
prompt = "Given<pre><code>structure S :> sig type t val x : t end =\nstruct type t = int val x = 3 end</code></pre>what does <code>S.x + 1</code> do?"
choices = [
  "Evaluates to 4",
  "Type error: <code>S.t</code> is abstract, so <code>S.x</code> is not an <code>int</code>",
  "Evaluates to 1",
  "Raises an exception at runtime",
]
answer = 1
explain = "Opaque ascription (<code>:></code>) seals the structure: outside it, <code>S.t</code> is a brand-new abstract type whose equality with <code>int</code> is forgotten. That's the point — clients can only use <code>S.x</code> through the signature's interface, which is what protects invariants. With transparent ascription (<code>:</code>) this would be 4."
+++

In this course, so far we have been implementing simple and not-so-simple functions
that stand for themselves for the most part, and which solve well-defined problems
that have been handed to you, for the most part.

Computer science is often a collaborative art, and in particular, when producing
software, such well-defined structure does not always exist. The problem of
software engineering is determining how to produce such well-architected code,
which remains both easy to maintain and clear to its readers.

This lecture introduced SML's sophisticated {{ emph(s="module") }} system, which
entails a language of {{ emph(s="structures") }}, which are constructs that may
store exceptions, datatypes, and values, the things that we have been working so far
in the course. We also saw that we could use {{ emph(s="signatures") }} to denote
the interface of such modules, which is akin to a "type" that describes the contents
of a given module.

These structures are important because they exhibit {{ emph(s="information
hiding") }}, which lets us cleanly separate the boundaries between areas of a
codebase, by defining well-specified interfaces between them, using the language of
types and values.

We saw how we could use {{ emph(s="opaque ascription") }} and {{
emph(s="transparent ascription") }} to control the degree of information hiding,
the former allowing us to define {{ emph(s="abstract types") }} whose definitions
are unknown to users, something which grants us great strength by forbidding the
breaking of abstraction, and in particular, implementation invariants.
