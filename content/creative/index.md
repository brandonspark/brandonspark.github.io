+++
title = "Creative"
path = "creative"

[extra]
+++

I believe that everyone should have three prevailing components in their life,
which are a {{ emph(s="working/intellectual") }} component, a {{
emph(s="social") }} component, and a {{ emph(s="creative") }} component. Several
times I have witnessed that I experience burnout because I focused too hard on
one category without allowances for the other two, so it's important that all
three remain important in my life.

Sometimes, I do creative things. Primarily, I'm interested in theatre,
singing, and making music, but I also have mild interests in technical
and creative writing, design, and filmmaking.

# {{ purple(s="Theatre") }}

In my senior year of undergrad, I had the privilege to serve as
Head Greek Sing Chair for my fraternity, Alpha Epsilon Pi, which entailed
putting on a fifteen-minute long production of the musical {{ emph(s="Come From Away") }}.

{{ image(src="/greek_sing.jpg",
         style="
           width: 50%;
           float: right;
           margin-left: 15px
         ",
         position="right") }}

This project was my life for several months, and remains one of my proudest
creations and fondest memories to this day. I think that there is
unmatched meaning and fulfillment in storytelling, and the opportunity to work
with others to tell such a weighty story about community, compassion, and loss,
was one that I will not soon forget.

The show is <a href="https://youtu.be/Viqv-Ynd_vY">available to watch online here.</a>

{{ gallery() }}

I am also a member of <a href="https://www.backyardtheatersf.org/">Backyard Theater</a>, a (small, unprofessional) theater group in San Francisco that puts on bi-annual parody musicals of popular works.

So far I have been in our productions of <a href="https://youtu.be/E7oFm_yh70U?feature=shared">The Princess Bride</a>, <a href="https://www.youtube.com/watch?v=Wx_O57rM8y8">Harry Potter (Chosen)</a>, and <a href="https://www.youtube.com/watch?v=L_5PtvwtDac">Tinderella</a>.

# {{ purple(s="Music") }}

I picked up the guitar during my senior year of college, and the electric bass
more recently. Playing music is one of my main hobbies, although I am not a very
advanced player. I maintain an Instagram account that I use to document my
progress as a musician, <a href="https://www.instagram.com/150stringguitar/">which you can find here</a>.

I was also in an a cappella group called Hillelujah in college.
<a href="https://youtu.be/sMGtjnhTIE4">Here's a video of us performing at
Kol Haolam</a>, the annual national Jewish a cappella
competition, in 2019.

# {{ purple(s="Filmmaking") }}

I find the medium of film an interesting one because of the unique presence of
the elements of visual, audio, and storytelling elements. On various occasions
in my life, I've had reason to work on a video project, and I find it a very
relaxing process to mentally storyboard a project and edit it to the way that
I like.

Often, for me, it starts with a song that I would like to set a moment of my
life to, or set a scene in a story to. This has only happened a couple times,
and in very, very amateur settings, but I am proud of what I create anyways.

Here is one such example, of a video I created to preserve the
<a href="https://youtu.be/TyIas41munY">memories of my freshman year at CMU</a>,
or another video I created for <a href="https://youtu.be/pJhf2xqqybY?si=0_Mmt805XfkYdwYL">my first year of life out of college</a>.

I also consider film analysis video essays on YouTube a guilty pleasure of mine,
including channels such as <a href="https://www.youtube.com/@everyframeapainting">Every Frame a Painting</a>, <a href="https://www.youtube.com/@schnee1/featured">shnee</a>, and <a href="https://www.youtube.com/@NowYouSeeIt/featured">Now You See It</a>.

# {{ purple(s="Website") }}

One example of a creative outlet is also this website, which I have painstakingly
rendered into a form that I find aesthetically pleasing.

Significant efforts were put into rendering syntax highlighting using Highlight.js rather
than Zola's in-built syntax highlighting, because Zola does not natively support Standard ML
as a language. These colors were also picked out especially to make Standard ML look nice,
by my standards. Have a look.

```
val x = 3 + (3 * 4)
val y = foo (2) |> 4
val y = fn x => 2

val y = ([1, 2, 3], "hi")

exception Foo

val y = x >>= f

(* foo *)
fun foo (x : 'a, y : int, z : int list) = 2

structure Foo : FOO =
  struct
    type t = int * string

    datatype t2 =
        One
      | Two
  end
```