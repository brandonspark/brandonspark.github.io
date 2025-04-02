+++
title = "Lecture 7 - Sorting and Parallelism"
path = "parallel"
template = "onefifty.html"

[extra]
name = "parallel"
number="07"
url="https://youtube.com/embed/cy5B4iSohxY"
colorscheme="lecture_gold"
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
