import { useEffect, useRef, useState, type CSSProperties } from "react";
import { NavLink } from "react-router-dom";
import { IoRocketSharp } from "react-icons/io5";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { SITE_LINKS } from "./siteLinks";
import "../styles/Nav.css";
function angle(x: number, y: number, element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return (
    (Math.atan2(
      y - rect.top - rect.height / 2,
      x - rect.left - rect.width / 2,
    ) *
      180) /
    Math.PI
  );
}
export default function Nav() {
  const [open, setOpen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");
  const wheel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const dragging = useRef(false);
  const previous = useRef(0);
  function dismiss(focus = false) {
    setOpen(false);
    dragging.current = false;
    if (focus) trigger.current?.focus();
  }
  useEffect(() => {
    if (!open) return;
    const element = wheel.current;
    const spin = (event: WheelEvent) => {
      event.preventDefault();
      setRotation((value) => value + event.deltaY * 0.35);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        dragging.current = false;
        trigger.current?.focus();
      }
    };
    element?.addEventListener("wheel", spin, { passive: false });
    document.addEventListener("keydown", escape);
    return () => {
      element?.removeEventListener("wheel", spin);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  return (
    <>
      {open && (
        <button
          className="nav-backdrop"
          aria-label="Close navigation"
          tabIndex={-1}
          onClick={() => dismiss(true)}
        />
      )}
      <nav
        aria-label="Main navigation"
        className={open ? "nav-open" : ""}
        onMouseEnter={canHover ? () => setOpen(true) : undefined}
        onMouseLeave={canHover ? () => dismiss() : undefined}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) dismiss();
        }}
      >
        <button
          ref={trigger}
          type="button"
          className="rocketButton"
          aria-label="Open navigation menu"
          aria-expanded={open}
          aria-controls="navigation-wheel"
          onClick={(event) =>
            setOpen((value) => (canHover && event.detail > 0 ? true : !value))
          }
        >
          <IoRocketSharp id="rocket" size={60} />
        </button>
        <div
          id="navigation-wheel"
          ref={wheel}
          hidden={!open}
          className="wheel"
          style={{ "--rotation": `${rotation}deg` } as CSSProperties}
          onPointerDown={(event) => {
            if ((event.target as HTMLElement).closest("a,button")) return;
            dragging.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            previous.current = angle(
              event.clientX,
              event.clientY,
              event.currentTarget,
            );
          }}
          onPointerMove={(event) => {
            if (!dragging.current) return;
            const next = angle(
              event.clientX,
              event.clientY,
              event.currentTarget,
            );
            let delta = next - previous.current;
            if (delta > 180) delta -= 360;
            if (delta < -180) delta += 360;
            setRotation((value) => value + delta);
            previous.current = next;
          }}
          onPointerUp={(event) => {
            dragging.current = false;
            if (event.currentTarget.hasPointerCapture(event.pointerId))
              event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onPointerCancel={() => {
            dragging.current = false;
          }}
        >
          <div className="wheel-ring" />
          {SITE_LINKS.map((link, index) => (
            <NavLink
              key={link.href}
              to={link.href}
              end={link.href === "/"}
              className="wheelItem"
              style={
                {
                  "--angle": `${(index * 360) / SITE_LINKS.length}deg`,
                } as CSSProperties
              }
              onClick={() => dismiss()}
            >
              {link.label}
            </NavLink>
          ))}
          <span className="wheel-hint">Drag to orbit</span>
        </div>
      </nav>
    </>
  );
}
