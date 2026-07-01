// Exercise grading core: build the hidden-test source and parse results.
// DOM-free so it can be tested under Node and reused by any widget.
//
// An exercise's tests are (name, SML boolean expression) pairs. The user's
// code is followed by one declaration per test that prints a sentinel line:
//   MOSML_TEST <index> PASS
//   MOSML_TEST <index> FAIL <detail>
// If the user's code fails to compile, the toplevel aborts the file before
// any sentinel prints, and every test stays in "not run" — which grades as
// failure, with the compiler diagnostics shown in the regular output.

const SENTINEL = 'MOSML_TEST';

/** @param tests [{name, expr}] — expr is an SML expression of type bool */
export function buildTestSource(userCode, tests) {
  const harness = tests.map(({ expr }, i) => `
val () = ((if (${expr})
           then print ("${SENTINEL} ${i} PASS\\n")
           else print ("${SENTINEL} ${i} FAIL wrong answer\\n"))
          handle e => print ("${SENTINEL} ${i} FAIL raised " ^ General.exnMessage e ^ "\\n"));`).join('\n');
  return `${userCode}\n;\n${harness}\n`;
}

/** @returns {index, pass, detail} if the line is a sentinel, else null */
export function parseTestLine(line) {
  if (!line.startsWith(SENTINEL + ' ')) return null;
  const m = line.match(/^MOSML_TEST (\d+) (PASS|FAIL)\s*(.*)$/);
  if (!m) return null;
  return { index: Number(m[1]), pass: m[2] === 'PASS', detail: m[3] };
}

/**
 * Fold a finished run into per-test verdicts.
 * @returns [{name, status: 'pass'|'fail'|'not run', detail}]
 */
export function gradeRun(tests, stdoutLines) {
  const results = tests.map(({ name }) => ({ name, status: 'not run', detail: '' }));
  for (const line of stdoutLines) {
    const t = parseTestLine(line);
    if (t && results[t.index]) {
      results[t.index].status = t.pass ? 'pass' : 'fail';
      results[t.index].detail = t.detail;
    }
  }
  return results;
}

/** Lines that belong in the user-facing output pane (everything else). */
export function isTestLine(line) {
  return line.startsWith(SENTINEL + ' ');
}
