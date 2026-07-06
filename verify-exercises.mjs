// Grade every exercise's solution (must pass all tests) and starter (must
// pass none) through the real Moscow ML runner. Driven by verify-exercises.sh.
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const [jsonPath, smlSrc] = process.argv.slice(2);
const { buildTestSource, gradeRun } =
  await import(pathToFileURL(join(smlSrc, 'examples/exercises/exercise-core.mjs')));
const { runSMLWithTimeout } =
  await import(pathToFileURL(join(smlSrc, 'js/run-node.mjs')));

const exercises = JSON.parse(readFileSync(jsonPath, 'utf8'));
let failures = 0;

for (const ex of exercises) {
  const label = `L${ex.lecture} "${ex.title}"`;
  const grade = async (code) => {
    const res = await runSMLWithTimeout(buildTestSource(code, ex.tests),
      { quiet: true, timeoutMs: 15000 });
    return { verdicts: gradeRun(ex.tests, res.stdout.split('\n')), res };
  };

  if (!ex.solution) {
    failures++;
    console.log(`FAIL ${label}: no solution provided`);
    continue;
  }
  const sol = await grade(ex.solution);
  const bad = sol.verdicts.filter((v) => v.status !== 'pass');
  if (bad.length) {
    failures++;
    console.log(`FAIL ${label} solution: ${bad.map((v) => `${v.name}=${v.status} ${v.detail}`).join('; ')}`);
    console.log(`     output: ${JSON.stringify((sol.res.stdout + sol.res.stderr).slice(0, 300))}`);
  } else {
    console.log(`PASS ${label} solution ${sol.verdicts.length}/${sol.verdicts.length}`);
  }

  const start = await grade(ex.starter);
  const cheats = start.verdicts.filter((v) => v.status === 'pass');
  if (cheats.length) {
    failures++;
    console.log(`FAIL ${label} starter already passes: ${cheats.map((v) => v.name).join('; ')}`);
  }
}
console.log(failures ? `\n${failures} problem(s)` : '\nall exercises verified');
process.exit(failures ? 1 : 0);
