// Optional Monaco + millet (SML analyzer on wasm) editor for the exercise
// widget. Loaded dynamically by exercise.js when options.ide is set; the
// plain overlay editor is upgraded in place once everything is ready.
//
// ide options: {monacoBase, workerUrl, milletUrl, theme?}
// Monaco and millet load once per page; each editor gets its own millet
// instance (analysis state is per-file), found via a model registry by the
// shared hover/definition providers.

let loading = null;
const registry = new Map(); // monaco model -> Millet instance

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`failed to load ${src}`));
    document.head.appendChild(s);
  });
}

const KEYWORDS = [
  'abstype', 'and', 'andalso', 'as', 'case', 'datatype', 'do', 'else', 'end',
  'exception', 'fn', 'fun', 'handle', 'if', 'in', 'infix', 'infixr', 'let',
  'local', 'nonfix', 'of', 'op', 'open', 'orelse', 'raise', 'rec', 'then',
  'type', 'val', 'while', 'withtype', 'eqtype', 'functor', 'include',
  'sharing', 'sig', 'signature', 'struct', 'structure', 'where',
];

const BUILTINS = [
  'array', 'bool', 'char', 'exn', 'int', 'list', 'option', 'order', 'real',
  'ref', 'string', 'substring', 'vector', 'unit', 'word',
];

const LITERALS = ['true', 'false', 'nil', 'NONE', 'SOME', 'LESS', 'EQUAL', 'GREATER'];

function registerSML(monaco) {
  monaco.languages.register({ id: 'sml', extensions: ['.sml', '.sig', '.fun'] });
  monaco.languages.setLanguageConfiguration('sml', {
    comments: { blockComment: ['(*', '*)'] },
    brackets: [['(', ')'], ['[', ']'], ['{', '}']],
    autoClosingPairs: [
      { open: '(', close: ')' },
      { open: '[', close: ']' },
      { open: '{', close: '}' },
      { open: '"', close: '"', notIn: ['string', 'comment'] },
    ],
  });
  monaco.languages.setMonarchTokensProvider('sml', {
    keywords: KEYWORDS,
    builtins: BUILTINS,
    literals: LITERALS,
    tokenizer: {
      root: [
        [/\(\*/, 'comment', '@comment'],
        [/#?"/, 'string', '@string'],
        [/''?[A-Za-z][A-Za-z0-9_']*/, 'tyvar'],
        [/~?0wx[0-9a-fA-F]+|~?0x[0-9a-fA-F]+|~?0w[0-9]+|~?[0-9]+(\.[0-9]+)?([eE]~?[0-9]+)?/, 'number'],
        [/\(\)|\[\]/, 'literal'],
        [/(fun)(\s+)([A-Za-z_][A-Za-z0-9_']*)/, ['keyword', 'white', 'function']],
        [/[a-z_][A-Za-z0-9_']*/, { cases: {
          '@keywords': 'keyword', '@builtins': 'builtin',
          '@literals': 'literal', '@default': 'identifier' } }],
        [/[A-Z][A-Za-z0-9_']*/, { cases: { '@literals': 'literal', '@default': 'constructor' } }],
        [/=>|->|\|>|>>=/, 'symbol'],
        [/::|[|=<>+\-*\/^@:;,.]/, 'operator'],
        [/[()[\]{}]/, '@brackets'],
      ],
      comment: [
        [/\(\*/, 'comment', '@push'],
        [/\*\)/, 'comment', '@pop'],
        [/[^(*]+/, 'comment'],
        [/./, 'comment'],
      ],
      string: [
        [/\\./, 'string.escape'],
        [/"/, 'string', '@pop'],
        [/[^\\"]+/, 'string'],
      ],
    },
  });
}

// Millet writes messages in its markdown convention: `code` in backticks.
// Markers render as plain text, so backticks become quotes there; the
// problems list renders them as real <code> spans.
const plainMessage = (msg) => msg.replace(/`([^`]+)`/g, "'$1'");
const htmlMessage = (msg) => msg
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/`([^`]+)`/g, '<code>$1</code>');

const BASIS = [
  'print', 'hd', 'tl', 'abs', 'map', 'foldl', 'foldr', 'length', 'rev',
  'Int.toString', 'Int.compare', 'Int.min', 'Int.max', 'Real.toString',
  'String.size', 'String.sub', 'String.concat', 'String.concatWith',
  'String.compare', 'List.map', 'List.filter', 'List.foldl', 'List.foldr',
  'List.length', 'List.rev', 'List.exists', 'List.all', 'List.tabulate',
  'Option.map', 'Option.getOpt', 'Option.isSome', 'Char.ord', 'Char.chr',
];

function registerProviders(monaco) {
  monaco.languages.registerCompletionItemProvider('sml', {
    provideCompletionItems(model, position) {
      const word = model.getWordUntilPosition(position);
      const range = new monaco.Range(
        position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);
      const K = monaco.languages.CompletionItemKind;
      const snippet = (label, insertText, documentation) => ({
        label, insertText, documentation, range,
        kind: K.Snippet,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      });
      return { suggestions: [
        ...KEYWORDS.map((k) => ({ label: k, kind: K.Keyword, insertText: k, range })),
        ...BASIS.map((f) => ({ label: f, kind: K.Function, insertText: f, range })),
        snippet('case…of', 'case ${1:x} of\n  ${2:pat} => ${3:expr}', 'case expression'),
        snippet('let…in…end', 'let\n  val ${1:x} = ${2:expr}\nin\n  ${3:body}\nend', 'let expression'),
        snippet('fun (clauses)', 'fun ${1:name} ${2:pat} = ${3:expr}\n  | ${1:name} ${4:pat} = ${5:expr}', 'clausal function'),
        snippet('datatype', 'datatype ${1:t} = ${2:Con1} | ${3:Con2}', 'datatype declaration'),
      ] };
    },
  });
  monaco.languages.registerCodeActionProvider('sml', {
    provideCodeActions(model, _range, context) {
      const millet = registry.get(model);
      if (!millet) return { actions: [], dispose() {} };
      const actions = [];
      const seen = new Set();
      for (const mk of context.markers ?? []) {
        const json = millet.fill_case(mk.startLineNumber - 1, mk.startColumn - 1);
        if (!json || seen.has(json)) continue;
        seen.add(json);
        const e = JSON.parse(json);
        actions.push({
          title: 'Fill in the missing cases',
          kind: 'quickfix',
          diagnostics: [mk],
          edit: { edits: [{ resource: model.uri, textEdit: {
            range: new monaco.Range(
              e.range.start.line + 1, e.range.start.character + 1,
              e.range.end.line + 1, e.range.end.character + 1),
            text: e.text,
          } }] },
        });
      }
      return { actions, dispose() {} };
    },
  });
  monaco.languages.registerHoverProvider('sml', {
    provideHover(model, pos) {
      const millet = registry.get(model);
      const md = millet?.hover(pos.lineNumber - 1, pos.column - 1);
      return md ? { contents: [{ value: md }] } : null;
    },
  });
  monaco.languages.registerDefinitionProvider('sml', {
    provideDefinition(model, pos) {
      const millet = registry.get(model);
      const json = millet?.defs(pos.lineNumber - 1, pos.column - 1);
      if (!json) return null;
      return JSON.parse(json).map((r) => ({
        uri: model.uri,
        range: new monaco.Range(
          r.start.line + 1, r.start.character + 1,
          r.end.line + 1, r.end.character + 1),
      }));
    },
  });
}

function load(ide) {
  loading ??= (async () => {
    await loadScript(`${ide.monacoBase}/loader.js`);
    window.MonacoEnvironment = { getWorkerUrl: () => ide.workerUrl };
    window.require.config({ paths: { vs: ide.monacoBase } });
    const monaco = await new Promise((resolve) => {
      window.require(['vs/editor/editor.main'], () => resolve(window.monaco));
    });
    registerSML(monaco);
    registerProviders(monaco);
    // Transparent background: the host page's own code-box styling (color,
    // translucency, border) shows through, so the editor matches the site's
    // plain editors across color schemes. Pass ide.themeData (a full Monaco
    // theme object) to substitute your own palette; token names are those of
    // the tokenizer above (keyword, string, comment, number, constructor,
    // literal, builtin, function, symbol, type.identifier, identifier).
    monaco.editor.defineTheme('sml-exercise', ide.themeData ?? {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#00000000',
        'editorGutter.background': '#00000000',
      },
    });
    const milletMod = await import(/* @vite-ignore */ ide.milletUrl);
    await milletMod.default();
    if (milletMod.lex_tokens) registerSemanticTokens(monaco, milletMod.lex_tokens);
    return { monaco, Millet: milletMod.Millet };
  })();
  return loading;
}

// Highlighting from millet's real SML lexer, layered over (and overriding)
// the Monarch approximation once the wasm is ready. This is what makes
// cross-line `fun` names and exotic nesting come out right — a line-based
// regex tokenizer can't.
const TOKEN_TYPES = ['keyword', 'string', 'number', 'comment', 'tyvar',
  'constructor', 'literal', 'builtin', 'function', 'symbol'];

function registerSemanticTokens(monaco, lexTokens) {
  const index = new Map(TOKEN_TYPES.map((t, i) => [t, i]));
  monaco.languages.registerDocumentSemanticTokensProvider('sml', {
    getLegend: () => ({ tokenTypes: TOKEN_TYPES, tokenModifiers: [] }),
    provideDocumentSemanticTokens(model) {
      const toks = JSON.parse(lexTokens(model.getValue()));
      const data = [];
      let prevLine = 0, prevChar = 0;
      for (const t of toks) {
        data.push(
          t.line - prevLine,
          t.line === prevLine ? t.character - prevChar : t.character,
          t.length, index.get(t.type), 0);
        prevLine = t.line;
        prevChar = t.character;
      }
      return { data: new Uint32Array(data), resultId: undefined };
    },
    releaseDocumentSemanticTokens() {},
  });
}

/// Replace the contents of `host` (the .sml-editor div) with a Monaco editor
/// carrying live millet diagnostics. Returns {getValue, setValue}.
export async function upgrade(host, value, ide, onCtrlEnter, onChange) {
  const { monaco, Millet } = await load(ide);

  host.classList.add('sml-monaco');
  host.textContent = '';
  const editor = monaco.editor.create(host, {
    language: 'sml',
    value,
    theme: ide.theme ?? 'sml-exercise',
    // Lightweight, prose-like chrome: no line numbers, gutters, folding,
    // or line highlight — visually a plain code box that happens to have
    // squiggles and hovers.
    lineNumbers: ide.lineNumbers ?? 'off',
    glyphMargin: false,
    folding: false,
    lineDecorationsWidth: 6,
    lineNumbersMinChars: 0,
    renderLineHighlight: 'none',
    guides: { indentation: false },
    minimap: { enabled: false },
    fontSize: ide.fontSize ?? 16,
    ...(ide.fontFamily ? { fontFamily: ide.fontFamily } : {}),
    padding: { top: 8, bottom: 8 },
    scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    overviewRulerLanes: 0,
    overviewRulerBorder: false,
    // Render hover/suggest widgets position:fixed so a small embedded
    // editor (overflow: hidden) can never clip them.
    fixedOverflowWidgets: true,
    'semanticHighlighting.enabled': true,
  });
  // Diagnostics also render as a list under the editor — the message must
  // not be reachable only through hover.
  const problems = document.createElement('ul');
  problems.className = 'sml-problems';
  problems.hidden = true;
  host.insertAdjacentElement('afterend', problems);
  const model = editor.getModel();
  const millet = new Millet();
  registry.set(model, millet);

  const SEVERITY = { error: 8 /* MarkerSeverity.Error */, warning: 4 };
  // 5029 "unused value" fires on every exercise starter (parameters are
  // unused until the student implements the function) — noise here, so
  // ignored by default. Override with ide.ignoreCodes.
  const ignore = new Set((ide.ignoreCodes ?? ['5029']).map(String));
  const refresh = () => {
    const diags = JSON.parse(millet.analyze(model.getValue()))
      .filter((d) => !ignore.has(String(d.code)));
    monaco.editor.setModelMarkers(model, 'millet', diags.map((d) => ({
      startLineNumber: d.range.start.line + 1,
      startColumn: d.range.start.character + 1,
      endLineNumber: d.range.end.line + 1,
      endColumn: d.range.end.character + 1,
      message: plainMessage(d.message),
      code: String(d.code),
      severity: SEVERITY[d.severity] ?? 2,
    })));
    problems.hidden = diags.length === 0;
    problems.innerHTML = '';
    for (const d of diags.slice(0, 4)) {
      const li = document.createElement('li');
      li.className = d.severity === 'error' ? 'sml-fail' : 'sml-not-run';
      li.innerHTML = `line ${d.range.start.line + 1}: ${htmlMessage(d.message)}`;
      li.onclick = () => {
        editor.setPosition({ lineNumber: d.range.start.line + 1, column: d.range.start.character + 1 });
        editor.focus();
      };
      problems.appendChild(li);
    }
  };
  let timer = null;
  model.onDidChangeContent(() => {
    clearTimeout(timer);
    timer = setTimeout(refresh, 250);
    onChange?.();
  });
  refresh();

  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, onCtrlEnter);

  return {
    getValue: () => model.getValue(),
    setValue: (v) => model.setValue(v),
  };
}
