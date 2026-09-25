import type { GameConfig, SpeedCurve } from '../config';
import { clamp } from '../core/math';

/** Ground speed for a given score, following the configured linear-with-cap curve. */
export function speedForScore(score: number, curve: SpeedCurve): number {
  return clamp(curve.base + curve.perPoint * score, curve.base, curve.max);
}

/** Accumulates fractional score over time so points-per-second is framerate-independent. */
export class ScoreTracker {
  private accumulated = 0;

  constructor(private readonly cfg: GameConfig) {}

  get score(): number {
    return Math.floor(this.accumulated);
  }

  tick(dt: number): void {
    this.accumulated += this.cfg.score.pointsPerSecond * dt;
  }

  reset(): void {
    this.accumulated = 0;
  }
}
