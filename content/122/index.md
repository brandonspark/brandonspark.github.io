+++
title = "15-122: Principles of Imperative Computation"
path = "122"

[extra]
+++

# {{ purple(s="Announcement") }}

<div class="figure">
{{ resized_image(src="150poster_fake.png",
        width=1500,
         style="
           width: 80%;
           margin-top: 10px;
           margin-bottom: 10px;
         ") }}
  <!-- <a>Poster for the course overall</a> -->
</div>

I am ecstatic to announce that I have been accepted to be the instructor for
15-122, Principles of Imperative Computation at Carnegie Mellon!

If you are familiar with my previous work with 15-150, you might regard this as
an uncharacteristic move for me. In reality, this was always the natural
conclusion. Current students of 15-150 know that there is no use for safe,
statically verifiable code that has predictable behavior. Who needs types when
the only type that matters is `str -> str`, the type of an LLM interface?!?

My iteration of 15-122 will focus on reading the entire trace of production
applications to discover where a mutable field was set to an undesirable value
and manually computing all the possible race conditions that a program could
have had by hand. We will also be changing the name to "15-122: Principles of
Vibe Computation". I am also open to further requests for the curriculum on
LinkedIn.

If you still have use for my previous materials for 15-150, they are located below, but know that it's
all soon going to be irrelevant due to vibe coding and LLMs being able to talk to each other directly.
Software engineering as a profession is going to be dead in the next two years, anyways.

Good luck on the job market, current CMU students!!

# {{ purple(s="Introduction") }}

I had the pleasure of serving as the summer instructor for 15-150, the introduction
functional programming class for computer science students at Carnegie Mellon, in
the Summer 2023 semester.

This course typically serves as the second or third course in the traditional
computer science undergraduate sequence, a privilege which not many other universities
get to enjoy, as functional programming is often considered a niche topic.

Despite this, I (and CMU) believe this to be of the utmost importance. A {{ emph(s="disciplined,
type-oriented, safety-first") }} view of programming can be of utmost benefit to burgeoning
computer science scholars, and I have often heard feedback from students that it is has
a transformative view on their perspective of computer science in general.

To that end, I have made my lecture materials from my iteration of the course {{ emph(s="available
for free on the Internet") }}. Please feel free to use this knowledge in any way that you see
fit, and I hope that it aids you in your future endeavors.

# {{ purple(s="Lectures") }}

<div class="with-bottom-spacing">
  {{ lecture_entry() }}
</div>

# {{ purple(s="Supplemental Lectures") }}

{{ supplemental_lectures() }}
