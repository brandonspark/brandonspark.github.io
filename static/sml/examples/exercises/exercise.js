// Embeddable SML exercise widget: editor + Run tests + output + verdicts.
// Usage:
//   import { mountExercise } from './exercise.js';
//   mountExercise(document.getElementById('ex1'), exercise, options?);
//
// exercise: {title, prompt, starter, tests: [{name, expr}]}
//   prompt is HTML; expr is an SML expression of type bool.
// options: {timeoutMs = 10000, quiet = true, workerUrl}
//   workerUrl defaults to ../../web/worker.js (this repo's layout); pass it
//   explicitly if your site arranges the files differently (see
//   docs/EMBEDDING.md).
import { buildTestSource, gradeRun, isTestLine } from './exercise-core.mjs';
import { highlightSML } from './highlight-sml.mjs';

// djb2 — distinguishes persistence keys when an exercise's starter changes.
function hashCode(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

// Structural CSS for the highlighting editor (a transparent-text textarea
// over a highlighted <pre> with identical metrics). Colors and fonts are the
// page's business; this is only geometry and layering.
const EDITOR_CSS = `
.sml-editor { position: relative; overflow: hidden; }
.sml-editor pre.sml-highlight {
  position: absolute; inset: 0; margin: 0; padding: 0.5rem;
  font: inherit; line-height: inherit; white-space: pre;
  overflow: hidden; pointer-events: none;
}
.sml-editor pre.sml-highlight code,
.sml-solution-view code {
  font: inherit; background: none; padding: 0; margin: 0; border: none;
}
.sml-editor textarea {
  position: relative; display: block; width: 100%; min-height: 9rem;
  box-sizing: border-box; margin: 0; padding: 0.5rem; border: none;
  font: inherit; line-height: inherit; outline: none;
  /* glyphs invisible (the <pre> renders them), but color must be inherited:
     form controls don't inherit it, and the caret follows currentColor —
     a UA-default black caret vanishes on dark backgrounds. */
  color: inherit; background: transparent;
  -webkit-text-fill-color: transparent; caret-color: currentColor;
  white-space: pre; overflow-wrap: normal; overflow: auto; resize: vertical;
}
.sml-editor.sml-monaco { padding: 0; height: 15rem; resize: vertical; overflow: hidden; }
.sml-problems { list-style: none; padding: 0.2rem 0 0; margin: 0; font-size: 0.85rem; cursor: pointer; }
.sml-problems code { border: none; margin: 0; padding: 0 0.2em; color: inherit; background: rgba(128, 128, 128, 0.15); }
/* host pages often style code/pre globally (borders, colors); not inside
   Monaco's hover widget */
.monaco-hover code, .monaco-hover pre {
  border: none !important; background: none !important;
  color: inherit !important; margin: 0 !important; padding: 0 !important;
}`;

function ensureEditorCss() {
  if (document.querySelector('style[data-sml-editor]')) return;
  const style = document.createElement('style');
  style.dataset.smlEditor = '';
  style.textContent = EDITOR_CSS;
  document.head.appendChild(style);
}

// Prefer the page's own highlight.js SML setup when present (so the editor
// matches the site's other code blocks and theme); otherwise use the
// built-in tokenizer. hljs.highlight throws on `illegal` matches unless
// ignoreIllegals — and half-typed code hits those constantly.
function toHighlightedHtml(source) {
  const hl = globalThis.hljs;
  if (hl?.getLanguage?.('sml')) {
    try {
      return hl.highlight(source, { language: 'sml', ignoreIllegals: true }).value;
    } catch { /* fall through */ }
  }
  return highlightSML(source);
}

// Wire live highlighting: input re-renders, scrolling stays in sync, Tab
// indents instead of moving focus. Returns a setter for programmatic value
// changes (Reset).
function attachHighlighting(editor) {
  const textarea = editor.querySelector('textarea');
  const code = editor.querySelector('code');
  const render = () => {
    const v = textarea.value;
    code.innerHTML = toHighlightedHtml(v.endsWith('\n') ? v + ' ' : v);
  };
  const sync = () => {
    const pre = editor.querySelector('pre');
    pre.scrollTop = textarea.scrollTop;
    pre.scrollLeft = textarea.scrollLeft;
  };
  textarea.addEventListener('input', render);
  textarea.addEventListener('scroll', sync);
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart: s, selectionEnd } = textarea;
      textarea.setRangeText('  ', s, selectionEnd, 'end');
      render();
    }
  });
  render();
  return (value) => { textarea.value = value; render(); };
}

export function mountExercise(container, exercise, options = {}) {
  const { timeoutMs = 10000, quiet = true } = options;
  const workerUrl = options.workerUrl ?? new URL('../../web/worker.js', import.meta.url);

  ensureEditorCss();
  container.classList.add('sml-exercise');
  container.innerHTML = `
    <h3></h3>
    <div class="sml-prompt"></div>
    <div class="sml-editor">
      <!-- nohighlight: pages that run highlight.js's highlightAll() must not
           re-highlight this element; the widget renders its own tokens. -->
      <pre class="sml-highlight" aria-hidden="true"><code class="nohighlight"></code></pre>
      <textarea spellcheck="false" wrap="off"></textarea>
    </div>
    <div class="sml-controls">
      <button class="sml-run">Run tests</button>
      <button class="sml-stop" disabled>Stop</button>
      <button class="sml-reset">Reset</button>
      <button class="sml-solution" hidden>Show solution</button>
      <span class="sml-status"></span>
    </div>
    <pre class="sml-solution-view" hidden><code class="nohighlight"></code></pre>
    <ul class="sml-results"></ul>
    <pre class="sml-output" hidden></pre>`;
  const el = (sel) => container.querySelector(sel);
  el('h3').textContent = exercise.title;
  el('.sml-prompt').innerHTML = exercise.prompt;

  // Work in progress survives reloads: restore from localStorage, save
  // (debounced) on every edit, forget when Reset is pressed or the buffer
  // returns to the pristine starter.
  const storageKey = `sml-code:${exercise.title}:${hashCode(exercise.starter)}`;
  let stored = null;
  try { stored = localStorage.getItem(storageKey); } catch { /* private mode */ }
  el('textarea').value = stored ?? exercise.starter;
  let persistTimer = null;
  const persist = () => {
    clearTimeout(persistTimer);
    persistTimer = setTimeout(() => {
      try {
        const v = getSource();
        if (v === exercise.starter) localStorage.removeItem(storageKey);
        else localStorage.setItem(storageKey, v);
      } catch { /* private mode */ }
    }, 400);
  };

  // Source access goes through an indirection so the optional Monaco+millet
  // IDE (options.ide) can upgrade the editor in place after it loads; until
  // then (or if loading fails) the overlay editor keeps working.
  let getSource = () => el('textarea').value;
  let setSource = attachHighlighting(el('.sml-editor'));
  el('textarea').addEventListener('input', persist);
  if (options.ide) {
    import(new URL('./monaco-editor.js', import.meta.url))
      .then((mod) => mod.upgrade(el('.sml-editor'), getSource(), options.ide,
        () => { if (!el('.sml-run').disabled) run(); }, persist))
      .then((api) => { getSource = api.getValue; setSource = api.setValue; })
      .catch((e) => console.warn('sml: IDE editor unavailable, using plain editor:', e));
  }

  let worker = null, timer = null, outputLines = [];

  function renderResults(results) {
    const ul = el('.sml-results');
    ul.innerHTML = '';
    for (const r of results ?? []) {
      const li = document.createElement('li');
      li.className = `sml-${r.status.replace(' ', '-')}`;
      li.textContent = `${r.status === 'pass' ? '✓' : r.status === 'fail' ? '✗' : '·'} ${r.name}`
        + (r.detail ? ` — ${r.detail}` : '');
      ul.appendChild(li);
    }
  }

  function renderOutput() {
    // The toplevel emits a trailing newline on exit even in quiet mode;
    // whitespace-only output should not surface an (empty) pane.
    const pre = el('.sml-output');
    pre.hidden = !outputLines.some((line) => line.trim() !== '');
    pre.textContent = outputLines.join('\n').replace(/\s+$/, '');
  }

  function finish(status) {
    if (timer) clearTimeout(timer);
    if (worker) worker.terminate();
    timer = worker = null;
    el('.sml-run').disabled = false;
    el('.sml-stop').disabled = true;
    el('.sml-status').textContent = status;
  }

  function run() {
    if (worker) return;
    outputLines = [];
    renderOutput();
    renderResults(exercise.tests.map(({ name }) => ({ name, status: 'not run' })));
    el('.sml-run').disabled = true;
    el('.sml-stop').disabled = false;
    el('.sml-status').textContent = 'running…';

    const stdoutLines = [];
    worker = new Worker(workerUrl, { type: 'module' });
    worker.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === 'line') {
        if (msg.stream === 'out') stdoutLines.push(msg.text);
        if (!isTestLine(msg.text)) { outputLines.push(msg.text); renderOutput(); }
      } else if (msg.type === 'result' || msg.type === 'error') {
        const results = gradeRun(exercise.tests, stdoutLines);
        renderResults(results);
        const passed = results.filter((r) => r.status === 'pass').length;
        finish(msg.type === 'error' ? `runner error: ${msg.message}`
                                    : `${passed}/${results.length} passed`);
      }
    };
    worker.onerror = (e) => { outputLines.push(e.message ?? 'worker error'); finish('worker error'); };
    worker.postMessage({
      source: buildTestSource(getSource(), exercise.tests),
      quiet,
    });
    timer = setTimeout(() => {
      renderResults(gradeRun(exercise.tests, stdoutLines));
      finish('timed out');
    }, timeoutMs);
  }

  el('.sml-run').onclick = run;
  el('.sml-stop').onclick = () => finish('stopped');
  el('.sml-reset').onclick = () => {
    setSource(exercise.starter);
    try { localStorage.removeItem(storageKey); } catch { /* private mode */ }
  };
  if (exercise.solution) {
    const btn = el('.sml-solution');
    const view = el('.sml-solution-view');
    view.querySelector('code').innerHTML = toHighlightedHtml(exercise.solution.trim());
    btn.hidden = false;
    btn.onclick = () => {
      view.hidden = !view.hidden;
      btn.textContent = view.hidden ? 'Show solution' : 'Hide solution';
    };
  }
  el('textarea').onkeydown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !el('.sml-run').disabled) run();
  };
}

// Conceptual multiple-choice question (yes/no is just a two-choice question).
// question: {title, prompt, choices: [html], answer: index, explain?: html}
// Wrong picks are marked and can be retried; the right pick locks the
// question and reveals the explanation.
export function mountChoice(container, question) {
  container.classList.add('sml-exercise', 'sml-choice');
  container.innerHTML = `
    <h3></h3>
    <div class="sml-prompt"></div>
    <ul class="sml-choices"></ul>
    <div class="sml-explain" hidden></div>`;
  container.querySelector('h3').textContent = question.title;
  container.querySelector('.sml-prompt').innerHTML = question.prompt;

  const ul = container.querySelector('.sml-choices');
  question.choices.forEach((html, i) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.innerHTML = html;
    btn.onclick = () => {
      if (i !== question.answer) { li.classList.add('sml-fail'); return; }
      li.classList.add('sml-pass');
      for (const b of ul.querySelectorAll('button')) b.disabled = true;
      const explain = container.querySelector('.sml-explain');
      explain.innerHTML = question.explain ?? 'Correct!';
      explain.hidden = false;
    };
    li.appendChild(btn);
    ul.appendChild(li);
  });
}

// Dispatcher: mount by question.kind ('code' by default).
export function mountQuestion(container, question, options) {
  if (question.kind === 'choice') return mountChoice(container, question);
  return mountExercise(container, question, options);
}
