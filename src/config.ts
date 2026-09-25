/** Central game configuration — all tunables live here, no magic numbers in game code. */

export interface PhysicsSettings {
  /** Downward acceleration in px/s^2. */
  gravity: number;
  /** Initial upward velocity of a jump in px/s (positive number). */
  jumpVelocity: number;
}

export interface SpeedCurve {
  /** Ground scroll speed at score 0, px/s. */
  base: number;
  /** Extra px/s per score point. */
  perPoint: number;
  /** Hard cap, px/s. */
  max: number;
}

export interface ObstacleSize {
  width: number;
  height: number;
}

export interface GameConfig {
  canvas: { width: number; height: number };
  /** Y of the ground surface the player runs on (px from canvas top). */
  groundY: number;
  physics: PhysicsSettings;
  speed: SpeedCurve;
  score: { pointsPerSecond: number };
  spawn: {
    /** Minimum distance between consecutive obstacles, px. */
    minGapPx: number;
    /** Maximum distance between consecutive obstacles, px. */
    maxGapPx: number;
    /** Decorative cloud spawn interval, ms. */
    cloudIntervalMs: number;
    /** Cloud speed as a fraction of ground speed. */
    cloudSpeedFactor: number;
  };
  player: {
    x: number;
    width: number;
    height: number;
    /** Fraction trimmed off each hitbox side for fairer collisions (0..0.5). */
    hitboxInset: number;
    /** Run animation speed, frames per second. */
    animFps: number;
  };
  obstacles: {
    /** Sizes per sprite type 1..6. */
    sizes: Record<number, ObstacleSize>;
    hitboxInset: number;
  };
  scoreboard: { maxEntries: number };
}

export const defaultConfig: GameConfig = {
  canvas: { width: 600, height: 200 },
  groundY: 180,
  physics: {
    gravity: 2200,
    jumpVelocity: 620,
  },
  speed: {
    base: 340,
    perPoint: 1.6,
    max: 820,
  },
  score: { pointsPerSecond: 10 },
  spawn: {
    minGapPx: 280,
    maxGapPx: 560,
    cloudIntervalMs: 1600,
    cloudSpeedFactor: 0.35,
  },
  player: {
    x: 50,
    width: 44,
    height: 48,
    hitboxInset: 0.14,
    animFps: 10,
  },
  obstacles: {
    sizes: {
      1: { width: 20, height: 40 },
      2: { width: 24, height: 44 },
      3: { width: 28, height: 46 },
      4: { width: 34, height: 48 },
      5: { width: 40, height: 50 },
      6: { width: 48, height: 50 },
    },
    hitboxInset: 0.1,
  },
  scoreboard: { maxEntries: 5 },
};
