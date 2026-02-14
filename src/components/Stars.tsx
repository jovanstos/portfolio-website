import { useEffect, useRef } from "react";

type StarsCanvasProps = {
  density?: number;
  maxRadius?: number;
  speed?: number;
  className?: string;
};

type Star = {
  x: number;
  y: number;
  r: number;
  v: number;
  a: number;
  tw: number;
};

export default function StarsCanvas({
  // Parameters that can be changed to adjust how the stars are on screen
  density = 6000,
  maxRadius = 1.6,
  speed = 70,
  className = "",
}: StarsCanvasProps) {
  // Create a HTML canvas to use to create the stars on
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let rafId = 0;
    let stars: Star[] = [];
    let w = 0;
    let h = 0;
    let dpr = 1;

    // Function used to populate the canavs with the stars with the current space, width, and height...
    // All of it being placed correctly and using math
    const resize = (): void => {
      const parent = canvas.parentElement;
      if (!parent) return;

      // Bounding box
      const rect = parent.getBoundingClientRect();
      // DPR: device pixel rattio
      dpr = Math.max(1, window.devicePixelRatio || 1);

      w = rect.width;
      h = rect.height;

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.floor((w * h) / density);
      // Create a array the size of the star count to fill in the dad for that star
      stars = Array.from(
        { length: count },
        (): Star => ({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * maxRadius + 0.2,
          v: Math.random() * speed + 0.05,
          a: Math.random() * 0.6 + 0.2,
          tw: Math.random() * 0.02 + 0.002,
        }),
      );
    };

    // animate all of the stars to have the current look and movement
    const animate = (): void => {
      ctx.clearRect(0, 0, w, h);

      for (const star of stars) {
        star.y -= star.v;
        if (star.y < -2) {
          star.y = h + 2;
          star.x = Math.random() * w;
        }

        star.a += (Math.random() - 0.5) * star.tw;
        star.a = Math.min(0.9, Math.max(0.15, star.a));

        ctx.globalAlpha = star.a;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      rafId = window.requestAnimationFrame(animate);
    };

    // Run all of the proper functions to get it working and sisze correctly
    resize();
    animate();
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [density, maxRadius, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`starsCanvas ${className}`}
      aria-hidden="true"
    />
  );
}
