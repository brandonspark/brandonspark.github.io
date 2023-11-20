+++
title = "A summer's thoughts"
date = 2023-08-21
[taxonomies]
tags = ["150", "summer"]

[extra]
+++

At the time of writing of this blog post, I have just finished my summer
teaching 15-150 as the instructor of record in the M23 semester.

This was a long trial of months of preparation, late nights, emails, and
back-breaking work that threatened to overwhelm me at times. In the wake of such
a semester, I thought it would make a fitting first blog post, to record and
review the things that happened to me, and what I learned from this summer.

Perhaps to anyone who is interested in planning a course, or the work that goes
into making a cohesive narrative of content over the course of three months, the
things I have to say in this blog post will be of interest.

<!-- more -->

## {{ purple(s="Logistics") }}

One of the first concerns that drives a course is logistics. A course is greatly
diminished without its courses and assignments, and 150 is no exception.

The way that this manifests, in terms of course schedule, is to figure out the
cadence by which students will be given assignments, turn in assignments, take
examinations, and go to TA-led sections (called labs).

15-150 is normally a 14 week course, in the regular semester, but in the
summer semester it is 12. This means that in order to cover the same content,
it needs to operate at a _slightly_ increased pace, but only just.

---------------------------------------------------------------------------------

## {{ purple(s="Themes") }}

One of the first things that I was thinking about was how to make my iteration
of the course unique.

I find that I often forget the details of a course, once it has ended. If it's
not something that I will exercise regularly once the course concludes, it's
usually something that will be wiped from my mind within the next year,
unfortunately.

However, what do I remember from those courses? From courses whose content have
all but escaped me, I still remember some of the big ideas. I remember some of
the flavors of problems that I had to solve for my probability course, even if I
can't do any of the math anymore. I remember the vague impression of an
undecidability reduction proof. And most of all, I remember the **themes**.

It's like when you tell a story, and you can't remember the precise plot
details, but you can remember the morals that you were supposed to take away.
I'm a storyteller by nature, and I couldn't help but think of my course in the
same way. I was going to tell a story over twelve weeks, and I needed that story
to be cohesive.

So, it was with this understanding that I spent the first two weeks of planning coming up
with learning objectives, concrete statements of fact that I wanted students to take away
from the course. Then, I put them all together and started drawing lines between them. I
wanted to find the overarching ideas that connected all of them.

I came up with the following three themes:
- ### {{ emph(s="Recursive Problems, Recursive Solutions") }}
- ### {{ emph(s="Programmatic Thinking is Mathematical Thinking") }}
- ### {{ emph(s="Types Guide Structure") }}

The overarching idea here is that these ideas are {{ emph(s="permanent")}}. Many courses
in my life I have taken and immediately discarded, used for a grade and then immediately
forgot about. Sometimes, that's just how it is. But my role as an instructor was to show
students that 15-150 was not one of those courses -- that these ideas are fundamental,
that they will stay with you for the rest of your life.

#### {{ purple(s="Recursive Problems, Recursive Solutions") }}

{{ emph(s="Recursive Problems, Recursive Solutions")}} is about overcoming the
demon of recursion that seems to sit on people's shoulders. I've witnessed
countless people who consider recursion a bogeyman, a tool which they do not
understand and are afraid to consort with. This couldn't be farther from the truth! I
wanted to get across the usefulness of recursion, without leaving the impression that
we were shoehorning it into every problem we could find.

As such, I came up with a more tempered slogan, in {{ emph(s="Recursive
Problems, Recursive Solutions) }}. This slogan is about the fact that, not only do we
employ recursive solutions, but they emerge **naturally** out of recursive problems.
Recursion is not something ad-hoc or unprecedented, it is the most natural solution to
some of the most natural problems that there are. The same structure that makes up a list
or a tree is the structure by which we solve problems that involve them.

#### {{ purple(s="Programmatic Thinking is Mathematical Thinking") }}

Math shows up a fair amount in 150. We go from the subjects of work and span (sequential
and parallel time complexity), solved via mathematical recurrences, to inductively proving
the correctness of our code by structural induction. More fundamentally than that, the
notion of equivalence between different parts of code is a very deep idea that immutability
grants us, and it shows up all the time when writing real functional code.

I wanted a theme which could serve as the natural evolution of the idea that
induction and recursion are the same. It's not *just* an induction thing, it's a
*math* thing -- programming and math can be related quite a bit at the end of
the day. {{ emph(s="Programmatic Thinking is Mathematical Thinking") }} is not
so much about the fact that programming is literally the same as math. It's
about the fact that mathematical tools can be used by programmers to achieve
better results.

It shows up when reasoning about the cost of code. It shows up when reasoning
about when code is correct. It shows up when architecting code to be simpler and
easy-to-understand -- that is the point. Before computer scientists were
computer scientists, they were mathematicians.

#### {{ purple(s="Types Guide Structure") }}

At this point, I had two themes that were more or less about the kind of problem
solving employed in 150. We use recursive ideas and mathematical tools to help
us reason about our code, but what about the specific content of the course?
What kind of theme, in a more direct and content-related sense, could summarize
the class?

I find that this comes all down to {{ emph(s="types") }}. In 150, it is often
said that the typechecker is the students' worst enemy, for the first two weeks.
By the end of the course, the typechecker is students' best friend. Learning to
play around a programming language with a disciplined type system, and indeed,
structure their very thinking around this idea of types and the rich data
that they describe, allows us a wide array of possibilities when it comes to
problem-solving.

A sub-idea of this theme is that small things give way to big ideas. Via just a
simple idea of function types, we get higher-order functions, currying, and this
idea of parameterizing code over other code. With variables that range over
types, we get parametric polymorphism and all the convenience that it offers.
With algebraic data types, we get the freedom to describe data extremely
precisely, and fit our types to describe our problems. None of these are themselves
big, flashy ideas necessarily, but they mean the world when you get to apply them.

---------------------------------------------------------------------------------

## {{ purple(s="Design") }}

It turns out that, in terms of the stylistic design that went into 150 for this
semester, I had so much to say that I decided to fold it into a completely
separate blog post. You can read it here.

---------------------------------------------------------------------------------

## {{ purple(s="Lessons") }}

The most important part of this entire blog post is the lessons to be taken
away from it. What did I learn over the course of those twelve weeks?

{{ emph(s="You can be adaptable, but it's really draining.")}}

As a person, I have never been one for bureaucracy. One reason why I enjoy
working at a startup is being able to know everyone's name, being able to extend
myself to work on whatever interests me, and not being confined to a box. Whenever
I feel like process or red tape is taking precedence over treating people as
humans, it greatly frustrates me.

It was with this perspective that I went in as an instructor, and said that I
would offer as lenient of an experience as I could, to my students. The
end goal of a college course is that students learn -- I tried to set my goal
on this one objective, beyond anything else, and do whatever it took to get
my students there, even if it didn't exactly align with traditional course
policy.

So this semester, I granted pretty much every single extension that anyone
ever asked me for. My reasoning was that, since most of the learning in 150
happens from doing the homework assignments, if a student doesn't receive an
extension and doesn't finish the rest of it, they aren't learning. I still
stand by this reasoning.

The practical effect of this is that I had a lot of people ask me for extensions.
Even with just fifty-odd students, I felt like I was often underneath a deluge
of emails, and at times it would frustrate me that students were continuously
asking for extensions. Was I doing wrong, by granting so many of them? Were
students exploiting my leniency for some nefarious ends?

The thing is, I think that this kind of thinking can benefit from a derivative
of Hanlon's Razor. Never attribute to malice that which can be attributed to...
well, something else. My frustration was in the thought that students were
somehow deliberately asking for too many extensions, or were taking advantage of
my leniency, but the point is that {{ emph(s="students aren't the enemy") }}.
It's not a black-and-white, adversarial kind of thing. This kind of reasoning
just came out of exhaustion and self-doubt.

So I don't regret giving out all of those extensions, because at the end of the
day, I don't believe you can ever really doubt a student's reason for asking for
an extension. If a student needs help, they will ask, and it's not on you to validate
whether it is legitimate. The point is just to set up students for success, not to
constrain the conditions under which they can.

There's a "but" to this section, however. I did a fair amount of verbal
extension granting, as well as from the phone, so keeping on top of all the
extensions in Gradescope was a real struggle for me. Sometimes, I would grant an
extension, and have to track down their submission for the assignment, placing
more of the onus on myself than the student whose work it was.The point here is
basically that, although I don't regret being lenient, it was extremely draining
on me. Fifty students was already the maximal amount I could deal with, while
attending to each personally, and constantly making adjustments on an individual
basis. Scaling up this kind of treatment would be untenable.

So for professors who teach hundreds of students at a time, as a student I might
have not understood why they adhered to strictly to policy, or were seemingly
hard on me for no reason, but it takes a more nuanced perspective to realize that,
really truly, instructors have a hard job. It's possible to care for every student.
But it's not possible to grant hundreds of students the same level of attention
that I was able to.

{{ emph(s="Failure is expected.")}}

Or, more accurate, *some* failure is expected. This isn't a claim that it's OK or
desirable that there should always be some students who fail a class -- while we
can quibble about specific grade cutoffs and letter grades, I do believe that the
objective of a class should be that every student passes, and if that is not happening,
indeed there is an issue.

This is more of a commentary on my experience as a test-writer, for the first time.
While 150 TAs are offered an unparallelled level of power to engage in content creation,
and control the assignments of the course, it is the custom that professors are fully
in control of writing the examinations. This being my first time as an instructor,
this was also my first experience with writing an examination.
