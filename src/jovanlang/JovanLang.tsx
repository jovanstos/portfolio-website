import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { postCodeToCompiler } from "../api/python";
import "../styles/JovanLang.css";
const sample =
  'x = 10\nprint(x)\n\nfuncvan add(a):\n    return a + 5\n\nifvan(x < 15):\n    print("Less than 15!")\n\nprint(add(x))';
export default function JovanLang() {
  const [code, setCode] = useState(sample);
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState("Ready");
  const worker = useRef<Worker | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const generation = useRef(0);
  const request = useRef<AbortController | undefined>(undefined);
  function release() {
    worker.current?.terminate();
    worker.current = null;
    clearTimeout(timer.current);
    request.current?.abort();
    request.current = undefined;
  }
  useEffect(
    () => () => {
      generation.current++;
      worker.current?.terminate();
      clearTimeout(timer.current);
      request.current?.abort();
    },
    [],
  );
  async function run() {
    release();
    const current = ++generation.current;
    const controller = new AbortController();
    request.current = controller;
    setLogs([]);
    setStatus("Compiling");
    try {
      const blob = await postCodeToCompiler(code, controller.signal);
      const buffer = await blob.arrayBuffer();
      if (current !== generation.current) return;
      setStatus("Running");
      const runtime = new Worker(new URL("./wasm.worker.ts", import.meta.url), {
        type: "module",
      });
      worker.current = runtime;
      runtime.onmessage = (
        event: MessageEvent<{
          type: string;
          lines?: string[];
          message?: string;
        }>,
      ) => {
        if (current !== generation.current) return;
        if (event.data.type === "output")
          setLogs((lines) =>
            [...lines, ...(event.data.lines ?? [])].slice(-1000),
          );
        else {
          setStatus(
            event.data.type === "done"
              ? "Finished"
              : `Runtime error: ${event.data.message}`,
          );
          release();
        }
      };
      runtime.onerror = () => {
        if (current === generation.current) {
          setStatus("Worker failed. Try again.");
          release();
        }
      };
      timer.current = window.setTimeout(() => {
        generation.current++;
        release();
        setStatus("Stopped: five-second execution limit reached.");
      }, 5000);
      runtime.postMessage(buffer, [buffer]);
    } catch (error) {
      if (current === generation.current) {
        setStatus(
          `Compilation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
        release();
      }
    }
  }
  const running = status === "Running" || status === "Compiling";
  return (
    <section id="jovanlang-ide">
      <header className="ide-header">
        <h1>JovanLang IDE</h1>
        <div>
          <button
            className="run-button"
            onClick={() => void run()}
            disabled={running || !code.trim()}
          >
            Run code ▶
          </button>
          {running && (
            <button
              onClick={() => {
                generation.current++;
                release();
                setStatus("Stopped");
              }}
            >
              Stop
            </button>
          )}
        </div>
      </header>
      <p className="ide-status" role="status">
        {status} · Browser execution limited to five seconds.
      </p>
      <div className="ide-workspace">
        <div className="editor-pane">
          <Editor
            height="100%"
            defaultLanguage="python"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value ?? "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              ariaLabel: "JovanLang source code",
            }}
          />
        </div>
        <div className="terminal-pane">
          <div className="terminal-header">Terminal output</div>
          <pre className="terminal-content" aria-label="Program output">
            {logs.length ? logs.join("\n") : "Ready to run…"}
          </pre>
        </div>
      </div>
    </section>
  );
}
