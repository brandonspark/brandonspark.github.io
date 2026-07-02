+++
title = "Lecture 16 - Red-Black Trees"
path = "redblack"
template = "onefifty.html"

[extra]
name = "redblack"
number="16"
url="https://youtube.com/embed/csS1WNGTEFc"
colorscheme="lecture_dark_red"
[[extra.exercises]]
title = "Searching a BST"
prompt = "The tree below is a binary <em>search</em> tree: keys left of a node are smaller, keys right are larger. Define <code>lookup : tree * int -> bool</code> that uses the ordering — it should descend only one side of each node, not scan the whole tree."
starter = '''
datatype tree = Empty | Node of tree * int * tree

fun lookup (t : tree, x : int) : bool =
  raise Fail "unimplemented"
'''
solution = '''
datatype tree = Empty | Node of tree * int * tree

fun lookup (Empty, x) = false
  | lookup (Node (l, y, r), x) =
    case Int.compare (x, y) of
      LESS => lookup (l, x)
    | EQUAL => true
    | GREATER => lookup (r, x)
'''
tests = [
  { name = "empty tree", expr = "lookup (Empty, 0) = false" },
  { name = "finds the root", expr = "lookup (Node (Empty, 2, Empty), 2) = true" },
  { name = "finds a leaf", expr = "lookup (Node (Node (Empty, 1, Empty), 2, Node (Empty, 3, Empty)), 3) = true" },
  { name = "absent key", expr = "lookup (Node (Node (Empty, 1, Empty), 2, Node (Empty, 3, Empty)), 4) = false" },
]

[[extra.exercises]]
kind = "choice"
title = "Red-black invariants"
prompt = "Which of these is one of the red-black tree invariants from lecture?"
choices = [
  "No red node has a red child",
  "Every node has the same number of children",
  "All leaves are red",
  "The left subtree is always smaller than the right subtree",
]
answer = 0
explain = "The invariants: no red node has a red child, and every root-to-leaf path passes through the same number of <em>black</em> nodes. Together they force the longest path to be at most about twice the shortest (reds can only alternate with blacks), which is what keeps every operation O(log n)."
+++

A key motivation given for SML's module system is in its treatment of {{
emph(s="abstract types") }}, where we can have modules which contain types whose
definitions are not known, which forbids users from creating invalid instances
of values of that type. This is especially useful when dealing with data
structures with inner invariants, which could cause unsafe behavior when those
invariants are broken.

A classic example of a data structure with invariants is a binary search tree,
which maintains an ordering invariant on its keys. A stronger example still is
that of the {{ emph(s="self-balancing binary tree") }}, which is a binary search
tree which maintains rough balance (and thus $O(\log n)$ complexity operations)
via disciplined use of invariants. This includes {{ emph(s="red-black trees") }}.

We saw that red-black trees employ three main invariants, which involve keeping
a color for each node in the tree. We discussed the theory behind why these
invariants would preserve efficient lookup and insertion, and devised a scheme
for preserving the invariants by briefly breaking them, and then restoring them
again.

This provided another strong example for the efficacy of reasoning via
specification, as by fixing a specification that contained desirable properties,
and then focusing solely on incrementally maintaining that specification, we
were able to implement our desired data structure. Via our usage of modules,
these invariants also have the extremely strong property that they can never be
broken via a consumer of the library.