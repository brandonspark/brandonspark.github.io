// Drop-in `camlrunm` replacement running the wasm32 runtime under Node with
// direct host-filesystem access. Used by scripts/build-bytecode-32.sh to make
// the Moscow ML build produce 32-bit bytecode artifacts.
import createMosmlRuntime from '../dist/camlrunm-node.mjs';

let exitCode = 0;
const runtime = await createMosmlRuntime({
  onExit: (code) => { exitCode = code; },
});
try {
  const ret = runtime.callMain(process.argv.slice(2));
  if (typeof ret === 'number' && ret !== 0) exitCode = ret;
} catch (e) {
  if (e && e.name === 'ExitStatus') exitCode = e.status;
  else throw e;
}
process.exit(exitCode);
