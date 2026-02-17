import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import os from "os";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Compiles source code string to WASM binary buffer.
 * @param sourceCode - The code written in the lanauge
 * @returns Promise<Buffer> The binary data of the .wasm file
 */
export const compileUserCode = async (sourceCode: string): Promise<Buffer> => {
  // 1. Generate Unique IDs for this request (Prevents collisions between users)
  const runId = nanoid();

  const tempDir = os.tmpdir();
  const inputFilePath = path.join(tempDir, `${runId}.van`);
  const outputWasmPath = path.join(tempDir, `${runId}.wasm`);
  const pythonScriptPath = path.join(__dirname, "../../python/compiler.py");

  try {
    // Write the user's string to a temp file
    await fs.writeFile(inputFilePath, sourceCode);

    // Spawn Python Process
    // Command: python3 compiler.py <input> <output>
    await new Promise<void>((resolve, reject) => {
      const process = spawn("python3", [
        pythonScriptPath,
        inputFilePath,
        outputWasmPath,
      ]);

      let stderrData = "";

      process.stderr.on("data", (data) => {
        stderrData += data.toString();
      });

      process.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`Compilation failed: ${stderrData}`));
        } else {
          resolve();
        }
      });
    });

    // Read the generated WASM file into a Buffer
    const wasmBuffer = await fs.readFile(outputWasmPath);

    return wasmBuffer;
  } catch (error) {
    console.error("Compiler Service Error:", error);
    throw error;
  } finally {
    // Cleanup: Delete temp files
    try {
      await fs.unlink(inputFilePath).catch(() => {}); // Ignore if missing
      await fs.unlink(outputWasmPath).catch(() => {});
    } catch (e) {
      console.error("Cleanup error", e);
    }
  }
};

/**
 * Runs the PIM classifier model via a spawned Python process.
 * @param data - Array of numbers to classify (e.g. [0.5, 0.1, 100, 0.2, 15, 2])
 */
export const runPIMClassifier = async (data: number[]): Promise<any> => {
  const pythonScriptPath = path.join(__dirname, "../../python/PIM.py");
  const pythonCommand = "python3";

  return new Promise((resolve, reject) => {
    const pyProcess = spawn(pythonCommand, [
      pythonScriptPath,
      JSON.stringify(data),
    ]);

    let stdoutData = "";
    let stderrData = "";

    pyProcess.stdout.on("data", (data) => {
      stdoutData += data.toString();
    });

    pyProcess.stderr.on("data", (data) => {
      stderrData += data.toString();
    });

    pyProcess.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`Python Error: ${stderrData}`));
      }

      try {
        const result = JSON.parse(stdoutData);
        if (result.error) {
          reject(new Error(result.error));
        } else {
          resolve(result.prediction);
        }
      } catch (e) {
        reject(new Error(`Failed to parse Python output: ${stdoutData}`));
      }
    });
  });
};
