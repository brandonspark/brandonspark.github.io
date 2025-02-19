/*! `sml` grammar compiled for Highlight.js 11.7.0 */
(()=>{var e=(()=>{"use strict";return e=>({name:"SML (Standard ML)",
aliases:["ml"],keywords:{$pattern:"[a-z_]\\w*!?",
keyword:"abstype and andalso as case datatype do else end eqtype exception fn fun functor handle if in include infix infixr let local nonfix of op open orelse raise rec sharing sig signature struct structure then type val with withtype where while",
built_in:"array bool char exn int list option order real ref string substring vector unit word",
literal:"true false NONE SOME LESS EQUAL GREATER nil"},illegal:/\/\/|>>/,
contains:
  [ { className:"literal",
      begin:/\[(\|\|)?\]|\(\)/,
      relevance:0
    },
    e.COMMENT("\\(\\*","\\*\\)",{contains:["self"]}),
    // EDITED: just to make it separate from the others, shoved it into attribute
    {className:"attribute", begin:"'[A-Za-z_](?!')[\\w']*"},
    {className:"type",begin:"`[A-Z][\\w']*"},
    {className:"variable",begin:"\\b[A-Z][\\w']*",relevance:0},
    {begin:"[a-z_]\\w*'[\\w']*"},
    e.inherit(e.APOS_STRING_MODE,{className:"string", relevance:0}),
    e.inherit(e.QUOTE_STRING_MODE,{illegal:null}),
    // ADDED: make function names colored
    { begin:[/fun/,/\s+/,e.IDENT_RE],
      className:{1:"keyword", 3:"title.function"}
    },
    { className:"number",
      begin:"\\b(0[xX][a-fA-F0-9_]+[Lln]?|0[oO][0-7_]+[Lln]?|0[bB][01_]+[Lln]?|[0-9][0-9_]*([Lln]|(\\.[0-9_]*)?([eE][-+]?[0-9_]+)?)?)",
      relevance:0
    },
    { className:"symbol", begin:/[-=]>|\|>|>>=/ }
  ]})})();hljs.registerLanguage("sml",e)})();