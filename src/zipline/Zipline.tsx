import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { ZipSession, pairingLink, readInvitation } from "./session";
import type { JoinInput } from "../../backend/shared/zipline";
import "../styles/Zipline.css";
const QRScanner = lazy(() => import("./QRScanner"));
export default function Zipline({ embedded = false }: { embedded?: boolean }) {
  const Heading = embedded ? "h2" : "h1";
  const [session] = useState(() => new ZipSession());
  const snapshot = useSyncExternalStore(session.subscribe, session.getSnapshot);
  const [initialInvitation] = useState(() => readInvitation(window.location));
  const [scanner, setScanner] = useState(false);
  const [manual, setManual] = useState(false);
  const [code, setCode] = useState("");
  const [text, setText] = useState("");
  const [notice, setNotice] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const feed = useRef<HTMLUListElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    void session.start(initialInvitation);
    return () => session.dispose();
  }, [session, initialInvitation]);
  useEffect(() => {
    if (initialInvitation && (location.search || location.hash))
      navigate(location.pathname, { replace: true });
  }, [initialInvitation, navigate, location]);
  useEffect(() => {
    feed.current?.scrollTo?.({
      top: feed.current.scrollHeight,
      behavior: "auto",
    });
  }, [snapshot.messages]);
  const join = useCallback(
    (invitation: JoinInput) => {
      setScanner(false);
      setManual(false);
      void session.start(invitation);
    },
    [session],
  );
  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice("Copied!");
    } catch {
      setNotice("Clipboard unavailable. Select and copy the text manually.");
    }
  }
  function download(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const connected = snapshot.state === "connected";
  return (
    <section
      id="zipline-app"
      role={embedded ? undefined : "main"}
      aria-label="Zipline encrypted sharing"
    >
      <header className="zip-heading">
        <div>
          <Heading>Zipline</Heading>
          <p>Two devices. One private connection.</p>
        </div>
        <span className="zip-status" role="status">
          {snapshot.state === "hosting"
            ? "Waiting for your other device"
            : snapshot.state}
        </span>
      </header>
      {snapshot.error && (
        <p className="inline-error" role="alert">
          {snapshot.error}
        </p>
      )}
      {notice && <p role="status">{notice}</p>}
      {!connected && snapshot.room && (
        <div className="zip-pairing">
          <div className="zip-qr">
            <QRCodeSVG
              role="img"
              aria-label="Zipline pairing QR code"
              value={pairingLink(snapshot.room)}
              size={220}
              level="M"
              marginSize={4}
            />
          </div>
          <div>
            <h2>Scan. Connect. Share.</h2>
            <p>
              Open your other device's camera and scan this code. Keep this page
              open.
            </p>
            <p>Or enter this code on the other device:</p>
            <strong className="zip-code">{snapshot.room.code}</strong>
            <button
              className="primary-button"
              onClick={() => void copy(pairingLink(snapshot.room!))}
            >
              Copy pairing link
            </button>
            <p className="zip-note">
              Invitation expires after 10 minutes. Anyone with the link can
              pair—share it privately.
            </p>
          </div>
        </div>
      )}
      {!connected && (
        <div className="zip-alternatives">
          <button className="secondary-button" onClick={() => setScanner(true)}>
            Scan instead
          </button>
          <button
            className="secondary-button"
            onClick={() => setManual((value) => !value)}
          >
            Enter code
          </button>
          {["interrupted", "closed"].includes(snapshot.state) && (
            <button
              className="primary-button"
              onClick={() => void session.start()}
            >
              Create fresh session
            </button>
          )}
        </div>
      )}
      {manual && !connected && (
        <form
          className="zip-manual"
          onSubmit={(event) => {
            event.preventDefault();
            join({ code: code.trim() });
          }}
        >
          <label htmlFor="zip-code">Pairing code</label>
          <input
            id="zip-code"
            autoComplete="off"
            value={code}
            maxLength={8}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
          />
          <button
            className="primary-button"
            disabled={code.trim().length !== 8}
          >
            Join device
          </button>
        </form>
      )}
      {scanner && (
        <Suspense fallback={<p role="status">Loading scanner…</p>}>
          <QRScanner onScan={join} onClose={() => setScanner(false)} />
        </Suspense>
      )}
      {connected && (
        <>
          <div className="zip-toolbar">
            <span>Encrypted connection ready</span>
            <button className="danger-button" onClick={() => session.close()}>
              Leave session
            </button>
          </div>
          <ul
            ref={feed}
            className="zip-feed"
            aria-label="Shared items"
            aria-live="polite"
          >
            {snapshot.messages.length === 0 && (
              <li className="zip-empty">
                Send a note or a file. It stays only in your browsers.
              </li>
            )}
            {snapshot.messages.map((message) => (
              <li key={message.id} className={`zip-message ${message.from}`}>
                <span className="zip-note">
                  {message.from === "self" ? "You" : "Other device"} ·{" "}
                  {message.status}
                </span>
                {message.text !== undefined ? (
                  <>
                    <p>{message.text}</p>
                    <button
                      aria-label="Copy message"
                      onClick={() => void copy(message.text!)}
                    >
                      Copy
                    </button>
                  </>
                ) : (
                  <>
                    <strong>{message.name}</strong>
                    {message.blob && (
                      <button
                        onClick={() => download(message.blob!, message.name!)}
                      >
                        Download
                      </button>
                    )}
                    {message.expired && <span>File no longer retained</span>}
                  </>
                )}
              </li>
            ))}
          </ul>
          {snapshot.progress !== undefined && (
            <div className="zip-progress" role="status">
              <progress max={1} value={snapshot.progress} />
              <span>{Math.round(snapshot.progress * 100)}% acknowledged</span>
              {snapshot.direction === "sending" && (
                <button onClick={() => session.cancel()}>Cancel sending</button>
              )}
            </div>
          )}
          <form
            className="zip-composer"
            onSubmit={(event) => {
              event.preventDefault();
              if (text.trim() && !snapshot.busy) {
                void session.sendText(text);
                setText("");
              }
            }}
          >
            <label className="sr-only" htmlFor="zip-text">
              Message
            </label>
            <textarea
              id="zip-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="A note for your other device…"
              rows={2}
            />
            <input
              ref={input}
              className="sr-only"
              type="file"
              aria-label="Choose file to send"
              tabIndex={-1}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void session.sendFile(file);
              }}
            />
            <button
              type="button"
              className="secondary-button"
              disabled={snapshot.busy}
              onClick={() => input.current?.click()}
            >
              Send file
            </button>
            <button
              className="primary-button"
              disabled={snapshot.busy || !text.trim()}
            >
              Send note
            </button>
          </form>
        </>
      )}
      <details className="zip-privacy">
        <summary>Limits & privacy</summary>
        <p>
          5 MiB per file (5,242,880 bytes), two devices, short-lived sessions.
          Transfers have byte quotas and timeouts. Files, chat, and keys are not
          stored on the server; refreshing or leaving ends the session. Download
          files you want to keep.
        </p>
        <p>
          The relay sees connection information and file sizes. Encryption does
          not provide anonymity, prevent harmful content, or replace trust in
          this site. Use it only for lawful sharing. This is an experimental
          personal tool, not an audited secure messenger.
        </p>
      </details>
    </section>
  );
}
