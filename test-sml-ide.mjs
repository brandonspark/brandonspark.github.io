// Local test for the Monaco+millet exercise IDE: build first (zola build),
// then `node test-sml-ide.mjs`. Uses the globally-installed playwright.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const { chromium } = require(join(execSync('npm root -g').toString().trim(), 'playwright'));
const root = join(dirname(fileURLToPath(import.meta.url)), 'public');

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.wasm': 'application/wasm', '.json': 'application/json', '.css': 'text/css', '.ttf': 'font/ttf' };
const server = createServer(async (req, res) => {
  try {
    let p = join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (p.endsWith('/')) p = join(p, 'index.html');
    let body;
    try { body = await readFile(p); } catch { body = await readFile(join(p, 'index.html')); }
    res.writeHead(200, { 'Content-Type': MIME[extname(p)] ?? 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const page = await browser.newPage();
let failures = 0;
const check = (name, cond) => { console.log(`${cond ? 'PASS' : 'FAIL'} ${name}`); if (!cond) failures++; };

await page.goto(`${base}/induction/`);
await page.waitForFunction(() => window.monaco?.editor.getModels().length > 0, null, { timeout: 30000 });
check('editor upgraded to Monaco', await page.locator('.sml-editor.sml-monaco').count() === 1);

await page.waitForTimeout(800);
let markers = await page.evaluate(() => window.monaco.editor.getModelMarkers({ owner: 'millet' }));
check('starter has no markers (unused-value filtered)', markers.length === 0);

await page.evaluate(() => window.monaco.editor.getModels()[0].setValue('val x : int = "foo"\n'));
await page.waitForFunction(() => window.monaco.editor.getModelMarkers({ owner: 'millet' }).length > 0,
  null, { timeout: 10000 });
markers = await page.evaluate(() => window.monaco.editor.getModelMarkers({ owner: 'millet' }));
check('type error marker appears', markers[0].severity === 8);

await page.waitForFunction(() => {
  const p = document.querySelector('.sml-problems');
  return p && !p.hidden && p.textContent.includes('incompatible types');
}, null, { timeout: 10000 });
check('problems list shows error text', true);

await page.evaluate(() => window.monaco.editor.getModels()[0].setValue(
  'fun fact 0 = 1 | fact n = n * fact (n - 1)\n'));
await page.waitForFunction(() => window.monaco.editor.getModelMarkers({ owner: 'millet' }).length === 0,
  null, { timeout: 10000 });
check('markers clear on valid code', true);

const ex = page.locator('.sml-exercise').first();
await ex.locator('.sml-run').click();
await page.waitForFunction(() => [...document.querySelectorAll('.sml-status')]
  .some((s) => /passed|error|timed/.test(s.textContent)), null, { timeout: 60000 });
check('grading works through Monaco', (await ex.locator('.sml-status').textContent()) === '3/3 passed');

await ex.locator('.sml-reset').click();
const val = await page.evaluate(() => window.monaco.editor.getModels()[0].getValue());
check('reset restores starter', val.includes('unimplemented'));

const opts = await page.evaluate(() => {
  const ed = window.monaco.editor.getEditors()[0];
  return {
    lineNumbers: ed.getOption(window.monaco.editor.EditorOption.lineNumbers).renderType,
    fontSize: ed.getOption(window.monaco.editor.EditorOption.fontSize),
    fontFamily: ed.getOption(window.monaco.editor.EditorOption.fontInfo).fontFamily,
    background: getComputedStyle(document.querySelector('.monaco-editor .monaco-editor-background')).backgroundColor,
  };
});
check('line numbers off', opts.lineNumbers === 0);
check('font size 16', opts.fontSize === 16);
check('site font (Hack stack)', opts.fontFamily.includes('Hack'));
check('transparent editor background',
  opts.background === 'rgba(0, 0, 0, 0)' || opts.background === 'transparent');

// custom palette applied: `fun` keyword should be the site's purple
const kwColor = await page.evaluate(() => {
  for (const s of document.querySelectorAll('.view-line span span')) {
    if (s.textContent === 'fun') return getComputedStyle(s).color;
  }
  return null;
});
check('custom palette applied (fun is #9178dd)', kwColor === 'rgb(145, 120, 221)');

check('choice question unaffected', await page.locator('.sml-choice').count() === 1);

// diagnostics formatting: no literal backticks; code spans render
await page.evaluate(() => window.monaco.editor.getModels()[0].setValue('val x : int = "foo"\n'));
await page.waitForFunction(() => {
  const p = document.querySelector('.sml-problems');
  return p && !p.hidden && p.querySelector('code');
}, null, { timeout: 10000 });
const probs = await page.evaluate(() => document.querySelector('.sml-problems').innerHTML);
check('problems list renders code spans, no raw backticks',
  probs.includes('<code>') && !probs.includes('`'));
const layout = await page.evaluate(() => {
  const li = document.querySelector('.sml-problems li');
  const editor = document.querySelector('.sml-editor.sml-monaco');
  const before = getComputedStyle(li, '::before');
  return {
    arrow: before.content,
    liTop: li.getBoundingClientRect().top,
    editorBottom: editor.getBoundingClientRect().bottom,
  };
});
check('no theme arrow on problem rows', layout.arrow === 'none' || layout.arrow === 'normal');
check('problems clear of the editor box', layout.liTop >= layout.editorBottom + 4);
const mkMsg = await page.evaluate(() =>
  window.monaco.editor.getModelMarkers({ owner: 'millet' })[0].message);
check('marker message uses quotes, not backticks', !mkMsg.includes('`') && mkMsg.includes("'int'"));

// persistence: edits survive a reload; Reset restores starter and forgets
await page.evaluate(() => window.monaco.editor.getModels()[0].setValue('(* my work *) fun fact n = 99\n'));
await page.waitForTimeout(700);
await page.reload();
await page.waitForFunction(() => window.monaco?.editor.getModels().length > 0, null, { timeout: 30000 });
const restored = await page.evaluate(() => window.monaco.editor.getModels()[0].getValue());
check('work restored after reload', restored.includes('my work'));
const exR = page.locator('.sml-exercise').first();
await exR.locator('.sml-reset').click();
await page.waitForTimeout(700);
await page.reload();
await page.waitForFunction(() => window.monaco?.editor.getModels().length > 0, null, { timeout: 30000 });
const afterReset = await page.evaluate(() => window.monaco.editor.getModels()[0].getValue());
check('reset forgets stored work', afterReset.includes('unimplemented'));

// fill_case quick fix end-to-end through the lightbulb
await page.evaluate(() => window.monaco.editor.getModels()[0].setValue(
  'fun f (x : int option) : int = case x of NONE => 0\n'));
await page.waitForFunction(() => window.monaco.editor.getModelMarkers({ owner: 'millet' }).length > 0,
  null, { timeout: 10000 });
await page.evaluate(() => {
  const ed = window.monaco.editor.getEditors()[0];
  const mk = window.monaco.editor.getModelMarkers({ owner: 'millet' })[0];
  ed.setPosition({ lineNumber: mk.startLineNumber, column: mk.startColumn });
  ed.focus();
  ed.trigger('t', 'editor.action.quickFix', {});
});
await page.waitForSelector('.action-widget, .monaco-menu, .context-view', { timeout: 10000 });
await page.keyboard.press('Enter');
await page.waitForTimeout(600);
const filled = await page.evaluate(() => window.monaco.editor.getModels()[0].getValue());
check('fill-case quick fix inserts SOME arm', filled.includes('SOME'));

// semantic tokens from millet's real lexer: a fun name on the NEXT line
// gets the function color — impossible for the line-based Monarch fallback
await page.evaluate(() => window.monaco.editor.getModels()[0].setValue('fun\nfact2 n = 1\n'));
await page.waitForFunction(() => {
  for (const s of document.querySelectorAll('.view-line span span')) {
    if (s.textContent === 'fact2' && getComputedStyle(s).color === 'rgb(62, 212, 207)') return true;
  }
  return false;
}, null, { timeout: 15000 });
check('semantic tokens: cross-line fun name colored by real lexer', true);

await browser.close();
server.close();
process.exit(failures ? 1 : 0);
