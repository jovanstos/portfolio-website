import { useEffect, useRef, useState } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import type { HandLandmarkerResult } from "@mediapipe/tasks-vision";
import type {
  Vector2,
  SpellParticle,
  SpellTemplate,
} from "../types/spellCasterTypes";
import { SPELL_REGISTRY } from "./SpellRegistry";
import { Geometry } from "./Geometry";
import { createSpellEffect } from "./SpellEffects";
import "../styles/SpellCaster.css";
const WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
export default function SpellCaster() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [spellName, setSpellName] = useState("");
  const [shake, setShake] = useState(false);
  useEffect(() => {
    if (!active) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    let disposed = false;
    let stream: MediaStream | undefined;
    let model: HandLandmarker | undefined;
    let frame = 0;
    let previousTime = -1;
    let state = "loading";
    let path: Vector2[] = [];
    let particles: SpellParticle[] = [];
    const timers: number[] = [];
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    function cursor(
      ctx: CanvasRenderingContext2D,
      point: Vector2,
      color: string,
      radius = 8,
    ) {
      ctx.beginPath();
      ctx.arc(
        point.x * ctx.canvas.width,
        point.y * ctx.canvas.height,
        radius,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = color;
      ctx.fill();
    }
    function cast(spell: SpellTemplate, raw: Vector2[]) {
      state = "cooldown";
      setStatus(state);
      setSpellName(spell.name);
      if (!reduced) {
        setShake(true);
        timers.push(window.setTimeout(() => setShake(false), 500));
      }
      const xs = raw.map((p) => p.x);
      const ys = raw.map((p) => p.y);
      const center = {
        x: (Math.min(...xs) + Math.max(...xs)) / 2,
        y: (Math.min(...ys) + Math.max(...ys)) / 2,
      };
      if (!reduced) {
        particles.push(
          ...createSpellEffect(spell.type, center.x, center.y, raw, center),
        );
        if (spell.type !== "Void")
          for (
            let i = 0;
            i < raw.length;
            i += Math.max(1, Math.floor(raw.length / 10))
          )
            particles.push(
              ...createSpellEffect(spell.type, raw[i].x, raw[i].y, raw, center),
            );
      }
      timers.push(
        window.setTimeout(() => {
          state = "ready";
          setStatus(state);
          setSpellName("");
          path = [];
        }, 2000),
      );
    }
    function recognize() {
      if (path.length < 10 || Geometry.pathLength(path) < 0.001) {
        path = [];
        return;
      }
      let candidate = Geometry.resample(path, 64);
      candidate = Geometry.rotateToZero(candidate);
      candidate = Geometry.scaleTo(candidate, 100);
      candidate = Geometry.translateTo(candidate, { x: 0, y: 0 });
      if (
        candidate.length !== 64 ||
        candidate.some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y))
      )
        return;
      let bestScore = Infinity;
      let best: SpellTemplate | undefined;
      for (const spell of Object.values(SPELL_REGISTRY)) {
        if (!spell.points.length) continue;
        const score = Geometry.pathDistance(candidate, spell.points) / 64;
        if (score < bestScore) {
          bestScore = score;
          best = spell;
        }
      }
      if (best && bestScore < 20) cast(best, path);
      else {
        path = [];
        setSpellName("Try another shape");
      }
    }
    function gestures(
      result: HandLandmarkerResult,
      ctx: CanvasRenderingContext2D,
    ) {
      let pinching = false;
      let position: Vector2 | undefined;
      result.handedness.forEach((hand, index) => {
        const points = result.landmarks[index];
        if (hand[0].displayName === "Left") {
          position = points[8];
          cursor(ctx, position, "cyan");
        }
        if (hand[0].displayName === "Right") {
          pinching =
            Math.hypot(points[4].x - points[8].x, points[4].y - points[8].y) <
            0.05;
          cursor(
            ctx,
            points[4],
            pinching ? "#c800ff" : "#62006b",
            pinching ? 15 : 8,
          );
        }
      });
      if (state === "cooldown") return;
      if (pinching && position) {
        if (state !== "casting") {
          state = "casting";
          setStatus(state);
          path = [];
        }
        if (path.length < 3000) path.push(position);
      } else if (!pinching && state === "casting") {
        state = "ready";
        setStatus(state);
        recognize();
      }
    }
    function predict() {
      if (disposed || !model || !video || !canvas) return;
      if (video.readyState < 2) {
        frame = requestAnimationFrame(predict);
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      if (
        canvas.width !== video.videoWidth ||
        canvas.height !== video.videoHeight
      ) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      try {
        if (previousTime !== video.currentTime) {
          previousTime = video.currentTime;
          gestures(model.detectForVideo(video, performance.now()), ctx);
        }
        if (path.length > 1) {
          ctx.beginPath();
          ctx.strokeStyle = "#00ffff";
          ctx.lineWidth = 6;
          ctx.lineCap = "round";
          path.forEach((p, index) => {
            if (index === 0)
              ctx.moveTo(p.x * canvas.width, p.y * canvas.height);
            else ctx.lineTo(p.x * canvas.width, p.y * canvas.height);
          });
          ctx.stroke();
        }
        particles = particles.filter((p) => !p.isDead());
        particles.forEach((p) => {
          p.update();
          p.draw(ctx, canvas.width, canvas.height);
        });
      } catch {
        setError("Camera tracking failed. Stop or retry the camera.");
        setStatus("failed");
        stream?.getTracks().forEach((track) => track.stop());
        ctx.restore();
        return;
      }
      ctx.restore();
      frame = requestAnimationFrame(predict);
    }
    async function initialize() {
      try {
        if (!navigator.mediaDevices?.getUserMedia)
          throw new Error(
            "Camera access requires HTTPS and a supported browser.",
          );
        const vision = await FilesetResolver.forVisionTasks(WASM_URL);
        if (disposed) return;
        try {
          model = await HandLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
            runningMode: "VIDEO",
            numHands: 2,
          });
        } catch {
          if (disposed) return;
          model = await HandLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: MODEL_URL, delegate: "CPU" },
            runningMode: "VIDEO",
            numHands: 2,
          });
        }
        if (disposed) {
          model.close();
          return;
        }
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (disposed) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        video!.srcObject = stream;
        await video!.play();
        if (disposed) return;
        state = "ready";
        setStatus(state);
        frame = requestAnimationFrame(predict);
      } catch (failure) {
        if (!disposed) {
          stream?.getTracks().forEach((track) => track.stop());
          setError(
            failure instanceof Error
              ? failure.message
              : "Unable to start camera.",
          );
          setStatus("failed");
        }
      }
    }
    void initialize();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
      stream?.getTracks().forEach((track) => track.stop());
      model?.close();
      video.srcObject = null;
      particles = [];
      path = [];
    };
  }, [active, attempt]);
  return (
    <section id="spell-caster">
      <div className="spell-workspace">
        <h2>SpellCaster</h2>
        <p>
          Use your left index finger to draw. Pinch your right thumb and index
          finger while drawing, then release to cast. Camera frames stay in your
          browser.
        </p>
        <div className="spell-controls">
          {!active ? (
            <button
              className="primary-button"
              onClick={() => {
                setError("");
                setStatus("loading");
                setActive(true);
              }}
            >
              Start camera
            </button>
          ) : (
            <>
              <button
                className="secondary-button"
                onClick={() => {
                  setActive(false);
                  setStatus("idle");
                  setError("");
                  setShake(false);
                }}
              >
                Stop camera
              </button>
              {status === "failed" && (
                <button
                  onClick={() => {
                    setError("");
                    setStatus("loading");
                    setAttempt((n) => n + 1);
                  }}
                >
                  Retry
                </button>
              )}
            </>
          )}
        </div>
        {error && (
          <p className="inline-error" role="alert">
            {error}
          </p>
        )}
        <div className={`spell-container ${shake ? "shake-effect" : ""}`}>
          <video ref={videoRef} muted autoPlay playsInline />
          <canvas ref={canvasRef} aria-hidden="true" />
          <div className="ui-overlay" role="status">
            <h3>
              {spellName ||
                (status === "casting"
                  ? "✨ Drawing…"
                  : status === "ready"
                    ? "🤏 Pinch with your right hand to draw"
                    : status === "loading"
                      ? "Loading tracking and camera…"
                      : "Camera stopped")}
            </h3>
          </div>
        </div>
      </div>
      <img
        src="https://portfolio-website-image-bucket.nyc3.digitaloceanspaces.com/spellbook.webp"
        alt="Spellbook: shapes for Fireball, Frost, Lightning, Black Hole, and Nature"
        loading="lazy"
      />
    </section>
  );
}
