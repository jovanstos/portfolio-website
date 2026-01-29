import { useState } from "react";
import Editor from "@monaco-editor/react";
import { useMutation } from "@tanstack/react-query";
import { postCodeToCompiler } from "../api/python"; // Ensure this returns Promise<Blob>
import "../styles/JovanLang.css";

// Type for our terminal logs
interface LogEntry {
    id: number;
    message: string;
    type: "info" | "error" | "system";
}

function JovanLang() {
    const [code, setCode] = useState<string>(`x = 10\nprint(x)\n\nfuncvan add(a):\n    return a + 5\n\nifvan(x < 15):\n    print("Less than 15!")\n\nprint(add(x))`);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    // For adding logs to the terminal window
    const addLog = (message: string, type: "info" | "error" | "system" = "info") => {
        setLogs((prev) => [...prev, { id: Date.now() + Math.random(), message, type }]);
    };

    const compilerMutation = useMutation({
        mutationFn: postCodeToCompiler,
        onSuccess: async (blob) => {
            addLog("Compilation successful. Executing WASM...", "system");
            await runWasm(blob);
        },
        onError: (error: any) => {
            const msg = error instanceof Error ? error.message : "Unknown error occurred";
            addLog(`Compilation Failed: ${msg}`, "error");
            setIsRunning(false);
        },
    });

    // The WASM Execution Engine
    const runWasm = async (blob: Blob) => {
        try {
            // Convert Blob to ArrayBuffer
            const buffer = await blob.arrayBuffer();

            // Need a reference to the memory to read strings later
            let wasmMemory: WebAssembly.Memory | null = null;

            // Define the imports to create he bridge between Python-WASM and JS
            const importObject = {
                env: {
                    // Handle print_num(double)
                    print_num: (arg: number) => {
                        addLog(arg.toString());
                    },
                    // Handle print_str(ptr)
                    print_str: (ptr: number) => {
                        if (!wasmMemory) return;

                        // Read the bytes from WASM memory until we hit 0 which is a null terminator
                        const memoryArray = new Uint8Array(wasmMemory.buffer);
                        let str = "";
                        let i = ptr;
                        while (memoryArray[i] !== 0) {
                            str += String.fromCharCode(memoryArray[i]);
                            i++;
                        }
                        addLog(str);
                    }
                }
            };

            // Instantiate
            const { instance } = await WebAssembly.instantiate(buffer, importObject);

            // Assign memory reference so print_str can use it
            wasmMemory = instance.exports.memory as WebAssembly.Memory;

            // Run the main function
            const main = instance.exports.main as CallableFunction;

            if (main) {
                main();
                addLog("Program finished.", "system");
            } else {
                addLog("Error: No main function found in WASM module.", "error");
            }

        } catch (e: any) {
            addLog(`Runtime Error: ${e.message}`, "error");
        } finally {
            setIsRunning(false);
        }
    };

    const handleRun = () => {
        setLogs([]);
        setIsRunning(true);
        addLog("Compiling...", "system");
        compilerMutation.mutate(code);
    };

    return (
        <main id="jovanlang-ide">
            <header className="ide-header">
                <h1>JovanLang IDE</h1>
                <button
                    className="run-button"
                    onClick={handleRun}
                    disabled={isRunning || compilerMutation.isPending}
                >
                    {isRunning ? "Running..." : "Run Code ▶"}
                </button>
            </header>
            <div className="ide-workspace">
                <div className="editor-pane">
                    <Editor
                        height="100%"
                        // Using python highlighting since it's closest to my language
                        defaultLanguage="python"
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value || "")}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            scrollBeyondLastLine: false,
                        }}
                    />
                </div>
                <div className="terminal-pane">
                    <div className="terminal-header">Terminal Output</div>
                    <div className="terminal-content">
                        {logs.length === 0 && <span className="terminal-placeholder">Ready to run...</span>}
                        {logs.map((log) => (
                            <div key={log.id} className={`log-line log-${log.type}`}>
                                <span className="log-prefix">{log.type === 'system' ? '>' : '$'}</span> {log.message}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}

export default JovanLang;