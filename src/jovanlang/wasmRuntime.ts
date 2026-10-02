export async function executeWasm(
  buffer: ArrayBuffer,
  print: (text: string) => void,
) {
  const state: { memory?: WebAssembly.Memory } = {};
  let lines = 0;
  let bytes = 0;
  function output(text: string) {
    lines++;
    bytes += new TextEncoder().encode(text).length;
    if (lines > 1000 || bytes > 256 * 1024)
      throw new Error("Output limit reached (1,000 lines / 256 KiB).");
    print(text);
  }
  const result = await WebAssembly.instantiate(buffer, {
    env: {
      print_num: (number: number) => output(String(number)),
      print_str: (pointer: number) => {
        const memory = state.memory;
        if (!memory) throw new Error("Program memory is unavailable.");
        const view = new Uint8Array(memory.buffer);
        if (!Number.isInteger(pointer) || pointer < 0 || pointer >= view.length)
          throw new Error("Invalid string pointer.");
        let end = pointer;
        while (
          end < view.length &&
          view[end] !== 0 &&
          end - pointer <= 256 * 1024
        )
          end++;
        if (end === view.length || end - pointer > 256 * 1024)
          throw new Error("Unterminated or oversized string.");
        output(new TextDecoder().decode(view.subarray(pointer, end)));
      },
    },
  });
  const exports = result.instance.exports;
  if (
    !(exports.memory instanceof WebAssembly.Memory) ||
    typeof exports.main !== "function"
  )
    throw new Error("Program must export memory and main.");
  state.memory = exports.memory;
  exports.main();
}
