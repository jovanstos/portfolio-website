import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor/editor/editor.api.js";
import EditorWorker from "monaco-editor/editor/editor.worker.js?worker";
import {
  conf,
  language,
} from "monaco-editor/languages/definitions/python/python.js";
// Serve the editor and its worker locally; never fall back to the loader's old CDN version.
globalThis.MonacoEnvironment = { getWorker: () => new EditorWorker() };
monaco.languages.register({ id: "python" });
monaco.languages.setLanguageConfiguration("python", conf);
monaco.languages.setMonarchTokensProvider("python", language);
loader.config({ monaco });
