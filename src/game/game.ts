import type { GameConfig, PhysicsSettings } from '../config';
import type { Sprites } from '../core/assets';
import type { Input } from '../core/input';
import { aabbIntersects } from '../core/math';
import { randRange } from '../core/rng';
import { Player } from '../entities/player';
import { Ground } from '../entities/ground';
import { Obstacle } from '../entities/obstacle';
import { Cloud } from '../entities/cloud';
import type { Spawner } from '../systems/spawner';
import { ScoreTracker, speedForScore } from '../systems/score';
import type { ScoreStore } from '../systems/storage';

export type GameState = 'menu' | 'playing' | 'gameover';

export interface GameOptions {
  cfg: GameConfig;
  sprites: Sprites;
  input: Input;
  store: ScoreStore;
  /** Factory so the spawner (random vs pattern mode) can be swapped between runs. */
  makeSpawner: () => Spawner;
  rng: () => number;
  onStateChange?: (state: GameState) => void;
}

export class Game {
  state: GameState = 'menu';
  /** Live physics settings — the settings panel mutates these. */
  physics: PhysicsSettings;
  night = false;

  private readonly cfg: GameConfig;
  private readonly sprites: Sprites;
  private readonly input: Input;
  private readonly store: ScoreStore;
  private readonly rng: () => number;
  private readonly onStateChange: ((state: GameState) => void) | undefined;

  private makeSpawner: () => Spawner;
  private spawner: Spawner;
  private readonly player: Player;
  private readonly ground: Ground;
  private readonly scoreTracker: ScoreTracker;
  private obstacles: Obstacle[] = [];
  private clouds: Cloud[] = [];
  private cloudTimer = 0;

  constructor(opts: GameOptions) {
    this.cfg = opts.cfg;
    this.sprites = opts.sprites;
    this.input = opts.input;
    this.store = opts.store;
    this.rng = opts.rng;
    this.onStateChange = opts.onStateChange;
    this.makeSpawner = opts.makeSpawner;
    this.spawner = this.makeSpawner();
    this.physics = { ...this.cfg.physics };
    this.player = new Player(this.cfg);
    this.ground = new Ground(this.cfg);
    this.scoreTracker = new ScoreTracker(this.cfg);
  }

  get score(): number {
    return this.scoreTracker.score;
  }

  get best(): number {
    return this.store.best;
  }

  get speed(): number {
    return this.state === 'playing' ? speedForScore(this.score, this.cfg.speed) : 0;
  }

  /** Replace the spawner factory (used when pattern mode is toggled). */
  setSpawnerFactory(factory: () => Spawner): void {
    this.makeSpawner = factory;
    this.spawner = factory();
  }

  startRun(): void {
    this.scoreTracker.reset();
    this.player.reset();
    this.ground.reset();
    this.obstacles = [];
    this.clouds = [];
    this.cloudTimer = 0;
    this.spawner = this.makeSpawner();
    this.setState('playing');
  }

  private setState(state: GameState): void {
    this.state = state;
    this.onStateChange?.(state);
  }

  update(dt: number): void {
    const pressed = this.input.justPressed('Space') || this.input.justPressed('ArrowUp');
    if (pressed) {
      if (this.state === 'menu' || this.state === 'gameover') {
        this.startRun();
      } else {
        this.player.jump(this.physics);
      }
    }

    if (this.state === 'playing') {
      this.scoreTracker.tick(dt);
      const speed = speedForScore(this.score, this.cfg.speed);

      this.ground.update(dt, speed);
      this.player.update(dt, this.physics);

      const decision = this.spawner.advance(speed * dt);
      if (decision) {
        this.obstacles.push(new Obstacle(this.cfg, decision.type, this.cfg.canvas.width + 4));
      }
      for (const o of this.obstacles) o.update(dt, speed);
      this.obstacles = this.obstacles.filter((o) => !o.offscreen);

      this.cloudTimer += dt * 1000;
      if (this.cloudTimer >= this.cfg.spawn.cloudIntervalMs) {
        this.cloudTimer = 0;
        this.clouds.push(
          new Cloud(this.cfg, randRange(this.rng, 30, 90), this.cfg.canvas.width + 10),
        );
      }
      for (const c of this.clouds) c.update(dt, speed);
      this.clouds = this.clouds.filter((c) => !c.offscreen);

      const hit = this.obstacles.some((o) => aabbIntersects(this.player.hitbox, o.hitbox));
      if (hit) {
        this.store.record(this.score);
        this.setState('gameover');
      }
    }

    this.input.endFrame();
  }

  render(ctx: CanvasRenderingContext2D): void {
    const { width, height } = this.cfg.canvas;
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    if (this.night) {
      ctx.filter = 'invert(1) hue-rotate(180deg)';
    }

    for (const c of this.clouds) c.draw(ctx, this.sprites);
    this.ground.draw(ctx, this.sprites);
    for (const o of this.obstacles) o.draw(ctx, this.sprites);
    this.player.draw(ctx, this.sprites, this.state === 'gameover');

    if (this.state === 'gameover') {
      ctx.drawImage(this.sprites.gameOver, width / 2 - 95, 45, 190, 22);
      ctx.drawImage(this.sprites.restart, width / 2 - 18, 82, 36, 32);
    }
    ctx.restore();

    if (this.state === 'menu') {
      ctx.fillStyle = this.night ? '#e8eaed' : '#535353';
      ctx.font = '14px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Press Space to start — Space/Up to jump', width / 2, 80);
      ctx.textAlign = 'start';
    }
  }
}
