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

// URL-safe base64 over bytes, for share links.
const b64enc = (bytes) => btoa(String.fromCharCode(...bytes))
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64dec = (s) =>
  Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

// SML source is repetitive; deflate (built into the browser) shrinks share
// links to roughly a third. Payloads are tagged: "z" deflate-raw, "r" plain.
async function pipeBytes(bytes, stream) {
  const out = new Response(new Blob([bytes]).stream().pipeThrough(stream));
  return new Uint8Array(await out.arrayBuffer());
}

async function encodeShare(text) {
  const bytes = new TextEncoder().encode(text);
  if (typeof CompressionStream !== 'undefined') {
    return 'z' + b64enc(await pipeBytes(bytes, new CompressionStream('deflate-raw')));
  }
  return 'r' + b64enc(bytes);
}

async function decodeShare(payload) {
  const bytes = b64dec(payload.slice(1));
  if (payload[0] === 'z') {
    return new TextDecoder().decode(
      await pipeBytes(bytes, new DecompressionStream('deflate-raw')));
  }
  return new TextDecoder().decode(bytes);
}

// Share-link fragment: #sml=<exercise index>.<starter hash>.<tagged payload>.
// The starter hash keeps a stale link from being applied to the wrong (or a
// since-edited) exercise.
async function sharedCodeFor(exIndex, starter) {
  const m = location.hash.match(/^#sml=(\d+)\.([a-z0-9]+)\.([zr][A-Za-z0-9_-]+)$/);
  if (!m || Number(m[1]) !== exIndex || m[2] !== hashCode(starter)) return null;
  try { return await decodeShare(m[3]); } catch { return null; }
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
      <button class="sml-share" title="Copy a link to this code">Share</button>
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
  const exIndex = document.querySelectorAll('.sml-exercise').length - 1;
  const storageKey = `sml-code:${exercise.title}:${hashCode(exercise.starter)}`;
  let stored = null;
  try { stored = localStorage.getItem(storageKey); } catch { /* private mode */ }
  el('textarea').value = stored ?? exercise.starter;
  // An explicit share link beats saved work; a shared page scrolls to its
  // exercise. Decoding is async (native deflate), so it lands via setSource.
  sharedCodeFor(exIndex, exercise.starter).then((shared) => {
    if (shared === null) return;
    setSource(shared);
    container.scrollIntoView({ block: 'center' });
  });
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
    // The IDE weighs a few MB; load it only when the exercise is about to be
    // seen (or is focused), not for every visitor who came for the video.
    let ideStarted = false;
    const startIde = () => {
      if (ideStarted) return;
      ideStarted = true;
      import(new URL('./monaco-editor.js', import.meta.url))
        .then((mod) => mod.upgrade(el('.sml-editor'), getSource(), options.ide,
          () => { if (!el('.sml-run').disabled) run(); }, persist))
        .then((api) => { getSource = api.getValue; setSource = api.setValue; })
        .catch((e) => console.warn('sml: IDE editor unavailable, using plain editor:', e));
    };
    el('textarea').addEventListener('focus', startIde, { once: true });
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((en) => en.isIntersecting)) { io.disconnect(); startIde(); }
      }, { rootMargin: '400px' });
      io.observe(container);
    } else {
      startIde();
    }
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

    // Fresh random sentinel per run: printing sentinel-shaped lines from
    // user code neither spoofs results nor leaks harness noise.
    const marker = `MOSML_TEST_${Math.random().toString(36).slice(2, 10)}`;
    const stdoutLines = [];
    worker = new Worker(workerUrl, { type: 'module' });
    worker.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === 'line') {
        if (msg.stream === 'out') stdoutLines.push(msg.text);
        if (!isTestLine(msg.text, marker)) { outputLines.push(msg.text); renderOutput(); }
      } else if (msg.type === 'result' || msg.type === 'error') {
        const results = gradeRun(exercise.tests, stdoutLines, marker);
        // If nothing ran, the program didn't compile: per-test rows would be
        // statements about runs that never happened, so show only the
        // compiler's diagnostics.
        const ran = results.some((r) => r.status !== 'not run');
        renderResults(ran ? results : []);
        const passed = results.filter((r) => r.status === 'pass').length;
        finish(msg.type === 'error' ? `runner error: ${msg.message}`
          : ran ? `${passed}/${results.length} passed`
          : 'did not compile');
      }
    };
    worker.onerror = (e) => { outputLines.push(e.message ?? 'worker error'); finish('worker error'); };
    worker.postMessage({
      source: buildTestSource(getSource(), exercise.tests, marker),
      quiet,
    });
    timer = setTimeout(() => {
      renderResults(gradeRun(exercise.tests, stdoutLines, marker));
      finish('timed out');
    }, timeoutMs);
  }

  el('.sml-run').onclick = run;
  el('.sml-stop').onclick = () => finish('stopped');
  el('.sml-reset').onclick = () => {
    setSource(exercise.starter);
    try { localStorage.removeItem(storageKey); } catch { /* private mode */ }
  };
  el('.sml-share').onclick = async () => {
    const hash = `#sml=${exIndex}.${hashCode(exercise.starter)}.${await encodeShare(getSource())}`;
    history.replaceState(null, '', hash);
    const url = location.href;
    const done = (msg) => { el('.sml-status').textContent = msg; };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => done('link copied'), () => done('link ready in the address bar'));
    } else {
      done('link ready in the address bar');
    }
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

// Free-form playground: editor + Run + output, no tests. Toplevel responses
// (`val x = 5 : int`) show by default — that's the learning experience — with
// a checkbox to hide them. Persistence, share links, and the optional
// Monaco+millet IDE work exactly as in exercises.
export function mountPlayground(container, options = {}) {
  const { timeoutMs = 10000 } = options;
  const workerUrl = options.workerUrl ?? new URL('../../web/worker.js', import.meta.url);
  const sample = options.sample ?? `fun fact 0 = 1
  | fact n = n * fact (n - 1)

val () = print ("fact 10 = " ^ Int.toString (fact 10) ^ "\\n")
`;

  ensureEditorCss();
  container.classList.add('sml-exercise', 'sml-playground');
  container.innerHTML = `
    <div class="sml-editor">
      <pre class="sml-highlight" aria-hidden="true"><code class="nohighlight"></code></pre>
      <textarea spellcheck="false" wrap="off"></textarea>
    </div>
    <div class="sml-controls">
      <button class="sml-run" title="Ctrl+Enter">Run</button>
      <button class="sml-stop" disabled>Stop</button>
      <button class="sml-reset">Reset</button>
      <button class="sml-share" title="Copy a link to this code">Share</button>
      <label class="sml-quiet"><input type="checkbox"> hide toplevel responses</label>
      <span class="sml-status"></span>
    </div>
    <pre class="sml-output" hidden></pre>`;
  const el = (sel) => container.querySelector(sel);

  const exIndex = document.querySelectorAll('.sml-exercise').length - 1;
  const storageKey = `sml-playground:${hashCode(sample)}`;
  let stored = null;
  try { stored = localStorage.getItem(storageKey); } catch { /* private mode */ }
  el('textarea').value = stored ?? sample;

  let getSource = () => el('textarea').value;
  let setSource = attachHighlighting(el('.sml-editor'));
  sharedCodeFor(exIndex, sample).then((shared) => {
    if (shared === null) return;
    setSource(shared);
    container.scrollIntoView({ block: 'center' });
  });

  let persistTimer = null;
  const persist = () => {
    clearTimeout(persistTimer);
    persistTimer = setTimeout(() => {
      try {
        const v = getSource();
        if (v === sample) localStorage.removeItem(storageKey);
        else localStorage.setItem(storageKey, v);
      } catch { /* private mode */ }
    }, 400);
  };
  el('textarea').addEventListener('input', persist);

  if (options.ide) {
    let ideStarted = false;
    const startIde = () => {
      if (ideStarted) return;
      ideStarted = true;
      import(new URL('./monaco-editor.js', import.meta.url))
        .then((mod) => mod.upgrade(el('.sml-editor'), getSource(), options.ide,
          () => { if (!el('.sml-run').disabled) run(); }, persist))
        .then((api) => { getSource = api.getValue; setSource = api.setValue; })
        .catch((e) => console.warn('sml: IDE editor unavailable, using plain editor:', e));
    };
    el('textarea').addEventListener('focus', startIde, { once: true });
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((en) => en.isIntersecting)) { io.disconnect(); startIde(); }
      }, { rootMargin: '400px' });
      io.observe(container);
    } else {
      startIde();
    }
  }

  let worker = null, timer = null, outputLines = [];
  function renderOutput() {
    const pre = el('.sml-output');
    const hasContent = outputLines.some((l) => l.trim() !== '');
    pre.hidden = !hasContent;
    if (hasContent) pre.textContent = outputLines.join('\n').replace(/\n+$/, '');
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
    el('.sml-run').disabled = true;
    el('.sml-stop').disabled = false;
    el('.sml-status').textContent = 'running…';
    worker = new Worker(workerUrl, { type: 'module' });
    worker.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === 'line') {
        outputLines.push(msg.text);
        renderOutput();
      } else if (msg.type === 'result') {
        finish(`done (exit ${msg.exitCode})`);
      } else if (msg.type === 'error') {
        outputLines.push(msg.message);
        renderOutput();
        finish('runner error');
      }
    };
    worker.onerror = (e) => { outputLines.push(e.message ?? 'worker error'); renderOutput(); finish('worker error'); };
    worker.postMessage({
      source: getSource(),
      quiet: el('.sml-quiet input').checked,
    });
    timer = setTimeout(() => { finish('timed out'); }, timeoutMs);
  }

  el('.sml-run').onclick = run;
  el('.sml-stop').onclick = () => finish('stopped');
  el('.sml-reset').onclick = () => {
    setSource(sample);
    try { localStorage.removeItem(storageKey); } catch { /* private mode */ }
  };
  el('.sml-share').onclick = async () => {
    const hash = `#sml=${exIndex}.${hashCode(sample)}.${await encodeShare(getSource())}`;
    history.replaceState(null, '', hash);
    const url = location.href;
    const done = (msg) => { el('.sml-status').textContent = msg; };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => done('link copied'), () => done('link ready in the address bar'));
    } else {
      done('link ready in the address bar');
    }
  };
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
