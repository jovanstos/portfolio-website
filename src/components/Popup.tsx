import { MdCancel } from "react-icons/md";
import { createPortal } from "react-dom";
import "../styles/Popup.css";
// This is a simple reusable popup component

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Popup: React.FC<PopupProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-container" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>
          <MdCancel />
        </button>
        <div className="popup-content">{children}</div>
      </div>
    </div>,
    document.body,
  );
};

export default Popup;
