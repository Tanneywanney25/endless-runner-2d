import { defaultConfig } from './config';
import { loadImages, spriteSources } from './core/assets';
import { Input } from './core/input';
import { createLoop } from './core/loop';
import { mulberry32 } from './core/rng';
import { Game } from './game/game';
import { Spawner, type ObstaclePattern } from './systems/spawner';
import { ScoreStore, type StorageLike } from './systems/storage';
import { Hud, renderScoreboard } from './ui/hud';
import { buildSettingsPanel, loadSettings, saveSettings, type Settings } from './ui/settings';

function getStorage(): StorageLike {
  try {
    const probe = '__er2d_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    const mem = new Map<string, string>();
    return {
      getItem: (k) => mem.get(k) ?? null,
      setItem: (k, v) => void mem.set(k, v),
    };
  }
}

async function fetchPattern(): Promise<ObstaclePattern | undefined> {
  try {
    const res = await fetch('patterns/default.json');
    if (!res.ok) return undefined;
    return (await res.json()) as ObstaclePattern;
  } catch {
    return undefined;
  }
}

async function init(): Promise<void> {
  const canvas = document.querySelector<HTMLCanvasElement>('#game');
  const settingsPanel = document.querySelector<HTMLElement>('#settings-panel');
  const settingsToggle = document.querySelector<HTMLElement>('#settings-toggle');
  const scoreboardEl = document.querySelector<HTMLElement>('#scoreboard');
  if (!canvas || !settingsPanel || !settingsToggle || !scoreboardEl) {
    throw new Error('Missing required layout elements');
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const cfg = defaultConfig;
  canvas.width = cfg.canvas.width;
  canvas.height = cfg.canvas.height;

  const [sprites, pattern] = await Promise.all([loadImages(spriteSources), fetchPattern()]);

  const storage = getStorage();
  const store = new ScoreStore(storage, cfg.scoreboard.maxEntries);
  const settings: Settings = loadSettings(storage, {
    jumpVelocity: cfg.physics.jumpVelocity,
    gravity: cfg.physics.gravity,
    night: false,
    usePattern: false,
  });

  const input = new Input();
  input.attach(window);

  const rng = mulberry32(Date.now() >>> 0);
  const makeSpawner = (): Spawner =>
    settings.usePattern && pattern ? new Spawner(cfg, rng, pattern) : new Spawner(cfg, rng);

  const hud = new Hud(document);
  const game = new Game({
    cfg,
    sprites,
    input,
    store,
    makeSpawner,
    rng,
    onStateChange: (state) => {
      if (state === 'gameover') renderScoreboard(scoreboardEl, store.top);
    },
  });

  const applySettings = (s: Settings): void => {
    game.physics.jumpVelocity = s.jumpVelocity;
    game.physics.gravity = s.gravity;
    game.night = s.night;
    document.body.classList.toggle('night', s.night);
    game.setSpawnerFactory(makeSpawner);
    saveSettings(storage, s);
  };
  buildSettingsPanel(settingsPanel, settingsToggle, settings, applySettings);
  applySettings(settings);

  canvas.addEventListener('pointerdown', () => {
    if (game.state === 'menu' || game.state === 'gameover') game.startRun();
  });

  renderScoreboard(scoreboardEl, store.top);

  const loop = createLoop({
    update: (dt) => game.update(dt),
    render: () => {
      game.render(ctx);
      hud.update(game.score, game.best, game.speed);
    },
  });
  loop.start();
}

void init();
