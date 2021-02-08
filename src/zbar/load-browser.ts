/**
 * Webpack File-loader will break when the extension is .wasm.
 * Changing the extension is a workaround. And because of this
 * |instantiateStreaming| is always failed due to wrong MIME type.
 * see https://github.com/webpack/webpack/issues/6725
 */
//if you encouter this problem,make a copy and change wasmUrl from '/path-to/zbar.wasm' to '/path-to/zbar.wasm.bin';
var zbarInstanceCached: any = null;
export async function loadWasmInstance(wasmUrl: string, importObj: any): Promise<WebAssembly.Instance | null> {
  // try {
  //   const output = await WebAssembly.instantiateStreaming(
  //     fetch(wasmBinaryFile),
  //     importObj
  //   );
  //   return output.instance;
  // } catch (err) {
  //   console.error('Wasm streaming compile failed: ' + err);
  //   console.error('Falling back to ArrayBuffer instantiation');
  // }
  if (!zbarInstanceCached) {
    const res = await fetch(wasmUrl);
    if (!res['ok']) {
      console.error('Failed to load wasm binary file at ' + wasmUrl);
      return null;
    }
    const binary = await res.arrayBuffer();
    const output = await WebAssembly.instantiate(binary, importObj);
    zbarInstanceCached = output.instance;
  }
  return zbarInstanceCached;
};
