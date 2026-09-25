import { describe, expect, it } from 'vitest';
import { aabbIntersects, insetRect, clamp } from '../src/core/math';

describe('aabbIntersects', () => {
  it('detects a plain overlap', () => {
    expect(aabbIntersects({ x: 0, y: 0, w: 10, h: 10 }, { x: 5, y: 5, w: 10, h: 10 })).toBe(true);
  });

  it('detects containment', () => {
    expect(aabbIntersects({ x: 0, y: 0, w: 20, h: 20 }, { x: 5, y: 5, w: 2, h: 2 })).toBe(true);
  });

  it('returns false for separated rects', () => {
    expect(aabbIntersects({ x: 0, y: 0, w: 10, h: 10 }, { x: 30, y: 0, w: 10, h: 10 })).toBe(false);
  });

  it('treats exactly touching edges as NOT colliding', () => {
    expect(aabbIntersects({ x: 0, y: 0, w: 10, h: 10 }, { x: 10, y: 0, w: 10, h: 10 })).toBe(false);
    expect(aabbIntersects({ x: 0, y: 0, w: 10, h: 10 }, { x: 0, y: 10, w: 10, h: 10 })).toBe(false);
  });

  it('is symmetric', () => {
    const a = { x: 2, y: 3, w: 8, h: 4 };
    const b = { x: 7, y: 5, w: 6, h: 6 };
    expect(aabbIntersects(a, b)).toBe(aabbIntersects(b, a));
  });
});

describe('insetRect', () => {
  it('shrinks each side by the given fraction', () => {
    const r = insetRect({ x: 0, y: 0, w: 100, h: 50 }, 0.1);
    expect(r).toEqual({ x: 10, y: 5, w: 80, h: 40 });
  });

  it('with zero inset returns an identical rect', () => {
    const src = { x: 3, y: 4, w: 5, h: 6 };
    expect(insetRect(src, 0)).toEqual(src);
  });

  it('turns a near-miss into a pass when hitboxes are inset', () => {
    // Full boxes overlap by 2px; after a 14% inset on 44px-wide boxes they no longer touch.
    const player = { x: 0, y: 0, w: 44, h: 48 };
    const cactus = { x: 42, y: 0, w: 24, h: 44 };
    expect(aabbIntersects(player, cactus)).toBe(true);
    expect(aabbIntersects(insetRect(player, 0.14), insetRect(cactus, 0.1))).toBe(false);
  });
});

describe('clamp', () => {
  it('clamps below, inside, and above the range', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(15, 0, 10)).toBe(10);
  });
});
