import { useState } from "react";
import "../styles/Popup.css";
export default function ErrorPopup({
  isError,
  message,
}: {
  isError: boolean;
  message: string | Error | null;
}) {
  const text =
    message instanceof Error
      ? message.message
      : (message ?? "Something went wrong.");
  const [dismissed, setDismissed] = useState<string | null>(null);
  if (!isError || dismissed === text) return null;
  return (
    <div className="inline-error" role="alert">
      <p>{text}</p>
      <button type="button" onClick={() => setDismissed(text)}>
        Dismiss notice
      </button>
    </div>
  );
}
