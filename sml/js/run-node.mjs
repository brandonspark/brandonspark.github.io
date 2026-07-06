// Node-side run-button API with timeout: executes SML in a worker thread and
// terminates it if it exceeds timeoutMs (same design as the browser Worker).
import { Worker } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';

const workerPath = fileURLToPath(new URL('./node-worker.mjs', import.meta.url));

/** @returns {stdout, stderr, exitCode, timedOut} */
export function runSMLWithTimeout(source, { quiet = false, timeoutMs = 10000 } = {}) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(workerPath, { workerData: { source, quiet } });
    let stdout = '', stderr = '';
    const timer = setTimeout(async () => {
      await worker.terminate();
      resolve({ stdout, stderr, exitCode: null, timedOut: true });
    }, timeoutMs);
    worker.on('message', (msg) => {
      if (msg.type === 'line') {
        if (msg.stream === 'out') stdout += msg.text + '\n';
        else stderr += msg.text + '\n';
      } else if (msg.type === 'result') {
        clearTimeout(timer);
        worker.terminate();
        resolve({ ...msg, type: undefined, timedOut: false });
      }
    });
    worker.on('error', (e) => { clearTimeout(timer); reject(e); });
  });
}
