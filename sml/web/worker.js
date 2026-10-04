// Web Worker: receives {source, quiet}, runs it on a fresh Moscow ML wasm
// runtime, streams output lines, posts the final result. The main thread
// enforces timeouts by terminating this worker, so each worker runs at most
// one program.
import createRuntime from '../dist/camlrunm.mjs';
import { runSML } from '../js/runsml.mjs';

const assetsReady = (async () => {
  const [manifest, data] = await Promise.all([
    fetch(new URL('../dist/mosml-assets.json', import.meta.url)).then((r) => r.json()),
    fetch(new URL('../dist/mosml-assets.data', import.meta.url)).then((r) => r.arrayBuffer()),
  ]);
  return { manifest, data };
})();

onmessage = async (e) => {
  const { source, quiet } = e.data;
  try {
    const assets = await assetsReady;
    const result = await runSML(source, {
      quiet,
      onStdout: (s) => postMessage({ type: 'line', stream: 'out', text: s }),
      onStderr: (s) => postMessage({ type: 'line', stream: 'err', text: s }),
    }, { createRuntime, assets });
    postMessage({ type: 'result', ...result });
  } catch (err) {
    postMessage({ type: 'error', message: String(err) });
  }
};
