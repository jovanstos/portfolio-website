import { useEffect, useId, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import Popup from "../components/Popup";
import type { JoinInput } from "../../backend/shared/zipline";
import { readInvitation } from "./session";
export default function QRScanner({
  onScan,
  onClose,
}: {
  onScan: (data: JoinInput) => void;
  onClose: () => void;
}) {
  const id = useId().replace(/:/g, "");
  const [error, setError] = useState("");
  const lifecycle = useRef<Promise<void>>(Promise.resolve());
  useEffect(() => {
    let disposed = false;
    let scanned = false;
    let scanner: Html5Qrcode | undefined;
    const starting = lifecycle.current
      .then(async () => {
        if (disposed) return;
        scanner = new Html5Qrcode(id);
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 200 },
          (result) => {
            if (disposed || scanned) return;
            try {
              const url = new URL(result);
              if (
                url.origin !== window.location.origin ||
                !["/zipline", "/projects/live/6"].includes(url.pathname)
              )
                throw new Error("Scan a Zipline pairing link from this site.");
              const invitation = readInvitation(url);
              if (!invitation)
                throw new Error("QR code has no pairing invitation.");
              scanned = true;
              onScan(invitation);
            } catch (failure) {
              setError(
                failure instanceof Error ? failure.message : "Invalid QR code.",
              );
            }
          },
          () => undefined,
        );
      })
      .catch(() => {
        if (!disposed)
          setError(
            "Camera unavailable or permission denied. Use Enter code instead.",
          );
      });
    return () => {
      disposed = true;
      lifecycle.current = starting
        .then(async () => {
          if (scanner?.isScanning) await scanner.stop();
          scanner?.clear();
        })
        .catch(() => undefined);
    };
  }, [id, onScan]);
  return (
    <Popup isOpen onClose={onClose} title="Scan a Zipline code">
      <div id={id} />
      {error && (
        <p className="inline-error" role="alert">
          {error}
        </p>
      )}
      <p>Point your camera at the QR code on the other device.</p>
    </Popup>
  );
}
