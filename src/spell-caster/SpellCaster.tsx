import { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import type { HandLandmarkerResult } from '@mediapipe/tasks-vision';
import type { Vector2, GameStatus, SpellTemplate, SpellParticle } from "../types/spellCasterTypes";
import { SPELL_REGISTRY } from './SpellRegistry';
import { Geometry } from './Geometry';
import "../styles/SpellCaster.css";
import { createSpellEffect } from './SpellEffects';

const CONFIG = {
    PINCH_THRESHOLD: 0.05,
    RESAMPLE_POINTS: 64,
    MATCH_THRESHOLD: 20,
    COOLDOWN_MS: 2000,
    MODEL_URL: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
    WASM_URL: "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
};

export default function SpellCaster() {
    // All of the important refs used as variables throughout the app
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const landmarkerRef = useRef<HandLandmarker | null>(null);
    const requestRef = useRef<number>(0);

    const spellPathRef = useRef<Vector2[]>([]);
    const statusRef = useRef<GameStatus>('loading');

    const particlesRef = useRef<SpellParticle[]>([]);

    const [uiState, setUiState] = useState<{ status: GameStatus, lastSpell: string | null }>({
        status: 'loading',
        lastSpell: null
    });
    const [shake, setShake] = useState(false);

    // Init & Camera Effects
    useEffect(() => {
        const initMediaPipe = async () => {
            const vision = await FilesetResolver.forVisionTasks(CONFIG.WASM_URL);
            landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
                baseOptions: { modelAssetPath: CONFIG.MODEL_URL, delegate: "GPU" },
                runningMode: "VIDEO", numHands: 2,
                minHandDetectionConfidence: 0.5, minHandPresenceConfidence: 0.5,
            });
            statusRef.current = 'ready';
            setUiState(prev => ({ ...prev, status: 'ready' }));
        };
        initMediaPipe();
        return () => cancelAnimationFrame(requestRef.current);
    }, []);

    useEffect(() => {
        if (uiState.status === 'ready' && videoRef.current && !videoRef.current.srcObject) {
            navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } })
                .then((stream) => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.addEventListener('loadeddata', () => predictWebcam());
                    }
                });
        }
    }, [uiState.status]);

    // Main Loop for this app
    const predictWebcam = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const landmarker = landmarkerRef.current;
        if (!video || !canvas || !landmarker) return;

        if (canvas.width !== video.videoWidth) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);

        const results = landmarker.detectForVideo(video, performance.now());
        if (results.landmarks) handleGestures(results, ctx);

        drawPath(ctx);

        // Update particlas and draw them
        updateAndDrawParticles(ctx, canvas.width, canvas.height);

        ctx.restore();
        requestRef.current = requestAnimationFrame(predictWebcam);
    };

    const handleGestures = (results: HandLandmarkerResult, ctx: CanvasRenderingContext2D) => {
        let isCastingTriggered = false;
        let cursorPosition: Vector2 | null = null;

        results.handedness.forEach((hand, index) => {
            const landmarks = results.landmarks[index];
            if (hand[0].displayName === 'Right') {
                cursorPosition = landmarks[8];
                drawCursor(ctx, cursorPosition, 'cyan');
            }
            if (hand[0].displayName === 'Left') {
                const dist = Math.hypot(landmarks[4].x - landmarks[8].x, landmarks[4].y - landmarks[8].y);
                const isPinching = dist < CONFIG.PINCH_THRESHOLD;
                drawCursor(ctx, landmarks[4], isPinching ? '#c800ff' : '#62006b', isPinching ? 15 : 8);
                if (isPinching) isCastingTriggered = true;
            }
        });

        const currentStatus = statusRef.current;
        if (currentStatus === 'cooldown') return;

        if (isCastingTriggered && cursorPosition) {
            if (currentStatus !== 'casting') {
                statusRef.current = 'casting';
                setUiState(prev => ({ ...prev, status: 'casting' }));
                spellPathRef.current = [];
            }
            spellPathRef.current.push(cursorPosition);
        } else if (!isCastingTriggered && currentStatus === 'casting') {
            statusRef.current = 'ready';
            setUiState(prev => ({ ...prev, status: 'ready' }));
            recognizeSpell();
        }
    };

    // Recognition & Casting
    const recognizeSpell = () => {
        const rawPath = spellPathRef.current;
        if (rawPath.length < 10) return;

        let candidate = Geometry.resample(rawPath, CONFIG.RESAMPLE_POINTS);
        candidate = Geometry.rotateToZero(candidate);
        candidate = Geometry.scaleTo(candidate, 100);
        candidate = Geometry.translateTo(candidate, { x: 0, y: 0 });

        // This is used for saving spells when making them
        // console.log("Captured Shape:", JSON.stringify(candidate));

        let bestScore = Infinity;
        let bestSpell: SpellTemplate | null = null;

        Object.values(SPELL_REGISTRY).forEach(spell => {
            if (!spell.points.length) return;
            const dist = Geometry.pathDistance(candidate, spell.points);
            const score = dist / CONFIG.RESAMPLE_POINTS;
            if (score < bestScore) {
                bestScore = score;
                bestSpell = spell;
            }
        });

        if (bestSpell && bestScore < CONFIG.MATCH_THRESHOLD) {
            castSpell(bestSpell, rawPath);
        }
    };

    const castSpell = (spell: SpellTemplate, path: Vector2[]) => {
        statusRef.current = 'cooldown';
        setUiState({ status: 'cooldown', lastSpell: spell.name });
        setShake(true);
        setTimeout(() => setShake(false), 500);

        // Calculate center
        const xs = path.map(p => p.x);
        const ys = path.map(p => p.y);
        const center = {
            x: (Math.min(...xs) + Math.max(...xs)) / 2,
            y: (Math.min(...ys) + Math.max(...ys)) / 2
        };

        // Spawn major effect at center
        const centerEffects = createSpellEffect(spell.type, center.x, center.y, path, center);
        particlesRef.current.push(...centerEffects);

        // Spawn minor effects along path (for Fireball/Lightning)
        if (spell.type !== 'Void') {
            const step = Math.floor(path.length / 10);
            for (let i = 0; i < path.length; i += step) {
                const trailEffects = createSpellEffect(spell.type, path[i].x, path[i].y, path, center);
                particlesRef.current.push(...trailEffects);
            }
        }

        setTimeout(() => {
            statusRef.current = 'ready';
            setUiState(prev => ({ ...prev, status: 'ready', lastSpell: null }));
            spellPathRef.current = [];
        }, CONFIG.COOLDOWN_MS);
    };

    const updateAndDrawParticles = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
        particlesRef.current = particlesRef.current.filter(p => !p.isDead());
        particlesRef.current.forEach(p => {
            p.update();
            p.draw(ctx, w, h);
        });
    };

    const drawCursor = (ctx: CanvasRenderingContext2D, p: Vector2, color: string, radius = 8) => {
        ctx.beginPath();
        ctx.arc(p.x * ctx.canvas.width, p.y * ctx.canvas.height, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
    };

    const drawPath = (ctx: CanvasRenderingContext2D) => {
        const path = spellPathRef.current;
        if (path.length < 2) return;
        ctx.beginPath();
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#00ffff';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;
        ctx.moveTo(path[0].x * w, path[0].y * h);
        for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x * w, path[i].y * h);
        ctx.stroke();
    };

    return (
        <div className={`spell-container ${shake ? 'shake-effect' : ''}`} style={{ width: '100%', maxWidth: '800px', margin: '0 auto', aspectRatio: '16/9' }}>
            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
            <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
            <div className="ui-overlay">
                {uiState.status === 'ready' && <h3>🤏 Pinch The Dark Purple Dot to Cast</h3>}
                {uiState.status === 'casting' && <h3 style={{ color: '#00ffff' }}>✨ Drawing...</h3>}
                {uiState.status === 'cooldown' && (
                    <div className="spell-name" style={{ color: SPELL_REGISTRY[uiState.lastSpell!]?.color || 'white' }}>
                        {uiState.lastSpell}
                    </div>
                )}
            </div>
        </div>
    );
}