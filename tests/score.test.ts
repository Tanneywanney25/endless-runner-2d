import { describe, expect, it } from 'vitest';
import { ScoreTracker, speedForScore } from '../src/systems/score';
import { defaultConfig } from '../src/config';

const curve = { base: 340, perPoint: 1.6, max: 820 };

describe('speedForScore', () => {
  it('returns base speed at score 0', () => {
    expect(speedForScore(0, curve)).toBe(340);
  });

  it('scales linearly with score', () => {
    expect(speedForScore(100, curve)).toBeCloseTo(340 + 160);
  });

  it('caps at the configured maximum', () => {
    expect(speedForScore(10_000, curve)).toBe(820);
  });

  it('never dips below base for negative inputs', () => {
    expect(speedForScore(-50, curve)).toBe(340);
  });

  it('cap engages exactly at the crossover score', () => {
    const crossover = (curve.max - curve.base) / curve.perPoint; // 300
    expect(speedForScore(crossover, curve)).toBe(820);
    expect(speedForScore(crossover - 1, curve)).toBeLessThan(820);
  });
});

describe('ScoreTracker', () => {
  it('awards pointsPerSecond after one simulated second', () => {
    const tracker = new ScoreTracker(defaultConfig);
    for (let i = 0; i < 60; i++) tracker.tick(1 / 60);
    expect(tracker.score).toBe(defaultConfig.score.pointsPerSecond);
  });

  it('is framerate independent (30Hz vs 60Hz ticks agree)', () => {
    const a = new ScoreTracker(defaultConfig);
    const b = new ScoreTracker(defaultConfig);
    for (let i = 0; i < 120; i++) a.tick(1 / 60);
    for (let i = 0; i < 60; i++) b.tick(1 / 30);
    expect(a.score).toBe(b.score);
  });

  it('floors fractional accumulation', () => {
    const tracker = new ScoreTracker(defaultConfig);
    tracker.tick(0.05); // 0.5 points at 10/s
    expect(tracker.score).toBe(0);
  });

  it('reset returns the tracker to zero', () => {
    const tracker = new ScoreTracker(defaultConfig);
    tracker.tick(2);
    expect(tracker.score).toBeGreaterThan(0);
    tracker.reset();
    expect(tracker.score).toBe(0);
  });
});
