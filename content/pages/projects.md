+++
title = "Projects"
path = "projects"
+++

Here are some projects I'm working on, actively or passively, which I felt
didn't fit into the other sections on teaching, or creative works, or details
about myself.

<!-- TODO: hardcoded color here, gross. -->
## <a href="https://github.com/brandonspark/mulligan" style="color:rgb(136, 105, 223)">{{ purple(s="mulligan") }}</a>

<tt>{{ emph(s="mulligan") }}</tt> is a stepping debugger for the Standard ML
language, aimed at making it easy to trace through the execution of simple
Standard ML expressions, at a finer level of granularity than is possible
through the SML/NJ REPL, which will not display the intermediary steps it takes
to compute a value.

<div style="overflow: hidden;">
  <div style="float: right; width: 50%; margin-left: 15px;">
      <img src="https://user-images.githubusercontent.com/49291449/214633031-1f33f23d-af7f-4116-ba9d-fb8cb8f2a9e4.svg" style="width: 100%;" alt="Floating Image">
  </div>
  While <tt>{{ emph(s="mulligan") }}</tt> works fine on simple examples, it is
  currently in a beta state which is likely to have bugs. In addition, the
  standard library is not currently implemented in it, meaning that definitions
  must be supplied for most all functions for <tt>{{ emph(s="mulligan") }}</tt> to
  know about it. Regardless, for teaching purposes, <tt>{{ emph(s="mulligan")
  }}</tt> is useful for programmatically generating traces, as well as for
  clarifying to beginners how SML's execution model really works.

  <div style="clear: right;">
      <h2 style="margin-top: 0;">
        <a href="https://github.com/brandonspark/deriving-sml" style="color:rgb(136, 105, 223)">{{ purple(s="deriving-sml") }}</a>
      </h2>
      <p>
        <tt>{{ emph(s="deriving-sml")}}</tt> is a code generation tool that aims to
        limitedly mimic the functionality of its more popular OCaml cousin,
        <a href="https://github.com/ocaml-ppx/ppx_deriving">ppx-deriving</a>, but
        for the Standard ML language.
      </p>
  </div>
</div>
<tt>{{ emph(s="deriving-sml")}}</tt> supports four "plugins", those being {{
emph(s="eq") }}, {{ emph(s="compare") }}, {{ emph(s="show") }}, and {{
emph(s="map") }}. <tt>{{ emph(s="deriving-sml")}}</tt> parses a "meta-SML"
dialect which includes "deriving metadata" attached to type declarations, which
signals to <tt>{{ emph(s="deriving-sml")}}</tt> to produce code for each of the
four functionalities, in a type-directed way.

For instance, the following code:
```sml
structure Foo =
  struct
    type t = int * string [.deriving show, eq]

    datatype t2 =
        One
      | Two [.deriving show, compare]
  end
```

produces the following code, when fed into <tt>{{ emph(s="deriving-sml")}}</tt>:
```
structure Foo =
  struct
    type t = (int * string) (* [.deriving show,eq] *)
    fun show_t (t1, t2) =
        (op^ ( ((op^ ( ("(",
                        (op^ ( ((Int.toString ( t1 )),
                                (op^ ( (", ",
                                        (op^ ( ((op^ ( ("\"", t2) )),
                                                "\"") ))) ))) ))) )),
                ")") ))
    and t_show x = (show_t ( x ))
    fun eq_t ((t5, t7), (t6, t8)) =
        ((op= ( (t5, t6) )) andalso (op= ( (t7, t8) )))
    and t_eq x = (eq_t ( x ))
    datatype t2 = One | Two (* [.deriving show,compare] *)
    fun show_t2 t9 = (case t9 of One => "One" | Two => "Two")
    and t2_show x = (show_t2 ( x ))
    fun cmp_t2 (t10, t11) =
        (case (t10, t11) of
           (One, One) => EQUAL
         | (Two, Two) => EQUAL
         | (x, y) =>
             (Int.compare ( (((fn x =>
                                    (case x of
                                       One => 0
                                     | Two => 1)) ( x )),
                             ((fn x =>
                                    (case x of
                                       One => 0
                                     | Two => 1)) ( y ))) )))
    and t2_cmp x = (cmp_t2 ( x ))
    and t2_compare x = (cmp_t2 ( x ))
    and compare_t2 x = (cmp_t2 ( x ))
  end
```
