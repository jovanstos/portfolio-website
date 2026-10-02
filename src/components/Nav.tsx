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
  const gesture = useRef<{ id: number; x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  function hasKeyboardFocus() {
    return !!trigger.current?.closest("nav")?.querySelector(":focus-visible");
  }
  function dismiss(focus = false) {
    setOpen(false);
    dragging.current = false;
    gesture.current = null;
    if (focus) trigger.current?.focus();
  }
  useEffect(() => {
    if (!open) return;
    const element = wheel.current;
    const spin = (event: WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaY || event.deltaX;
      const units = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 100 : 1;
      setRotation((value) => (value + delta * units * 0.35) % 360);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        dragging.current = false;
        gesture.current = null;
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
        onMouseLeave={canHover ? () => {
          if (!gesture.current && !hasKeyboardFocus()) dismiss();
        } : undefined}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) dismiss();
        }}
      >
        <button
          ref={trigger}
          type="button"
          className="rocketButton"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="navigation-wheel"
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
              requestAnimationFrame(() => wheel.current?.querySelector("a")?.focus());
            }
          }}
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
          onClickCapture={(event) => {
            if (suppressClick.current) {
              event.preventDefault();
              event.stopPropagation();
              suppressClick.current = false;
            }
          }}
          onPointerDown={(event) => {
            if (!event.isPrimary || event.button !== 0) return;
            suppressClick.current = false;
            gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
            previous.current = angle(
              event.clientX,
              event.clientY,
              event.currentTarget,
            );
          }}
          onPointerMove={(event) => {
            const start = gesture.current;
            if (!start || start.id !== event.pointerId) return;
            if (!dragging.current) {
              if (Math.hypot(event.clientX - start.x, event.clientY - start.y) < 5) return;
              dragging.current = true;
              suppressClick.current = true;
              event.currentTarget.setPointerCapture(event.pointerId);
            }
            const next = angle(
              event.clientX,
              event.clientY,
              event.currentTarget,
            );
            let delta = next - previous.current;
            if (delta > 180) delta -= 360;
            if (delta < -180) delta += 360;
            setRotation((value) => (value + delta) % 360);
            previous.current = next;
          }}
          onPointerUp={(event) => {
            dragging.current = false;
            gesture.current = null;
            if (event.currentTarget.hasPointerCapture(event.pointerId))
              event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onPointerCancel={() => {
            dragging.current = false;
            gesture.current = null;
          }}
          onLostPointerCapture={() => {
            dragging.current = false;
            gesture.current = null;
          }}
        >
          <div className="wheel-ring" aria-hidden="true" />
          <div className="wheel-core" aria-hidden="true" />
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
              draggable={false}
              onFocus={(event) => {
                // Bring keyboard-focused links into the visible corner of the orbit.
                if (event.currentTarget.matches(":focus-visible")) {
                  setRotation(45 - (index * 360) / SITE_LINKS.length);
                }
              }}
              onClick={() => dismiss()}
            >
              {link.label}
            </NavLink>
          ))}
          <span className="wheel-hint" aria-hidden="true">
            {canHover ? "Drag / scroll to spin" : "Drag to spin"}
          </span>
        </div>
      </nav>
    </>
  );
}
