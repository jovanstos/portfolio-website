import type { ReactNode } from "react";
import "../styles/Dropdown.css";
export default function Dropdown({
  title,
  children,
}: {
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <details className="dropdown-container">
      <summary className="dropdown-header">{title}</summary>
      <div className="dropdown-content-inner">{children}</div>
    </details>
  );
}
