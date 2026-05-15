export type Theme =
  | 'tangerine'
  | 'lagoon'
  | 'sprout'
  | 'violet'
  | 'ember'
  | 'deep-sea'
  | 'pine'
  | 'ultraviolet'
  | 'bubblegum'
  | 'vaporwave'
  | 'matrix'
  | 'carnival';

export type ThemeRow = 'light' | 'dark' | 'chaos';

export interface ThemeEntry {
  name: Theme;
  label: string;
  colors: [string, string, string];
  row: ThemeRow;
}

export const themes: ThemeEntry[] = [
  { name: 'tangerine', label: 'Tangerine', colors: ['#fff8ef', '#ffffff', '#f36b21'], row: 'light' },
  { name: 'lagoon', label: 'Lagoon', colors: ['#f3f9ff', '#ffffff', '#2678e3'], row: 'light' },
  { name: 'sprout', label: 'Sprout', colors: ['#f5fbf3', '#ffffff', '#29945a'], row: 'light' },
  { name: 'violet', label: 'Violet', colors: ['#faf6ff', '#ffffff', '#8a5cf6'], row: 'light' },
  { name: 'ember', label: 'Ember', colors: ['#1f1713', '#2c211b', '#ff8a3d'], row: 'dark' },
  { name: 'deep-sea', label: 'Deep Sea', colors: ['#111827', '#1c2638', '#6da8ff'], row: 'dark' },
  { name: 'pine', label: 'Pine', colors: ['#101b16', '#1b2a22', '#70d69b'], row: 'dark' },
  { name: 'ultraviolet', label: 'Ultraviolet', colors: ['#1a1422', '#2b2136', '#c084fc'], row: 'dark' },
  { name: 'bubblegum', label: 'Bubblegum', colors: ['#ffeaf6', '#22d3ee', '#ff3da6'], row: 'chaos' },
  { name: 'vaporwave', label: 'Vaporwave', colors: ['#1a0f2e', '#ff77ee', '#22d3ee'], row: 'chaos' },
  { name: 'matrix', label: 'Matrix', colors: ['#020a04', '#0c1f12', '#39ff7f'], row: 'chaos' },
  { name: 'carnival', label: 'Carnival', colors: ['#fffce5', '#ff2d55', '#ffd60a'], row: 'chaos' },
];

const darkThemes = new Set<Theme>(['ember', 'deep-sea', 'pine', 'ultraviolet', 'vaporwave', 'matrix']);

export function applyTheme(value: Theme) {
  document.documentElement.dataset.theme = value;
  document.documentElement.classList.toggle('dark', darkThemes.has(value));
}

export function getStoredTheme(storageKey = 'theme') {
  const stored = localStorage.getItem(storageKey);

  return isTheme(stored) ? stored : 'tangerine';
}

export function isTheme(value: string | null): value is Theme {
  return themes.some((item) => item.name === value);
}
