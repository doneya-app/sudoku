export type ColorScheme = 'classic' | 'forest' | 'sunset' | 'purple';

export interface ColorSchemeDefinition {
  id: ColorScheme;
  name: string;
  description: string;
  colors: string[]; // Preview colors for the selector
}

export const colorSchemes: ColorSchemeDefinition[] = [
  {
    id: 'classic',
    name: 'Classic Blue',
    description: 'Traditional blue tones',
    colors: ['hsl(237, 62%, 55%)', 'hsl(220, 15%, 92%)', 'hsl(210, 70%, 90%)'],
  },
  {
    id: 'forest',
    name: 'Forest Green',
    description: 'Natural green tones',
    colors: ['hsl(142, 62%, 45%)', 'hsl(140, 30%, 88%)', 'hsl(145, 60%, 85%)'],
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    description: 'Warm orange palette',
    colors: ['hsl(25, 85%, 55%)', 'hsl(30, 50%, 90%)', 'hsl(20, 80%, 85%)'],
  },
  {
    id: 'purple',
    name: 'Purple Dream',
    description: 'Modern purple theme',
    colors: ['hsl(270, 60%, 55%)', 'hsl(280, 30%, 90%)', 'hsl(275, 70%, 85%)'],
  },
];

const STORAGE_KEY = 'sudoku-color-scheme';

export function getColorScheme(): ColorScheme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && ['classic', 'forest', 'sunset', 'purple'].includes(stored)) {
    return stored as ColorScheme;
  }
  return 'classic';
}

export function setColorScheme(scheme: ColorScheme): void {
  localStorage.setItem(STORAGE_KEY, scheme);
  applyColorScheme(scheme);
}

export function applyColorScheme(scheme: ColorScheme): void {
  document.documentElement.setAttribute('data-color-scheme', scheme);
}
