import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import "../styles/Popup.css";
export default function Popup({
  isOpen,
  onClose,
  children,
  title = "Details",
}: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!isOpen || !dialog) return;
    const previous = document.activeElement as HTMLElement | null;
    dialog.showModal();
    return () => {
      dialog.close();
      previous?.focus();
    };
  }, [isOpen]);
  if (!isOpen) return null;
  return createPortal(
    <dialog
      ref={ref}
      className="popup-container"
      aria-labelledby={id}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            onClose();
        }
      }}
    >
      <header className="popup-header">
        <h2 id={id}>{title}</h2>
        <button
          type="button"
          aria-label="Close dialog"
          className="popup-close"
          onClick={onClose}
        >
          ×
        </button>
      </header>
      <div className="popup-content">{children}</div>
    </dialog>,
    document.body,
  );
}
