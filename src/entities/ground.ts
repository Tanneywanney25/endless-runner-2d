import type { GameConfig } from '../config';
import type { Sprites } from '../core/assets';

/** Endlessly scrolling ground strip drawn as two tiled copies. */
export class Ground {
  private offset = 0;

  constructor(private readonly cfg: GameConfig) {}

  update(dt: number, speed: number): void {
    this.offset = (this.offset + speed * dt) % this.cfg.canvas.width;
  }

  reset(): void {
    this.offset = 0;
  }

  draw(ctx: CanvasRenderingContext2D, sprites: Sprites): void {
    const { width } = this.cfg.canvas;
    const y = this.cfg.groundY - 8;
    const h = 16;
    ctx.drawImage(sprites.ground, -this.offset, y, width, h);
    ctx.drawImage(sprites.ground, width - this.offset, y, width, h);
  }
}
