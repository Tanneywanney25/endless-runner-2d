const canvas = document.querySelector<HTMLCanvasElement>('#game');
if (!canvas) {
  throw new Error('Missing #game canvas element');
}

// Game bootstrap is wired up as modules land; for now, render a placeholder frame.
const ctx = canvas.getContext('2d');
if (ctx) {
  ctx.fillStyle = '#f7f7f7';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
