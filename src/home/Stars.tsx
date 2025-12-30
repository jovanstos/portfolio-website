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
    density = 6000,
    maxRadius = 1.6,
    speed = 70,
    className = "",
}: StarsCanvasProps) {
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

        const resize = (): void => {
            const parent = canvas.parentElement;
            if (!parent) return;

            const rect = parent.getBoundingClientRect();
            dpr = Math.max(1, window.devicePixelRatio || 1);

            w = rect.width;
            h = rect.height;

            canvas.width = Math.floor(w * dpr);
            canvas.height = Math.floor(h * dpr);
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const count = Math.floor((w * h) / density);
            stars = Array.from({ length: count }, (): Star => ({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() * maxRadius + 0.2,
                v: Math.random() * speed + 0.05,
                a: Math.random() * 0.6 + 0.2,
                tw: Math.random() * 0.02 + 0.002,
            }));
        };

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
