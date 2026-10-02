import { useEffect, useRef } from "react";
import { useMediaQuery } from "../hooks/useMediaQuery";
type Star = { x: number; y: number; r: number; v: number; a: number };
export default function Stars({
  density = 6000,
  maxRadius = 1.6,
  speed = 100,
  className = "",
}: {
  density?: number;
  maxRadius?: number;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  useEffect(() => {
    const canvas = ref.current;
    const parent = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !parent || !ctx) return;
    let stars: Star[] = [];
    let w = 0;
    let h = 0;
    let frame = 0;
    let last = 0;
    let visible = true;
    function draw(dt = 0) {
      ctx!.clearRect(0, 0, w, h);
      for (const star of stars) {
        star.y -= star.v * dt;
        if (star.y < -2) {
          star.y = h + 2;
          star.x = Math.random() * w;
        }
        ctx!.globalAlpha = star.a;
        ctx!.beginPath();
        ctx!.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx!.fillStyle = "#fff";
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
    }
    function resize() {
      const rect = parent!.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = Array.from(
        { length: Math.min(800, Math.floor((w * h) / density)) },
        () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * maxRadius + 0.2,
          v: Math.random() * speed + 0.05,
          a: Math.random() * 0.6 + 0.2,
        }),
      );
      draw();
    }
    function animate(time: number) {
      draw(last ? Math.min(0.05, (time - last) / 1000) : 0);
      last = time;
      frame = requestAnimationFrame(animate);
    }
    function sync() {
      cancelAnimationFrame(frame);
      last = 0;
      if (!reduced && visible && !document.hidden)
        frame = requestAnimationFrame(animate);
    }
    const observer =
      typeof IntersectionObserver === "undefined"
        ? undefined
        : new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            sync();
          });
    observer?.observe(parent);
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(resize);
    resizeObserver?.observe(parent);
    resize();
    sync();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", sync);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [density, maxRadius, speed, reduced]);
  return (
    <canvas
      ref={ref}
      className={`starsCanvas ${className}`}
      aria-hidden="true"
    />
  );
}
