export type Theme = 'tangerine' | 'lagoon' | 'sprout' | 'violet' | 'ember' | 'deep-sea' | 'pine' | 'ultraviolet';

export const themes: Array<{ name: Theme; label: string; colors: [string, string, string] }> = [
  { name: 'tangerine', label: 'Tangerine', colors: ['#fff8ef', '#ffffff', '#f36b21'] },
  { name: 'lagoon', label: 'Lagoon', colors: ['#f3f9ff', '#ffffff', '#2678e3'] },
  { name: 'sprout', label: 'Sprout', colors: ['#f5fbf3', '#ffffff', '#29945a'] },
  { name: 'violet', label: 'Violet', colors: ['#faf6ff', '#ffffff', '#8a5cf6'] },
  { name: 'ember', label: 'Ember', colors: ['#1f1713', '#2c211b', '#ff8a3d'] },
  { name: 'deep-sea', label: 'Deep Sea', colors: ['#111827', '#1c2638', '#6da8ff'] },
  { name: 'pine', label: 'Pine', colors: ['#101b16', '#1b2a22', '#70d69b'] },
  { name: 'ultraviolet', label: 'Ultraviolet', colors: ['#1a1422', '#2b2136', '#c084fc'] },
];

const darkThemes = new Set<Theme>(['ember', 'deep-sea', 'pine', 'ultraviolet']);

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
