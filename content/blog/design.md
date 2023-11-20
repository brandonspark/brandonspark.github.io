+++
title = "Designing a Course"
date = 2023-08-28
[taxonomies]
tags = ["150", "summer", "design", "teaching"]

[extra]
+++

Designing a course from scratch is a lot of effort. It involves creating a
itinerary of topics, a comprehensive narrative that drives the material,
homework assignments that will be challenging enough to nurture students'
growth while remaining feasible, and a great deal of care into each individual
student.

Thankfully, this blog post is not about that. Having finished my stint as a
summer instructor for 15-150, the introductory functional programming class
at CMU, I was able to work off of course material that had already been
taught for years. There was no need for me to design a whole curriculum from
scratch.

But, even though the pure information content of the course was predetermined,
with information comes the *presentation* of that information, and with presentation
comes stylistic choices. With those comes a whole other world of issues and challenges,
because information is immutable, but how it is conveyed to someone can make a
world of difference in how it is retained, remembered, and understood.

This blog post is about **{{ emph(s="designing") }}** a course, in the sense of
artistic design. It's an exploration of how, over twelve weeks and months of
preparation, I attempted to create a comprehensive style that could not just
present material to students, but engage their attention fully, primarily through
the creation of visual content for students to refer back to, in the form of slides.

<!-- more -->

## {{ purple(s="Why does design matter?") }}

Once thing which I took away from my undergraduate education is just how hard it
is to capture people's attention. This was witnessed firsthand by myself, in the
fact that due to a combination of poor sleep schedule and lack of interest in
certain kinds of material, I spent probably over 70% of my time in college
lectures asleep.

Having taught students before as a TA, I know that {{ emph(s="teaching students who don't
want to be taught is impossible")}}. I also know from experience with myself, that
the only way that I can be engaged with content is when the content is itself
engaging. This is a tautology, but the point I mean is that **design matters**.

I'm something of a visual learner, in that when I see a very well-done diagram,
I remember that diagram. I am more incentivized to look at graphics when they
are pretty -- I am more incentivized to look at *slides* when they are pretty.
My goal was to create a set of slide decks that would truly cause people to pay
attention.

One interesting corollary of this is that, because I chose to use both board
and slides for my teaching, I needed slides that I could teach a lesson to.
At the same time, however, I knew that 150 did not have a textbook, and that
students needed referenceable material so that they could study adequately.
There existed lecture notes, but they were typeset and drab, and I wanted to
do better.

So my goals for my lecture slides were threefold:
- They needed to be structured in a way such that I could teach a lesson to
them, without students losing focus or tabbing out. This means that I cannot
dump text on them, and they need to feel dynamic.
- They needed to be helpful to people who are studying the lecture after the
fact, and be as referenceable and helpful as a textbook on the subject. In
essence, my slides need to serve *as* the textbook for the course.
- They needed to be internally consistent with each other, in terms of having
predictable structure that would cause students to be able to build the
right conceptual models.

To talk about the third point, I had a few consistent "leitmotifs" that I would
use in my slides. My belief is that {{ emph(s="similar types of information should be
presented using similar visual cues")}}, becuase it leads to an overall more holistic
understanding of the material, and is easier for students to follow along.

#### {{ purple(s="Primary and Secondary Colors") }}

One such way this manifested was in the color schemes for each slide deck. Each
slide was characterized by a primary color palette and a secondary color palette.
The primary color is usually a fairly bold color that characterizes the borders
and backgrounds of the slides, and the secondary color is a sometimes contrasting,
also bright color which is used for highlighting purposes. I did not come up with
this idea, but I inherited it when I inherited Jacob Neumann's slides, a previous
150 instructor.

One such way I used this idea was in {{ emph(s="terms") }}. This was my term (haha)
for vocabulary words, or instances of terms which I do not think that students would
have encountered before. Essentially, important words. These would be highlighted
in the secondary color, always, which would tell students that they should be paying
attention.

<div class="image-gallery">
{{ image(src="/colored1.png",
         style="
           width: 49%;
           float: left;
         ",
         position="left") }}

{{ image(src="/colored2.png",
         style="
           width: 49%;
           float: right;
         ",
         position="right") }}
</div>

These colors would also be used in each slide's syntax highlighting, as well as to
color certain blocks, which denote things like key facts, definitions, examples,
and mantras.

#### {{ purple(s="Title Slides") }}

I also knew that I wanted to start off each lecture with something which would make
them excited for the lecture to come. I wanted something which might stick in their
brains, which would announce the subject material in a dynamic way. I thought about
going with simple colors, but I realized that this would leave too much dead,
blank space. I needed something more intricate.

With the help of my friend Boro, a designer at Semgrep, we came up with a basic
template that could be filled in for each lecture:

{{ image(src="/template.png",
         style="
           width: 100%;
         "
         ) }}

There were a few problems I had to contend with to get here:
- I wanted to have a lambda on it somewhere, hopefully obvious and prominent.
- I wanted to have a background image, which would hopefully add some contrasting
  detail to the simplicity of the lambda. The obvious solution was to place the lambda at
  the right, and have it frame the background image, which would take up the rest
  of the space.
- An artistic choice was to have it be multiple lambdas, all folding in to each
  other, in order to evoke a sense of recursion, or neverendingness. These lambdas
  would be colored differently, to give a more nuanced color palette to the slide
  deck.
- We resolved the awkward "tail" at the top of the lambda by stretching it
  across the top of the border with a horizontal line. This also gave a
  convenient place to announce the title of the course.
- This left only on top of the background image, for the lecture title and other
metadata to go. This can be problematic, though, as white text is not easily
visible on all kinds of backgrounds. This was resolved with Boro's suggestion to
place a gradient background above the background image, which fades to black as
you get farther down. It's hard to notice if you aren't looking for it, but
makes the text much easier to see.

For the background image, I usually chose something I found visually interesting
which would moderately relate back to the content of the lecture. For instance, for
the asymptotic analysis lecture, I chose a mountain, which I thought was an
appropriate representation of something which grows seemingly neverendingly.
For the lecture on parallelism and sorting, I chose a stylized representation of
a sorting algorithm, which worked out quite well.

For later lectures, this stopped working out very well. For things like functors,
higher-order functions, and sequences, it's actually incredibly hard to find a
good-looking picture which somehow relates back to that topic. At this point, I
was having trouble finding good premade pictures online, so I decided to fall
back to AI tools.

The premier online prompt-to-image generation tool is Midjourney, which I made
copious use of during the course. It turns out that usually it's fairly easy
to come up with some abstract idea of what I want the slide image to represent,
but hard to find someone who has already specially created that. With Midjourney,
for most such things I can think of, I can just do a bit of prompt engineering to
get it to display what I want.

For instance, the CPS background image above is actually generated by Midjourney,
and represents a classic way of teaching CPS that I have been using for years,
by imagining the growing lambda expression of the continuation as a "donut", or
layered circle. I was very happy with this result.

#### {{ purple(s="Theses") }}

I knew that I would often forget to bring up the Three Theses at later points
in the course, but I didn't want it to feel like a vapid, first-day detail
that would never show up again. I truly do believe that the three theses are
fundamental to the course, and in consolidating meaningful takeaways from it,
so there {{ emph(s="needed to be a way to integrate it into each lesson") }}.

I knew I wanted a visual cue to indicate when a thesis applied, but how would
this be achieved? I could pu" of at in a colored block, inline, as I did with other
significant details, but this felt like it was one step above that. I could
simply write it out verbatim in colored text, but that felt like it would take
away too much from the content of the lesson.

I wanted a reminder, and to let students draw the connections to why the thesis
applied, by themselves. It should be almost like a brain teaser, or a checkpoint
to check your understanding. Students who are following along should get it.

So where did I have unused space? Using the main canvas of the lesson would
limit me too much. I needed somewhere else which was unused.

Fortunately, the title bar served me nicely in that regard.

{{ image(src="/tgs.png",
         style="
           width: 100%;
         "
         ) }}

This worked out fairly well, with the exception of slides which had exceptionally
long names, which tended to conflict with the long name of the thesis
{{ emph(s="Programmatic Thinking is Mathematical Thinking" )}}.

#### {{ purple(s="Diagrams") }}

Stylized text is one thing, but the aspect of visual presentations I think is most
important is in the diagrams.

You can make words as pretty as you'd like, but that doesn't change the fact that
they are words. This can help with incentivizing someone to read them, which is
better than them not being read at all, but you are limited to the inherent ability
of words to transmit information, which is sometimes lacking.

{{ emph(s="A picture is worth a thousand words") }}, so when it came to my lessons, I made sure that
if I could present something visually to a student, I would have an interesting, stylized
diagram for them. I find that I am something of a visual learner, and even if I don't
recall the precise details, the "imprint" of a well-done diagram can stay with me for
years.

One diagram I got a lot of use out of involved a hierarchical lattice:

<div class="image-gallery">
{{ image(src="/lattice1.png",
         style="
           width: 100%;
           margin-bottom: 10pt;
         "
         ) }}
{{ image(src="/lattice2.png",
         style="
           width: 100%;
           margin-bottom: 10pt;
         "
         ) }}
{{ image(src="/lattice3.png",
         style="
           width: 100%;
         "
         ) }}
</div>

I believe that, if you have this pictorial idea of knowing that you can think
about things like induction, subtyping, and evaluation in this way, it only
takes a little bit more thinking to rederive the whole thing from scratch. I
personally benefit a lot from having this intuition.

**Case Study: Lecture 17 - Sequences**

For this lecture, I knew that having a nice-looking representation of cost
graphs would go a long way to making them palatable. The typical 150 notes
on cost graphs have them as ASCII graphs with typeset characters, which is
fine for comprehension, but not something that particularly engaged me when
I was a student.

Two ways that this manifests are in shapes and colors. These are the dimensions
that I have an advantage in, versus the typset example. I knew I wanted to
take advantage of these.

For the fundamentals of cost garphs, I reused the core idea, of having sequential
and parallel composition of graphs be denoted by singular or branching edges.
The joins and nodes were mostly where I had some freedom.

{{ image(src="/lect17_fundamentals.png",
         style="
           width: 100%;
         "
         ) }}

When joined together into a real cost graph, I wanted a distinction between the
fundamental units of the graphs themselves, and a kind of "syntactic sugar" for
a terse representation of a larger sub-graph. This gave way to the distinction
between "computation nodes" and "cost nodes", in purple and green respectively.

<div class="image-gallery">
{{ image(src="/lect17_graph.png",
         style="
           width: 49%;
         "
         ) }}

{{ image(src="/lect17_graph_green.png",
         style="
           width: 49%;
         "
         ) }}
</div>

**Case Study: Lecture 16 - Red-Black Trees**

Red-black trees are the final boss in terms of graphics. The importance of
colors is literally in the name of the data structure, so I needed to step up
my tree game, which historically took the form of just uncolored circles on the
normal slide background.

One thing which stood out to me about this problem was how to represent a sense of
*dynamicness*, in the sense that red-black trees are often characterized by the
way that their shape changes over time. How do I reflect that dynamic behavior over
time in a static, 2D image, without the reader getting confused and forgetting where
we came from?

To facilitate this, I made use of highlighted nodes, which consisted of a yellow
border around particular nodes that I wanted to point out, for instance when
inserting a node. When the color of a node was unclear, I also used a kind of
TBD node, which had a not-quite-red patterned background, to signal that its
color had yet to be determined.

{{ image(src="/lect16_highlight.png",
         style="
           width: 100%;
         "
         ) }}

When it came to red-black tree invariants, I also wanted to be able to quickly
visually indicate whether a given tree satisfied the invariants or not, without
needing to take up paragraph space by just writing it out with words. This led me
to a common design I used, which was to place the tree into a red or green slightly
beveled box, which indicated the invariants which were satisfied (or not).

<div class="image-gallery">
{{ image(src="/lect16_bad.png",
         style="
           width: 49%;
         "
         ) }}

{{ image(src="/lect16_good.png",
         style="
           width: 49%;
         "
         ) }}
</div>

This led me to traces where I was satisfied with how you could tell the "diff" from
the previous image, by seeing the added highlighted parts. The highlighted nodes also
came in useful to identify the "triads" of nodes which were to be rebalanced.

<div class="image-gallery">
{{ image(src="/lect16_trace1.png",
         style="
           width: 49%;
         "
         ) }}

{{ image(src="/lect16_trace2.png",
         style="
           width: 49%;
         "
         ) }}
</div>

Here's a gallery of a menagerie of diagrams that I am particularly proud of:

<div class="image-gallery">
{{ image(src="/diagram1.png",
         style="
           width: 49%;
         "
         ) }}
{{ image(src="/diagram2.png",
         style="
           width: 49%;
         "
         ) }}
{{ image(src="/diagram3.png",
         style="
           width: 49%;
         "
         ) }}
{{ image(src="/diagram4.png",
         style="
           width: 49%;
         "
         ) }}
{{ image(src="/diagram5.png",
         style="
           width: 49%;
         "
         ) }}
{{ image(src="/diagram6.png",
         style="
           width: 49%;
         "
         ) }}
{{ image(src="/diagram7.png",
         style="
           width: 49%;
         "
         ) }}
{{ image(src="/diagram8.png",
         style="
           width: 49%;
         "
         ) }}
</div>

$foo$