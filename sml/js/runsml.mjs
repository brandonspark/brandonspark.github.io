// Core run-button API: evaluate one SML source string with a fresh Moscow ML
// wasm runtime and return the collected output. Environment-agnostic: the
// caller supplies the runtime factory and the asset bundle.
//
// Every run gets a brand-new runtime instance (clean heap, clean FS), which
// makes crashes and timeouts non-events for the next run.

const LIB_DIR = '/mosml/lib';
const WORK_DIR = '/work';

function writeAssets(FS, assets) {
  FS.mkdirTree(LIB_DIR);
  const bytes = new Uint8Array(assets.data);
  for (const { path, offset, size } of assets.manifest) {
    FS.writeFile(`${LIB_DIR}/${path}`, bytes.subarray(offset, offset + size));
  }
}

/**
 * @param source   SML source text
 * @param options  {quiet, onStdout, onStderr}
 *                 quiet: suppress banner and `> val x = ...` echoes
 *                 onStdout/onStderr: optional per-line streaming callbacks
 * @param env      {createRuntime, assets}
 *                 createRuntime: Emscripten module factory
 *                 assets: {manifest, data} from mosml-assets.{json,data}
 * @returns {stdout, stderr, exitCode}
 */
export async function runSML(source, options, env) {
  const { createRuntime, assets } = env;
  let stdout = '', stderr = '';
  const runtime = await createRuntime({
    print: (s) => { stdout += s + '\n'; options?.onStdout?.(s); },
    printErr: (s) => { stderr += s + '\n'; options?.onStderr?.(s); },
    stdin: () => null,
  });

  writeAssets(runtime.FS, assets);
  runtime.FS.mkdirTree(WORK_DIR);
  runtime.FS.writeFile(`${WORK_DIR}/main.sml`, source);

  const args = [
    `${LIB_DIR}/mosmltop`, '-stdlib', LIB_DIR, '-P', 'full',
    ...(options?.quiet ? ['-quietdec'] : []),
    `${WORK_DIR}/main.sml`,
  ];
  let exitCode = 0;
  try {
    const ret = runtime.callMain(args);
    if (typeof ret === 'number') exitCode = ret;
  } catch (e) {
    if (e && e.name === 'ExitStatus') exitCode = e.status;
    else throw e;
  }
  return { stdout, stderr, exitCode };
}
