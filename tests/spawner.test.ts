import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { Spawner, type ObstaclePattern } from '../src/systems/spawner';
import { defaultConfig } from '../src/config';
import { mulberry32 } from '../src/core/rng';

const fixture: ObstaclePattern = JSON.parse(
  readFileSync(new URL('../public/patterns/default.json', import.meta.url), 'utf-8'),
) as ObstaclePattern;

describe('generated pattern fixture (scripts/gen_obstacles.py)', () => {
  it('has the documented seed and entry count', () => {
    expect(fixture.seed).toBe(20260925);
    expect(fixture.entries).toHaveLength(64);
  });

  it('keeps every gap within configured spawn bounds', () => {
    for (const e of fixture.entries) {
      expect(e.gap).toBeGreaterThanOrEqual(defaultConfig.spawn.minGapPx);
      expect(e.gap).toBeLessThanOrEqual(defaultConfig.spawn.maxGapPx);
    }
  });

  it('uses only valid obstacle types', () => {
    const maxType = Object.keys(defaultConfig.obstacles.sizes).length;
    for (const e of fixture.entries) {
      expect(e.type).toBeGreaterThanOrEqual(1);
      expect(e.type).toBeLessThanOrEqual(maxType);
    }
  });

  it('is byte-stable: first entries match the known seed output', () => {
    // Regression pin — regenerate with scripts/gen_obstacles.py if intentionally changed.
    expect(fixture.entries.slice(0, 3)).toEqual([
      { gap: 394, type: 3 },
      { gap: 497, type: 3 },
      { gap: 349, type: 3 },
    ]);
  });
});

describe('Spawner in pattern mode', () => {
  const pattern: ObstaclePattern = {
    seed: 1,
    entries: [
      { gap: 100, type: 2 },
      { gap: 150, type: 5 },
    ],
  };

  it('spawns exactly when each cumulative gap is covered', () => {
    const spawner = new Spawner(defaultConfig, mulberry32(1), pattern);
    expect(spawner.advance(99)).toBeNull();
    expect(spawner.advance(1)).toEqual({ type: 2 });
    expect(spawner.advance(149)).toBeNull();
    expect(spawner.advance(1)).toEqual({ type: 5 });
  });

  it('loops the pattern after the last entry', () => {
    const spawner = new Spawner(defaultConfig, mulberry32(1), pattern);
    spawner.advance(100);
    spawner.advance(150);
    expect(spawner.advance(100)).toEqual({ type: 2 });
  });

  it('carries overshoot distance into the next gap', () => {
    const spawner = new Spawner(defaultConfig, mulberry32(1), pattern);
    // 130 covers the first 100 gap with 30 left toward the next 150.
    expect(spawner.advance(130)).toEqual({ type: 2 });
    expect(spawner.advance(119)).toBeNull();
    expect(spawner.advance(1)).toEqual({ type: 5 });
  });

  it('reset replays from the start of the pattern', () => {
    const spawner = new Spawner(defaultConfig, mulberry32(1), pattern);
    spawner.advance(100);
    spawner.reset();
    expect(spawner.advance(99)).toBeNull();
    expect(spawner.advance(1)).toEqual({ type: 2 });
  });
});

describe('Spawner in random mode', () => {
  it('draws gaps within [minGapPx, maxGapPx]', () => {
    const spawner = new Spawner(defaultConfig, mulberry32(42));
    const { minGapPx, maxGapPx } = defaultConfig.spawn;
    let sinceLast = 0;
    let spawns = 0;
    for (let i = 0; i < 20_000 && spawns < 40; i++) {
      sinceLast += 10;
      if (spawner.advance(10)) {
        expect(sinceLast).toBeGreaterThanOrEqual(minGapPx);
        // step quantization of 10px can overshoot the drawn gap by < one step
        expect(sinceLast).toBeLessThanOrEqual(maxGapPx + 10);
        sinceLast = 0;
        spawns += 1;
      }
    }
    expect(spawns).toBe(40);
  });

  it('is deterministic for a fixed RNG seed', () => {
    const run = (): number[] => {
      const spawner = new Spawner(defaultConfig, mulberry32(7));
      const distances: number[] = [];
      let travelled = 0;
      for (let i = 0; i < 5_000 && distances.length < 10; i++) {
        travelled += 5;
        if (spawner.advance(5)) distances.push(travelled);
      }
      return distances;
    };
    expect(run()).toEqual(run());
  });
});
