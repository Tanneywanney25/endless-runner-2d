import { describe, expect, it } from 'vitest';
import { ScoreStore, type StorageLike } from '../src/systems/storage';

function memoryStorage(initial: Record<string, string> = {}): StorageLike {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
  };
}

describe('ScoreStore.best', () => {
  it('defaults to 0 on empty storage', () => {
    expect(new ScoreStore(memoryStorage(), 5).best).toBe(0);
  });

  it('only improves when a run beats it', () => {
    const store = new ScoreStore(memoryStorage(), 5);
    store.record(120);
    expect(store.best).toBe(120);
    store.record(80);
    expect(store.best).toBe(120);
    store.record(200);
    expect(store.best).toBe(200);
  });

  it('survives corrupt stored values', () => {
    const store = new ScoreStore(memoryStorage({ 'er2d.best': 'garbage' }), 5);
    expect(store.best).toBe(0);
  });
});

describe('ScoreStore.top', () => {
  it('keeps at most maxEntries, sorted descending', () => {
    const store = new ScoreStore(memoryStorage(), 5);
    for (const s of [50, 10, 90, 30, 70, 60, 20]) store.record(s);
    expect(store.top.map((e) => e.score)).toEqual([90, 70, 60, 50, 30]);
  });

  it('records the run date as ISO string', () => {
    const store = new ScoreStore(memoryStorage(), 5);
    const when = new Date('2026-09-25T12:00:00.000Z');
    store.record(42, when);
    expect(store.top[0]?.date).toBe('2026-09-25T12:00:00.000Z');
  });

  it('ignores corrupt or malformed persisted lists', () => {
    expect(new ScoreStore(memoryStorage({ 'er2d.top': 'not json' }), 5).top).toEqual([]);
    expect(new ScoreStore(memoryStorage({ 'er2d.top': '{"a":1}' }), 5).top).toEqual([]);
    const partial = JSON.stringify([{ score: 5, date: 'd' }, { bogus: true }, 3]);
    expect(new ScoreStore(memoryStorage({ 'er2d.top': partial }), 5).top).toEqual([
      { score: 5, date: 'd' },
    ]);
  });

  it('honours a smaller maxEntries bound', () => {
    const store = new ScoreStore(memoryStorage(), 2);
    for (const s of [1, 2, 3]) store.record(s);
    expect(store.top.map((e) => e.score)).toEqual([3, 2]);
  });
});
