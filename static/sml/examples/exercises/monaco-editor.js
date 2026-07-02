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
    tokenizer: {
      root: [
        [/\(\*/, 'comment', '@comment'],
        [/#?"/, 'string', '@string'],
        [/''?[A-Za-z][A-Za-z0-9_']*/, 'type.identifier'],
        [/~?0wx[0-9a-fA-F]+|~?0x[0-9a-fA-F]+|~?0w[0-9]+|~?[0-9]+(\.[0-9]+)?([eE]~?[0-9]+)?/, 'number'],
        [/[a-z_][A-Za-z0-9_']*/, { cases: { '@keywords': 'keyword', '@default': 'identifier' } }],
        [/[A-Z][A-Za-z0-9_']*/, 'constructor'],
        [/=>|->|\|>|::|[|=<>+\-*\/^@:;,.]/, 'operator'],
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

function registerProviders(monaco) {
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
    const milletMod = await import(/* @vite-ignore */ ide.milletUrl);
    await milletMod.default();
    return { monaco, Millet: milletMod.Millet };
  })();
  return loading;
}

/// Replace the contents of `host` (the .sml-editor div) with a Monaco editor
/// carrying live millet diagnostics. Returns {getValue, setValue}.
export async function upgrade(host, value, ide, onCtrlEnter) {
  const { monaco, Millet } = await load(ide);

  host.classList.add('sml-monaco');
  host.textContent = '';
  const editor = monaco.editor.create(host, {
    language: 'sml',
    value,
    theme: ide.theme ?? 'vs-dark',
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbersMinChars: 3,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    overviewRulerLanes: 0,
  });
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
      message: d.message,
      code: String(d.code),
      severity: SEVERITY[d.severity] ?? 2,
    })));
  };
  let timer = null;
  model.onDidChangeContent(() => {
    clearTimeout(timer);
    timer = setTimeout(refresh, 250);
  });
  refresh();

  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, onCtrlEnter);

  return {
    getValue: () => model.getValue(),
    setValue: (v) => model.setValue(v),
  };
}
