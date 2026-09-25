import type { ScoreEntry } from '../systems/storage';

/** Thin DOM head-up display: score, best, current speed. */
export class Hud {
  private readonly scoreEl: HTMLElement;
  private readonly bestEl: HTMLElement;
  private readonly speedEl: HTMLElement;

  constructor(root: Document) {
    this.scoreEl = Hud.require(root, '#hud-score');
    this.bestEl = Hud.require(root, '#hud-best');
    this.speedEl = Hud.require(root, '#hud-speed');
  }

  private static require(root: Document, selector: string): HTMLElement {
    const el = root.querySelector<HTMLElement>(selector);
    if (!el) throw new Error(`Missing HUD element ${selector}`);
    return el;
  }

  update(score: number, best: number, speed: number): void {
    this.scoreEl.textContent = `Score: ${score}`;
    this.bestEl.textContent = `Best: ${best}`;
    this.speedEl.textContent = `Speed: ${Math.round(speed)} px/s`;
  }
}

/** Render the local top-N table under the canvas. */
export function renderScoreboard(el: HTMLElement, entries: ScoreEntry[]): void {
  if (entries.length === 0) {
    el.innerHTML = '<p>No finished runs yet — the top 5 land here.</p>';
    return;
  }
  const rows = entries
    .map((e, i) => {
      const date = new Date(e.date).toLocaleDateString();
      return `<tr><td>#${i + 1}</td><td>${e.score}</td><td>${date}</td></tr>`;
    })
    .join('');
  el.innerHTML = `<table><thead><tr><th></th><th>Score</th><th>Date</th></tr></thead><tbody>${rows}</tbody></table>`;
}
