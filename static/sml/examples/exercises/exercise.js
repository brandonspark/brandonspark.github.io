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

export function mountExercise(container, exercise, options = {}) {
  const { timeoutMs = 10000, quiet = true } = options;
  const workerUrl = options.workerUrl ?? new URL('../../web/worker.js', import.meta.url);

  container.classList.add('sml-exercise');
  container.innerHTML = `
    <h3></h3>
    <div class="sml-prompt"></div>
    <textarea spellcheck="false"></textarea>
    <div class="sml-controls">
      <button class="sml-run">Run tests</button>
      <button class="sml-stop" disabled>Stop</button>
      <button class="sml-reset">Reset</button>
      <span class="sml-status"></span>
    </div>
    <ul class="sml-results"></ul>
    <pre class="sml-output" hidden></pre>`;
  const el = (sel) => container.querySelector(sel);
  el('h3').textContent = exercise.title;
  el('.sml-prompt').innerHTML = exercise.prompt;
  el('textarea').value = exercise.starter;

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
    const pre = el('.sml-output');
    pre.hidden = outputLines.length === 0;
    pre.textContent = outputLines.join('\n');
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
      source: buildTestSource(el('textarea').value, exercise.tests),
      quiet,
    });
    timer = setTimeout(() => {
      renderResults(gradeRun(exercise.tests, stdoutLines));
      finish('timed out');
    }, timeoutMs);
  }

  el('.sml-run').onclick = run;
  el('.sml-stop').onclick = () => finish('stopped');
  el('.sml-reset').onclick = () => { el('textarea').value = exercise.starter; };
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
