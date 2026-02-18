import React, { useState, useRef } from "react";
import { FaChevronDown } from "react-icons/fa";
import "../styles/Dropdown.css";

interface DropdownProps {
  title: string | React.ReactNode;
  children: React.ReactNode;
}

const Dropdown: React.FC<DropdownProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="dropdown-container">
      <button
        className={`dropdown-header ${isOpen ? "active" : ""}`}
        onClick={toggleDropdown}
      >
        <h4>{title}</h4>
        <FaChevronDown className={`dropdown-icon ${isOpen ? "rotate" : ""}`} />
      </button>

      <div
        className="dropdown-content-wrapper"
        ref={contentRef}
        style={{
          maxHeight: isOpen ? `${contentRef.current?.scrollHeight}px` : "0px",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="dropdown-content-inner">{children}</div>
      </div>
    </div>
  );
};

export default Dropdown;
