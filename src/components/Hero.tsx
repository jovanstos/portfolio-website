import "../styles/Hero.css";
import Stars from "./Stars";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

// Handle the phases of the intro animation
type Phase = "STAR_BURST" | "BADGE" | "FADE_TO_HERO" | "HERO";

function Hero() {
  const [phase, setPhase] = useState<Phase>("STAR_BURST");

  const navigate = useNavigate();

  const burstCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const BADGE_DURATION_MS = 1500;
  const FADE_DURATION_MS = 50;

  useEffect(() => {
    // This entire section can be summed with it handles the animation logic for the intro
    // It uses math, canves, svgs to create what is seen on screen on the home page
    if (phase === "STAR_BURST") {
      const canvas = burstCanvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let raf = 0;
      let start = performance.now();

      // DPR: device pixel ratio
      const DPR = Math.min(window.devicePixelRatio || 1, 2);

      const resize = () => {
        const { width, height } = canvas.getBoundingClientRect();
        canvas.width = Math.floor(width * DPR);
        canvas.height = Math.floor(height * DPR);
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      };

      resize();
      window.addEventListener("resize", resize);

      const { width, height } = canvas.getBoundingClientRect();
      const cx = width / 2;
      const cy = height / 2;

      const COUNT = 500;
      const DURATION = 1400;
      const MAX_SPEED = 10000;

      type Circle = {
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
        rot: number;
        spin: number;
        life: number;
        delay: number;
      };

      const circles: Circle[] = Array.from({ length: COUNT }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 120 + Math.random() * MAX_SPEED;
        const size = 2 + Math.random();
        const spin = (Math.random() - 0.5) * 5;
        const life = 0.65 + Math.random() * 0.35;
        const delay = Math.random() * 140;

        return {
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size,
          rot: Math.random() * Math.PI * 2,
          spin,
          life,
          delay,
        };
      });

      // Draw the circle
      const draw = (now: number) => {
        const t = now - start;

        ctx.clearRect(0, 0, width, height);

        if (t < 120) {
          const a = 0.1 * (1 - t / 120);
          ctx.fillStyle = `rgba(0,0,0,${a})`;
          ctx.fillRect(0, 0, width, height);
        }

        const progress = Math.min(t / DURATION, 1);

        ctx.globalCompositeOperation = "lighter";

        for (const circle of circles) {
          if (t < circle.delay) continue;

          const tt = (t - circle.delay) / 1000;

          const ease =
            1 - Math.pow(1 - Math.min((t - circle.delay) / DURATION, 1), 3);

          const px = cx + circle.vx * tt * 0.9 * (0.6 + 0.4 * ease);
          const py = cy + circle.vy * tt * 0.9 * (0.6 + 0.4 * ease);

          const alpha = (1 - progress) * circle.life;
          if (alpha <= 0) continue;

          ctx.save();
          ctx.translate(px, py);

          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.beginPath();
          ctx.arc(0, 0, circle.size / 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }

        if (progress < 1) {
          raf = requestAnimationFrame(draw);
        } else {
          window.removeEventListener("resize", resize);
          cancelAnimationFrame(raf);
          setPhase("BADGE");
        }
      };

      raf = requestAnimationFrame(draw);

      return () => {
        window.removeEventListener("resize", resize);
        cancelAnimationFrame(raf);
      };
    }

    if (phase === "BADGE") {
      const t = window.setTimeout(
        () => setPhase("FADE_TO_HERO"),
        BADGE_DURATION_MS,
      );
      return () => window.clearTimeout(t);
    }

    if (phase === "FADE_TO_HERO") {
      const t = window.setTimeout(() => setPhase("HERO"), FADE_DURATION_MS);
      return () => window.clearTimeout(t);
    }
  }, [phase]);

  return (
    <section className="hero">
      <Stars />
      <div
        className={[
          "introLayer",
          phase === "FADE_TO_HERO" ? "introFadeOut" : "",
          phase === "HERO" ? "introHidden" : "",
        ].join(" ")}
      >
        {phase === "STAR_BURST" && (
          <canvas
            className="burstCanvas"
            ref={burstCanvasRef}
            aria-hidden="true"
          />
        )}

        {phase === "BADGE" && (
          <div className="badgeStage">
            <CircleBadge
              topText="Jovan Stosic"
              bottomText="Software Engineer"
              imageUrl="./temp.jpg"
            />
          </div>
        )}
      </div>
      <div
        className={[
          "realHero",
          phase === "HERO" ? "heroFadeIn" : "realHeroMuted",
        ].join(" ")}
      >
        <div>
          <h1 className="wave-text" style={{ fontSize: "var(--xxlarge)" }}>
            {"Jovan Stosic".split("").map((char, index) => (
              <span key={index} style={{ animationDelay: `${index * 0.1}s` }}>
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </h1>
          <hr />
          <h2 style={{ fontStyle: "initial" }}>Software Engineer</h2>
          <h3
            style={{
              fontSize: "var(--medium)",
              color: "var(--color-highlight)",
            }}
          >
            Location: Greater Chicago Area
          </h3>
          <p>
            I turned my obsession into the ability to create solutions to real
            problems. A few years ago, I sold my car to be able to fund my
            education to become a software engineer. I had to used all the money
            I had. It was a risk I took to pursue my dreams. I know you've heard
            the same story a million times: "I love programming!" but it is a
            different for me. It's all I've ever wanted and have obsessed over.
            I am extremely driven, dedicated, and passionate about it. I bring
            that commitment to every line of code I write. I am a developer who
            views every "wall" as an opportunity to learn and improve, so I can
            build better software. If you would like to read more:
            <a href="/about" rel="noopener noreferrer">
              {" "}
              Click here.
            </a>
          </p>
          <div style={{ marginTop: "10px" }}>
            <button
              style={{ marginRight: "10px" }}
              className="primary-button contact-button"
              onClick={() => navigate("/contact")}
            >
              Contact Me
            </button>
            <button
              className="secondary-button"
              onClick={() => navigate("/resume")}
            >
              Résumé
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

type CircleBadgeProps = {
  topText: string;
  bottomText: string;
  imageUrl: string;
};

// Create the circle badge this section WAS vibe coded/ ai coded since svg art is complex and has a sharp learning curve
function CircleBadge({ topText, bottomText, imageUrl }: CircleBadgeProps) {
  return (
    <div className="circleBadge">
      <svg
        className="circleSvg"
        viewBox="0 0 200 200"
        role="img"
        aria-label="Intro badge"
      >
        <defs>
          <path id="topArc" d="M 35,105 A 65,65 0 0,1 165,105" />

          <path
            id="bottomArc"
            d="M 100,95 m -75,0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 0,0"
          />
          <clipPath id="avatarClip">
            <circle cx="100" cy="100" r="52" />
          </clipPath>
        </defs>

        <circle cx="100" cy="100" r="78" className="circleRing" />

        <text className="circleText">
          <textPath href="#topArc" startOffset="50%" textAnchor="middle">
            {topText}
          </textPath>
        </text>

        <text className="circleText">
          <textPath href="#bottomArc" startOffset="50%" textAnchor="middle">
            {bottomText}
          </textPath>
        </text>

        <image
          href={imageUrl}
          x="48"
          y="48"
          width="104"
          height="104"
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#avatarClip)"
        />
      </svg>
    </div>
  );
}

export default Hero;
