import { useMemo, useRef, useState, useEffect } from "react";
import { IoRocketSharp } from "react-icons/io5";
import "../styles/Nav.css";

const LINKS = [
    { label: "Home", href: "/" },
    { label: "About Me", href: "/about" },
    { label: "Contact Me", href: "/contact" },
    { label: "Résumé", href: "/resume" },
    { label: "Projects", href: "/projects" },
    { label: "Junk Yard", href: "/junk" },
];

// Use basic geomatric math for a circle to find the proper angle form the center...
// ... so the HTML elements can be placed in the correct spots
function angleFromCenter(clientX: number, clientY: number, el: HTMLElement) {
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    return Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);
}

export default function Nav() {
    const [open, setOpen] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [canHover, setCanHover] = useState(true);

    const wheelRef = useRef<HTMLDivElement | null>(null);
    const draggingRef = useRef(false);
    const lastAngleRef = useRef(0);

    useEffect(() => {
        // Know if the device is cable of hovering or not, mostly to tell if it's a phone user
        const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
        const update = () => setCanHover(mq.matches);
        update();
        mq.addEventListener?.("change", update);

        return () => mq.removeEventListener?.("change", update);
    }, []);

    // Load up all of the items into memory using useMemo to optimize performance since this will be on every page
    const items = useMemo(() => {
        const step = 360 / LINKS.length;
        return LINKS.map((link, i) => ({ ...link, baseAngle: i * step }));
    }, []);

    // Handle interaction form the users when touching the wheel and set the correct rotation
    function onWheelSpin(e: React.WheelEvent) {
        if (!open) return;
        e.preventDefault();

        const speed = 0.5
        setRotation((r) => r + e.deltaY * speed);
    }

    function onPointerDown(e: React.PointerEvent) {
        if (!wheelRef.current) return;

        const target = e.target as HTMLElement;
        if (target.closest(".wheelItem")) return;

        // Get the correct information for where the mouse is and if it's dragging and where
        draggingRef.current = true;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        lastAngleRef.current = angleFromCenter(e.clientX, e.clientY, wheelRef.current);
    }

    // If the pointer moves handle the math for the change and rotation of the circle
    function onPointerMove(e: React.PointerEvent) {
        if (!draggingRef.current || !wheelRef.current) return;

        const a = angleFromCenter(e.clientX, e.clientY, wheelRef.current);
        let delta = a - lastAngleRef.current;

        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;

        const speed = 1.5
        setRotation((r) => r + delta * speed);
        lastAngleRef.current = a;
    }

    // Stop dragging once the user stops clicking
    function onPointerUp(e: React.PointerEvent) {
        draggingRef.current = false;
        try {
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        } catch { }
    }

    function rocketClick() {
        if (!canHover) setOpen(!open)
    }

    return (
        <nav
            onMouseEnter={canHover ? () => setOpen(true) : undefined}
            onMouseLeave={canHover ? () => setOpen(false) : undefined}
            onClick={rocketClick}
        >
            <button
                type="button"
                className="rocketButton"
                aria-expanded={open}
                onClick={rocketClick}
            >
                <IoRocketSharp id="rocket" size={55} color="var(--color-accent)" />
            </button>
            <div
                ref={wheelRef}
                className={`wheel ${open ? "wheelVisible" : "wheelInvisible"}`}
                style={{ transform: `translate(-50%, -50%) rotate(${rotation}deg)` }}
                onWheel={onWheelSpin}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
            >
                {items.map((item) => (
                    <a
                        key={item.href}
                        className="wheelItem"
                        href={item.href}
                        rel="noopener noreferrer"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => {
                            if (!canHover) setOpen(false);
                        }}
                        style={{
                            transform: `rotate(${item.baseAngle}deg) translate(135px) rotate(${-item.baseAngle}deg) rotate(${-rotation}deg)`,
                        }}
                    >
                        {item.label}
                    </a>
                ))}
            </div>
        </nav>
    );
}
