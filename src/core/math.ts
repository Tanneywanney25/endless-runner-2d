/** Axis-aligned rectangle, x/y is the top-left corner. */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Strict AABB overlap test — touching edges do not count as a collision. */
export function aabbIntersects(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

/**
 * Shrink a rect by `inset` (fraction of width/height trimmed from EACH side).
 * Used to make sprite hitboxes fairer than their full bounding box.
 */
export function insetRect(r: Rect, inset: number): Rect {
  const dx = r.w * inset;
  const dy = r.h * inset;
  return { x: r.x + dx, y: r.y + dy, w: r.w - dx * 2, h: r.h - dy * 2 };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
