+++
title = "Lecture 7 - Sorting and Parallelism"
path = "parallel"
template = "onefifty.html"

[extra]
name = "parallel"
number="07"
url="https://youtube.com/embed/cy5B4iSohxY"
colorscheme="lecture_gold"
[[extra.exercises]]
title = "Merge"
prompt = "Define <code>merge : int list * int list -> int list</code>, which merges two lists that are each sorted in increasing order into one sorted list — the heart of merge sort from lecture."
starter = '''
fun merge (xs : int list, ys : int list) : int list =
  raise Fail "unimplemented"
'''
tests = [
  { name = "both empty", expr = "merge ([], []) = []" },
  { name = "one empty", expr = "merge ([1, 2], []) = [1, 2]" },
  { name = "interleaved", expr = "merge ([1, 3, 5], [2, 4]) = [1, 2, 3, 4, 5]" },
  { name = "duplicates survive", expr = "merge ([1, 2], [2, 3]) = [1, 2, 2, 3]" },
]

[[extra.exercises]]
kind = "choice"
title = "The tree method"
prompt = "Merge sort satisfies <code>W(n) = 2 W(n/2) + c·n</code>. Using the tree method — cost per level times number of levels — what bound do you get?"
choices = ["O(n)", "O(n log n)", "O(n<sup>2</sup>)", "O(2<sup>n</sup>)"]
answer = 1
explain = "Each level of the call tree does <code>c·n</code> total work (the halves are smaller, but there are more of them), and halving <code>n</code> gives <code>log n</code> levels: <code>n</code> work per level × <code>log n</code> levels = <code>O(n log n)</code>."
+++

This lecture expanded upon the discussions on asymptotic complexity of
the previous lecture, by going more in depth on how we can solve and
reason about the sequential and parallel time complexity of SML functions.

The {{ emph(s="tree method") }} is a useful tool for solving the time
complexity of a recurrence which makes multiple "recursive calls", by
trying to sum over the total cost of each "level" of the call tree induced
by the recurrence.

As a specific application of cost analysis, we implemented the insertion sort
and merge sort algorithms in SML, and conducted work and span analysis on them.
In particular, we found that merge sort admitted a very terse and clean
implementation in SML, which could be done in parallel in linear time.
