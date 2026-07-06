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

check('choice question unaffected', await page.locator('.sml-choice').count() === 1);

await browser.close();
server.close();
process.exit(failures ? 1 : 0);
