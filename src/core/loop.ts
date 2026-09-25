export interface LoopCallbacks {
  /** Called with a fixed timestep in seconds; may run multiple times per frame. */
  update: (dt: number) => void;
  /** Called once per animation frame after updates. */
  render: () => void;
}

export interface GameLoop {
  start: () => void;
  stop: () => void;
  readonly running: boolean;
}

const MAX_FRAME_SECONDS = 0.25;

/**
 * Fixed-timestep loop: simulation advances in constant `step` increments while
 * rendering happens once per animation frame. Long frames are clamped so a
 * background tab does not fast-forward the game on return.
 */
export function createLoop(callbacks: LoopCallbacks, step = 1 / 60): GameLoop {
  let rafId = 0;
  let running = false;
  let last = 0;
  let accumulator = 0;

  const frame = (now: number): void => {
    if (!running) return;
    const elapsed = Math.min((now - last) / 1000, MAX_FRAME_SECONDS);
    last = now;
    accumulator += elapsed;
    while (accumulator >= step) {
      callbacks.update(step);
      accumulator -= step;
    }
    callbacks.render();
    rafId = requestAnimationFrame(frame);
  };

  return {
    start(): void {
      if (running) return;
      running = true;
      last = performance.now();
      accumulator = 0;
      rafId = requestAnimationFrame(frame);
    },
    stop(): void {
      running = false;
      cancelAnimationFrame(rafId);
    },
    get running(): boolean {
      return running;
    },
  };
}
