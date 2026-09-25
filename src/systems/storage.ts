/** Minimal storage interface so tests can inject an in-memory fake. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface ScoreEntry {
  score: number;
  /** ISO date string of when the run ended. */
  date: string;
}

const BEST_KEY = 'er2d.best';
const TOP_KEY = 'er2d.top';

/** Persists the best score and a bounded top-N scoreboard. */
export class ScoreStore {
  constructor(
    private readonly storage: StorageLike,
    private readonly maxEntries: number,
  ) {}

  get best(): number {
    const raw = this.storage.getItem(BEST_KEY);
    const parsed = raw === null ? NaN : Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  }

  get top(): ScoreEntry[] {
    const raw = this.storage.getItem(TOP_KEY);
    if (raw === null) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (e): e is ScoreEntry =>
          typeof e === 'object' &&
          e !== null &&
          typeof (e as ScoreEntry).score === 'number' &&
          typeof (e as ScoreEntry).date === 'string',
      );
    } catch {
      return [];
    }
  }

  /** Record a finished run; keeps best and the top-N sorted descending. */
  record(score: number, when: Date = new Date()): void {
    if (score > this.best) {
      this.storage.setItem(BEST_KEY, String(score));
    }
    const entries = [...this.top, { score, date: when.toISOString() }]
      .sort((a, b) => b.score - a.score)
      .slice(0, this.maxEntries);
    this.storage.setItem(TOP_KEY, JSON.stringify(entries));
  }
}
