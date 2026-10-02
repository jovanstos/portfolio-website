import { executeWasm } from "./wasmRuntime";
self.onmessage = async (event: MessageEvent<ArrayBuffer>) => {
  let batch: string[] = [];
  const flush = () => {
    if (batch.length) {
      self.postMessage({ type: "output", lines: batch });
      batch = [];
    }
  };
  try {
    await executeWasm(event.data, (line) => {
      batch.push(line);
      if (batch.length >= 50) flush();
    });
    flush();
    self.postMessage({ type: "done" });
  } catch (error) {
    flush();
    self.postMessage({
      type: "error",
      message: error instanceof Error ? error.message : "Runtime error.",
    });
  }
};
