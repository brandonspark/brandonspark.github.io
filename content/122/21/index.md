+++
title = "Lecture 21 - Special Topics: Program Analysis"
path = "pa"
template = "onefifty.html"

[extra]
name = "pa"
number="21"
url="https://youtube.com/embed/VVWLOyO4X94"
colorscheme="lecture_cool_purple"
+++

In a world which is being increasingly dominated by software, as well as the
challenges that come with its inherent insecurity, it is extremely important
that we be able to keep up with the sheer volume of code being produced. This
leads us to {{ emph(s="program analysis") }} is the art of obtaining information
about a program through programmatic means.

Due to the Halting Problem, it can be demonstrated that it is impossible for
any program to be completely accurate in assessing any property of a given
program. The field of program analysis circumvents this by performing analyses
with heavy approximations, which allow termination, while giving back
potentially inaccurate results.

In this lecture, we discussed different kinds of program analyses, which must
compromise on properties such as termination, accuracy, and thoroughness, due to
the impossibility of the task. We also introduced {{ emph(s="dataflow analysis")
}} as a classic technique that is used to ascertain approximate information
about a given program.

I also talked about what I do at Semgrep, working on program analysis for securing
code by searching for undesirable parts of programs in many different languages.
I explained some of the technical merits of Semgrep, by utilizing a generic
representation for many different languages, as well as performing analyses via
simple recursive tree matching on the source program, as opposed to descending to
the lower levels of the program.