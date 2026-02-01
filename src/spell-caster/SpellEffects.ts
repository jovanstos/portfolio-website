import type { Vector2, SpellParticle } from "../types/spellCasterTypes";

export class FireParticle implements SpellParticle {
    x: number; y: number; vx: number; vy: number;
    life: number; size: number; maxLife: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.015;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 0.01;
        this.life = 1.0;
        this.maxLife = 1.0;
        this.size = Math.random() * 15 + 10;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy -= 0.0005;
        this.life -= 0.015;
        this.size *= 0.95;
    }

    draw(ctx: CanvasRenderingContext2D, w: number, h: number) {
        const hue = 60 - (1 - this.life) * 60; // Yellow (60) to Red (0)
        ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${this.life})`;
        ctx.beginPath();
        ctx.arc(this.x * w, this.y * h, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    isDead() { return this.life <= 0; }
}

export class IceParticle implements SpellParticle {
    x: number; y: number; vy: number;
    life: number; size: number;
    frozen: boolean;
    shatterTime: number;

    constructor(x: number, y: number) {
        this.x = x + (Math.random() - 0.5) * 0.05;
        this.y = y + (Math.random() - 0.5) * 0.05;
        this.vy = 0;
        this.life = 1.0;
        this.size = Math.random() * 10 + 5;
        this.frozen = true;
        this.shatterTime = Date.now() + 1000; // Freeze for 1 second
    }

    update() {
        if (this.frozen) {
            if (Date.now() > this.shatterTime) {
                this.frozen = false;
                this.vy = 0.02;
            }
        } else {
            this.y += this.vy;
            this.vy += 0.002;
            this.life -= 0.03;
        }
    }

    draw(ctx: CanvasRenderingContext2D, w: number, h: number) {
        ctx.fillStyle = `rgba(200, 255, 255, ${this.life})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'cyan';

        // Draw jagged shard (diamond shape)
        const cx = this.x * w;
        const cy = this.y * h;
        ctx.beginPath();
        ctx.moveTo(cx, cy - this.size);
        ctx.lineTo(cx + this.size / 2, cy);
        ctx.lineTo(cx, cy + this.size);
        ctx.lineTo(cx - this.size / 2, cy);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    isDead() { return this.life <= 0; }
}

export class LightningBolt implements SpellParticle {
    points: Vector2[];
    life: number;

    constructor(start: Vector2, end: Vector2) {
        this.points = [];
        this.life = 1.0;
        this.generateBolt(start, end);
    }

    generateBolt(start: Vector2, end: Vector2) {
        this.points.push(start);
        const steps = 10;
        const dx = (end.x - start.x) / steps;
        const dy = (end.y - start.y) / steps;

        for (let i = 1; i < steps; i++) {
            this.points.push({
                // Jitter
                x: start.x + dx * i + (Math.random() - 0.5) * 0.05,
                y: start.y + dy * i + (Math.random() - 0.5) * 0.05
            });
        }
        this.points.push(end);
    }

    update() {
        this.life -= 0.1; // Flash quickly
        // Jitter points slightly every frame for electricity effect
        for (let i = 1; i < this.points.length - 1; i++) {
            this.points[i].x += (Math.random() - 0.5) * 0.01;
            this.points[i].y += (Math.random() - 0.5) * 0.01;
        }
    }

    draw(ctx: CanvasRenderingContext2D, w: number, h: number) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.life})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 15;

        ctx.beginPath();
        ctx.moveTo(this.points[0].x * w, this.points[0].y * h);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x * w, this.points[i].y * h);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    isDead() { return this.life <= 0; }
}

export class VoidParticle implements SpellParticle {
    x: number; y: number;
    centerX: number; centerY: number;
    angle: number; radius: number;
    life: number;

    constructor(centerX: number, centerY: number) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.angle = Math.random() * Math.PI * 2;
        this.radius = 0.3 + Math.random() * 0.2;
        this.x = centerX + Math.cos(this.angle) * this.radius;
        this.y = centerY + Math.sin(this.angle) * this.radius;
        this.life = 1.0;
    }

    update() {
        this.angle += 0.1; // Rotate
        this.radius *= 0.92; // Suck in
        this.x = this.centerX + Math.cos(this.angle) * this.radius;
        this.y = this.centerY + Math.sin(this.angle) * this.radius;
        this.life -= 0.01;
    }

    draw(ctx: CanvasRenderingContext2D, w: number, h: number) {
        ctx.fillStyle = `rgba(100, 0, 200, ${this.life})`; // Purple
        ctx.beginPath();
        ctx.arc(this.x * w, this.y * h, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    isDead() { return this.life <= 0; }
}

export class NatureParticle implements SpellParticle {
    x: number; y: number;
    size: number; maxSize: number;
    life: number;
    rotation: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.size = 0;
        this.maxSize = Math.random() * 20 + 10;
        this.life = 1.0;
        this.rotation = Math.random() * Math.PI * 2;
    }

    update() {
        if (this.size < this.maxSize) this.size += 1;
        this.life -= 0.005; // Lasts a long time
    }

    draw(ctx: CanvasRenderingContext2D, w: number, h: number) {
        ctx.save();
        ctx.translate(this.x * w, this.y * h);
        ctx.rotate(this.rotation);
        ctx.fillStyle = `rgba(50, 255, 50, ${this.life})`;
        // Draw a leaf shape
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    isDead() { return this.life <= 0; }
}

// Factory to simplify Component usage
export const createSpellEffect = (type: string, x: number, y: number, path: Vector2[], center: Vector2): SpellParticle[] => {
    const particles: SpellParticle[] = [];

    switch (type) {
        case 'Fireball':
            for (let i = 0; i < 20; i++) particles.push(new FireParticle(x, y));
            break;
        case 'Ice':
            // Spawn along the path
            path.forEach(p => {
                if (Math.random() > 0.8) particles.push(new IceParticle(p.x, p.y));
            });
            break;
        case 'Lightning':
            // Connect path points randomly
            for (let i = 0; i < path.length - 1; i += 2) {
                particles.push(new LightningBolt(path[i], path[i + 1]));
            }
            break;
        case 'Void':
            // Ignore x,y, spawn around center
            for (let i = 0; i < 50; i++) particles.push(new VoidParticle(center.x, center.y));
            break;
        case 'Nature':
            // Spawn flowers along path
            path.forEach(p => {
                if (Math.random() > 0.9) particles.push(new NatureParticle(p.x, p.y));
            });
            break;
    }
    return particles;
};