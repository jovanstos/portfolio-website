import { useState, useEffect } from "react";
import { MdCancel } from "react-icons/md";
import "../styles/Popup.css";

interface ErrorPopupProps {
    isError: boolean;
    message: string | Error | null;
}

const ErrorPopup: React.FC<ErrorPopupProps> = ({ isError, message }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    useEffect(() => {
        if (isError) setIsOpen(true);
    }, [isError]);

    useEffect(() => {
        if (!isOpen) return;
        const timer = setTimeout(() => {
            setIsOpen(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, [isOpen]);

    const onClose = () => setIsOpen(false);

    if (!isOpen) return null;

    return (
        <div className="error-overlay" onClick={onClose}>
            <div
                className="popup-container error-popup"
                onClick={(e) => e.stopPropagation()}
            >
                <button className="popup-close-error" onClick={onClose}>
                    <MdCancel />
                </button>
                <div className="popup-content">
                    <h2>Error</h2>
                    {message instanceof Error ? message.message : message}
                </div>
            </div>
        </div>
    );
};

export default ErrorPopup;
