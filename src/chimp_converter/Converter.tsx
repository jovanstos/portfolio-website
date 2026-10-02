import { useEffect, useId, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { convertImage } from "../api/converter";
import type { ImageFormat } from "../types/converterTypes";
import "../styles/Converter.css";
export default function Converter({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const Heading = embedded ? "h2" : "h1";
  const [selection, setSelection] = useState<{
    file: File;
    preview: string;
  } | null>(null);
  const [format, setFormat] = useState<ImageFormat>("png");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(
    null,
  );
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  useEffect(
    () => () => {
      if (selection) URL.revokeObjectURL(selection.preview);
    },
    [selection],
  );
  const mutation = useMutation({
    mutationFn: convertImage,
    onSuccess: (blob, variables) => {
      const stem = variables.file.name.replace(/\.[^.]+$/, "") || "converted";
      setResult({ blob, name: `${stem}.${variables.outputFormat}` });
    },
    onError: (failure: Error) => setError(failure.message),
  });
  function select(file: File) {
    setError("");
    setResult(null);
    if (file.size > 5 * 1024 * 1024) {
      setError("Choose an image no larger than 5 MiB.");
      return;
    }
    if (
      !["image/png", "image/jpeg", "image/webp", "image/gif"].includes(
        file.type,
      )
    ) {
      setError("Choose a PNG, JPEG, WebP, or GIF image.");
      return;
    }
    setSelection({ file, preview: URL.createObjectURL(file) });
  }
  function download() {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = result.name;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section id="converter" role={embedded ? undefined : "main"}>
      <header>
        <img
          src="/chimp.gif"
          width="140"
          height="100"
          alt="Running chimpanzee"
        />
        <Heading>Chimp Converter</Heading>
        <p>One image in. Another format out.</p>
      </header>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (selection && !mutation.isPending) {
            setError("");
            setResult(null);
            mutation.mutate({ file: selection.file, outputFormat: format });
          }
        }}
      >
        <label
          className={`file-dropzone ${dragging ? "dragging" : ""}`}
          htmlFor={id}
          onDragOver={(event) => {
            event.preventDefault();
            if (!mutation.isPending) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            const file = event.dataTransfer.files[0];
            if (file && !mutation.isPending) select(file);
          }}
        >
          <input
            ref={input}
            id={id}
            className="sr-only"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            disabled={mutation.isPending}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) select(file);
            }}
          />
          <span>
            {selection
              ? "Choose a replacement image"
              : "Choose an image or drop it here"}
          </span>
        </label>
        {selection && (
          <div className="converter-preview">
            <img src={selection.preview} alt="Selected image preview" />
            <p>
              {selection.file.name} · {(selection.file.size / 1024).toFixed(1)}{" "}
              KiB
            </p>
            <button
              className="secondary-button"
              type="button"
              disabled={mutation.isPending}
              onClick={() => {
                setSelection(null);
                setResult(null);
                input.current?.focus();
              }}
            >
              Remove
            </button>
          </div>
        )}
        <div id="converter-options">
          <label htmlFor={`${id}-format`}>Output format</label>
          <select
            id={`${id}-format`}
            value={format}
            disabled={mutation.isPending}
            onChange={(event) => setFormat(event.target.value as ImageFormat)}
          >
            {(["png", "jpg", "jpeg", "webp", "gif"] as const).map((option) => (
              <option key={option} value={option}>
                {option.toUpperCase()}
              </option>
            ))}
          </select>
          <button
            className="primary-button"
            disabled={!selection || mutation.isPending}
          >
            {mutation.isPending ? "Converting…" : "Convert"}
          </button>
        </div>
      </form>
      {error && (
        <p className="inline-error" role="alert">
          {error}
        </p>
      )}
      {result && (
        <div role="status">
          <p>Ready: {result.name}</p>
          <button className="primary-button" onClick={download}>
            Download converted image
          </button>
        </div>
      )}
      <p className="converter-note">
        Up to 5 MiB and 25 megapixels. Animated GIF inputs convert their first
        frame only. Images are sent to this server for conversion, not saved as
        uploads.
      </p>
    </section>
  );
}
