// Exercise grading core: build the hidden-test source and parse results.
// DOM-free so it can be tested under Node and reused by any widget.
//
// An exercise's tests are (name, SML boolean expression) pairs. The user's
// code is followed by one declaration per test that prints a sentinel line:
//   <marker> <index> PASS
//   <marker> <index> FAIL <detail>
// If the user's code fails to compile, the toplevel aborts the file before
// any sentinel prints, and every test stays in "not run" — which grades as
// failure, with the compiler diagnostics shown in the regular output.

const SENTINEL = 'MOSML_TEST';

/**
 * @param tests  [{name, expr}] — expr is an SML expression of type bool
 * @param marker sentinel prefix; pass a fresh random marker per run so user
 *               code can't spoof results by printing sentinel-shaped lines
 *
 * Sentinels print a leading newline: if the user's code ends with an
 * unterminated print, the sentinel still starts at a line boundary instead
 * of gluing onto the user's output (which would both leak harness noise
 * into the output pane and lose the test result).
 */
export function buildTestSource(userCode, tests, marker = SENTINEL) {
  const harness = tests.map(({ expr }, i) => `
val () = ((if (${expr})
           then print ("\\n${marker} ${i} PASS\\n")
           else print ("\\n${marker} ${i} FAIL wrong answer\\n"))
          handle e => print ("\\n${marker} ${i} FAIL raised " ^ General.exnMessage e ^ "\\n"));`).join('\n');
  return `${userCode}\n;\n${harness}\n`;
}

/** @returns {index, pass, detail} if the line is a sentinel, else null */
export function parseTestLine(line, marker = SENTINEL) {
  if (!line.startsWith(marker + ' ')) return null;
  const m = line.slice(marker.length).match(/^ (\d+) (PASS|FAIL)\s*(.*)$/);
  if (!m) return null;
  return { index: Number(m[1]), pass: m[2] === 'PASS', detail: m[3] };
}

/**
 * Fold a finished run into per-test verdicts.
 * @returns [{name, status: 'pass'|'fail'|'not run', detail}]
 */
export function gradeRun(tests, stdoutLines, marker = SENTINEL) {
  const results = tests.map(({ name }) => ({ name, status: 'not run', detail: '' }));
  for (const line of stdoutLines) {
    const t = parseTestLine(line, marker);
    if (t && results[t.index]) {
      results[t.index].status = t.pass ? 'pass' : 'fail';
      results[t.index].detail = t.detail;
    }
  }
  return results;
}

/** Lines that belong in the user-facing output pane (everything else). */
export function isTestLine(line, marker = SENTINEL) {
  return line.startsWith(marker + ' ');
}
