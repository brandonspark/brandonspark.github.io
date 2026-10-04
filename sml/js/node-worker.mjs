// worker_threads entry: run one SML source and post the structured result.
// Mirrors web/worker.js so timeout behavior can be tested under Node.
import { parentPort, workerData } from 'node:worker_threads';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import createRuntime from '../dist/camlrunm.mjs';
import { runSML } from './runsml.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const assets = {
  manifest: JSON.parse(readFileSync(join(root, 'dist/mosml-assets.json'), 'utf8')),
  data: readFileSync(join(root, 'dist/mosml-assets.data')),
};

const { source, quiet } = workerData;
const result = await runSML(source, {
  quiet,
  onStdout: (s) => parentPort.postMessage({ type: 'line', stream: 'out', text: s }),
  onStderr: (s) => parentPort.postMessage({ type: 'line', stream: 'err', text: s }),
}, { createRuntime, assets });
parentPort.postMessage({ type: 'result', ...result });
