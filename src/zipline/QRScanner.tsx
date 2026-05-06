import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { MdCancel } from "react-icons/md";
import type { QRCodeData } from "../types/ziplineTypes";

interface QRScannerProps {
  onScan: (data: QRCodeData) => void;
  onClose: () => void;
}

function QRScanner({ onScan, onClose }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1,
      },
      false,
    );

    scannerRef.current = scanner;

    scanner.render(
      (result) => {
        try {
          const url = new URL(result);
          const roomID = url.searchParams.get("roomID");
          const pairingCode = url.searchParams.get("pairingCode");

          if (roomID && pairingCode) {
            scanner.clear();
            onScan({ roomID, pairingCode });
          } else {
            setError("QR code missing pairing info");
          }
        } catch {
          setError("Invalid QR code — must be a Zipline pairing link");
        }
      },
      (error) => {
        if (
          error &&
          !error.toString().includes("NotAllowedError") &&
          !error.toString().includes("NotFoundException")
        ) {
          console.warn("QR Scan Warning:", error);
        }
      },
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [onScan]);

  return (
    <div className="qr-scanner-overlay">
      <div className="qr-scanner-container">
        <button className="qr-scanner-close" onClick={onClose}>
          <MdCancel />
        </button>
        <h2>Scan QR Code</h2>
        <div id="qr-reader" className="qr-reader" />
        {error && <p className="qr-error">{error}</p>}
        <p className="qr-instruction">
          Point your camera at the QR code to scan
        </p>
      </div>
    </div>
  );
}

export default QRScanner;
