import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';

/**
 * Compiles source code string to WASM binary buffer.
 * @param sourceCode - The code written in the lanauge
 * @returns Promise<Buffer> The binary data of the .wasm file
 */
export const compileUserCode = async (sourceCode: string): Promise<Buffer> => {
    // 1. Generate Unique IDs for this request (Prevents collisions between users)
    const runId = nanoid();

    const tempDir = './temp'
    const inputFilePath = path.join(tempDir, `${runId}.van`);
    const outputWasmPath = path.join(tempDir, `${runId}.wasm`);
    const pythonScriptPath = path.join(process.cwd(), 'python/compiler.py');

    try {
        // Write the user's string to a temp file
        await fs.writeFile(inputFilePath, sourceCode);

        // Spawn Python Process
        // Command: python3 compiler.py <input> <output>
        await new Promise<void>((resolve, reject) => {
            const process = spawn('python3', [pythonScriptPath, inputFilePath, outputWasmPath]);

            let stderrData = '';

            process.stderr.on('data', (data) => {
                stderrData += data.toString();
            });

            process.on('close', (code) => {
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
            await fs.unlink(inputFilePath).catch(() => { }); // Ignore if missing
            await fs.unlink(outputWasmPath).catch(() => { });
        } catch (e) {
            console.error("Cleanup error", e);
        }
    }
};