import type { GameConfig } from '../config';
import type { Sprites } from '../core/assets';

/** Decorative cloud drifting slower than the ground for parallax. */
export class Cloud {
  x: number;

  constructor(
    private readonly cfg: GameConfig,
    readonly y: number,
    startX: number,
  ) {
    this.x = startX;
  }

  get offscreen(): boolean {
    return this.x + 46 < 0;
  }

  update(dt: number, groundSpeed: number): void {
    this.x -= groundSpeed * this.cfg.spawn.cloudSpeedFactor * dt;
  }

  draw(ctx: CanvasRenderingContext2D, sprites: Sprites): void {
    ctx.drawImage(sprites.cloud, this.x, this.y, 46, 14);
  }
}
