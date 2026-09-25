/** Tracks held keys plus one-frame "just pressed" edges. */
export class Input {
  private down = new Set<string>();
  private pressedQueue = new Set<string>();

  attach(target: Window): void {
    target.addEventListener('keydown', this.onKeyDown);
    target.addEventListener('keyup', this.onKeyUp);
  }

  detach(target: Window): void {
    target.removeEventListener('keydown', this.onKeyDown);
    target.removeEventListener('keyup', this.onKeyUp);
  }

  isDown(code: string): boolean {
    return this.down.has(code);
  }

  /** True once per physical key press; cleared by `endFrame()`. */
  justPressed(code: string): boolean {
    return this.pressedQueue.has(code);
  }

  endFrame(): void {
    this.pressedQueue.clear();
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (e.code === 'Space' || e.code === 'ArrowUp') e.preventDefault();
    if (!e.repeat) this.pressedQueue.add(e.code);
    this.down.add(e.code);
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.down.delete(e.code);
  };
}
