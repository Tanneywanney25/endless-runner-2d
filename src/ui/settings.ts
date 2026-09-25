import type { StorageLike } from '../systems/storage';

export interface Settings {
  jumpVelocity: number;
  gravity: number;
  night: boolean;
  /** Replay the deterministic obstacle pattern instead of random gaps. */
  usePattern: boolean;
}

const SETTINGS_KEY = 'er2d.settings';

export function loadSettings(storage: StorageLike, defaults: Settings): Settings {
  const raw = storage.getItem(SETTINGS_KEY);
  if (raw === null) return { ...defaults };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return { ...defaults };
    const p = parsed as Partial<Settings>;
    return {
      jumpVelocity: typeof p.jumpVelocity === 'number' ? p.jumpVelocity : defaults.jumpVelocity,
      gravity: typeof p.gravity === 'number' ? p.gravity : defaults.gravity,
      night: typeof p.night === 'boolean' ? p.night : defaults.night,
      usePattern: typeof p.usePattern === 'boolean' ? p.usePattern : defaults.usePattern,
    };
  } catch {
    return { ...defaults };
  }
}

export function saveSettings(storage: StorageLike, settings: Settings): void {
  storage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

interface SliderSpec {
  key: 'jumpVelocity' | 'gravity';
  label: string;
  min: number;
  max: number;
  step: number;
}

const SLIDERS: SliderSpec[] = [
  { key: 'jumpVelocity', label: 'Jump velocity (px/s)', min: 400, max: 900, step: 10 },
  { key: 'gravity', label: 'Gravity (px/s²)', min: 1200, max: 3200, step: 50 },
];

/** Builds the settings panel DOM and reports edits through `onChange`. */
export function buildSettingsPanel(
  panel: HTMLElement,
  toggleButton: HTMLElement,
  settings: Settings,
  onChange: (settings: Settings) => void,
): void {
  panel.innerHTML = '';

  for (const spec of SLIDERS) {
    const label = document.createElement('label');
    const readout = document.createElement('strong');
    readout.textContent = ` ${settings[spec.key]}`;
    label.append(`${spec.label}:`, readout);

    const input = document.createElement('input');
    input.type = 'range';
    input.min = String(spec.min);
    input.max = String(spec.max);
    input.step = String(spec.step);
    input.value = String(settings[spec.key]);
    input.addEventListener('input', () => {
      settings[spec.key] = Number(input.value);
      readout.textContent = ` ${input.value}`;
      onChange(settings);
    });
    label.append(input);
    panel.append(label);
  }

  const checks: { key: 'night' | 'usePattern'; label: string }[] = [
    { key: 'night', label: 'Night mode' },
    { key: 'usePattern', label: 'Deterministic pattern mode' },
  ];
  for (const spec of checks) {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = settings[spec.key];
    input.addEventListener('change', () => {
      settings[spec.key] = input.checked;
      onChange(settings);
    });
    label.append(input, ` ${spec.label}`);
    panel.append(label);
  }

  toggleButton.addEventListener('click', () => {
    const nowHidden = !panel.hidden;
    panel.hidden = nowHidden;
    toggleButton.setAttribute('aria-expanded', String(!nowHidden));
  });
}
