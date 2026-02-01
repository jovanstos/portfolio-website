export type Vector2 = { x: number; y: number };
export type GameStatus = 'loading' | 'ready' | 'casting' | 'cooldown';

export interface SpellTemplate {
    name: string;
    type: 'Fireball' | 'Ice' | 'Lightning' | 'Void' | 'Nature';
    points: Vector2[];
    color: string;
}

// Spell Effects
export interface SpellParticle {
    update(): void;
    draw(ctx: CanvasRenderingContext2D, width: number, height: number): void;
    isDead(): boolean;
}

