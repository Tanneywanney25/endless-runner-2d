import type { GameConfig } from '../config';
import type { Rect } from '../core/math';
import { insetRect } from '../core/math';
import type { Sprites, SpriteKey } from '../core/assets';

/** A cactus-style obstacle scrolling right-to-left at ground speed. */
export class Obstacle {
  x: number;

  constructor(
    private readonly cfg: GameConfig,
    /** Sprite/type index 1..6. */
    readonly type: number,
    startX: number,
  ) {
    this.x = startX;
  }

  private get size(): { width: number; height: number } {
    return this.cfg.obstacles.sizes[this.type] ?? { width: 24, height: 44 };
  }

  get bounds(): Rect {
    const { width, height } = this.size;
    return { x: this.x, y: this.cfg.groundY - height, w: width, h: height };
  }

  get hitbox(): Rect {
    return insetRect(this.bounds, this.cfg.obstacles.hitboxInset);
  }

  get offscreen(): boolean {
    return this.x + this.size.width < 0;
  }

  update(dt: number, speed: number): void {
    this.x -= speed * dt;
  }

  draw(ctx: CanvasRenderingContext2D, sprites: Sprites): void {
    const key = `obstacle${this.type}` as SpriteKey;
    const img = sprites[key];
    const { x, y, w, h } = this.bounds;
    ctx.drawImage(img, x, y, w, h);
  }
}
