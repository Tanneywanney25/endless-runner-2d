import type { GameConfig, PhysicsSettings } from '../config';
import type { Rect } from '../core/math';
import { insetRect } from '../core/math';
import type { Sprites } from '../core/assets';

/** The t-rex: fixed x, vertical physics, 3-frame run animation. */
export class Player {
  /** Top of the sprite. */
  y: number;
  vy = 0;
  private animTime = 0;

  constructor(private readonly cfg: GameConfig) {
    this.y = this.groundTop;
  }

  private get groundTop(): number {
    return this.cfg.groundY - this.cfg.player.height;
  }

  get grounded(): boolean {
    return this.y >= this.groundTop;
  }

  get bounds(): Rect {
    const { x, width, height } = this.cfg.player;
    return { x, y: this.y, w: width, h: height };
  }

  /** Collision hitbox — bounding box shrunk by the configured inset. */
  get hitbox(): Rect {
    return insetRect(this.bounds, this.cfg.player.hitboxInset);
  }

  jump(physics: PhysicsSettings): boolean {
    if (!this.grounded) return false;
    this.vy = -physics.jumpVelocity;
    this.y = this.groundTop - 0.01; // leave the ground this step
    return true;
  }

  update(dt: number, physics: PhysicsSettings): void {
    this.animTime += dt;
    if (this.grounded && this.vy >= 0) {
      this.y = this.groundTop;
      this.vy = 0;
      return;
    }
    this.vy += physics.gravity * dt;
    this.y += this.vy * dt;
    if (this.y >= this.groundTop) {
      this.y = this.groundTop;
      this.vy = 0;
    }
  }

  reset(): void {
    this.y = this.groundTop;
    this.vy = 0;
    this.animTime = 0;
  }

  draw(ctx: CanvasRenderingContext2D, sprites: Sprites, collided: boolean): void {
    const { x, width, height, animFps } = this.cfg.player;
    let img: HTMLImageElement;
    if (collided) {
      img = sprites.trexCollided;
    } else if (!this.grounded) {
      img = sprites.trex1; // static pose while airborne
    } else {
      const frames = [sprites.trex1, sprites.trex3, sprites.trex4] as const;
      const idx = Math.floor(this.animTime * animFps) % frames.length;
      img = frames[idx] ?? sprites.trex1;
    }
    ctx.drawImage(img, x, this.y, width, height);
  }
}
