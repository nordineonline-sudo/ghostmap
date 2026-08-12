// ─── Theme types ──────────────────────────────────────────
export type ThemeName = 'dark' | 'light' | 'midnight' | 'forest';

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  accent: string;
  ghost: string;
  ghostOverlay: string;
  danger: string;
  warning: string;
  success: string;
  background: string;
  surface: string;
  surfaceLight: string;
  text: string;
  textSecondary: string;
  border: string;
  trackBlue: string;
  trackGhost: string;
  bike: string;
  walk: string;
  white: string;
  black: string;
  overlay: string;
  tileUrl: string;
}

// ─── Dark (default) ────────────────────────────────────────
const DARK: ThemeColors = {
  primary: '#4AD2FF',
  primaryDark: '#1AA9E1',
  accent: '#FF8A5B',
  ghost: '#9DB1C7',
  ghostOverlay: 'rgba(157, 177, 199, 0.55)',
  danger: '#FF5C57',
  warning: '#FFB703',
  success: '#34C77B',
  background: '#0E2236',
  surface: '#16314D',
  surfaceLight: '#214363',
  text: '#F4FBFF',
  textSecondary: '#A8C4DA',
  border: '#2A5679',
  trackBlue: '#4AD2FF',
  trackGhost: 'rgba(157, 177, 199, 0.55)',
  bike: '#F59E0B',
  walk: '#34C77B',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(22, 49, 77, 0.9)',
  tileUrl: 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
};

// ─── Light ─────────────────────────────────────────────────
const LIGHT: ThemeColors = {
  primary: '#35C8FF',
  primaryDark: '#149ED2',
  accent: '#FF8A5B',
  ghost: '#94A7B8',
  ghostOverlay: 'rgba(148, 167, 184, 0.45)',
  danger: '#FF6159',
  warning: '#FFB703',
  success: '#2FCB73',
  background: '#EAF9FF',
  surface: '#FFFFFF',
  surfaceLight: '#DDF5FF',
  text: '#17324D',
  textSecondary: '#618099',
  border: '#B7E5F3',
  trackBlue: '#35C8FF',
  trackGhost: 'rgba(148, 167, 184, 0.45)',
  bike: '#FF9F1C',
  walk: '#2FCB73',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(255, 255, 255, 0.92)',
  tileUrl: 'https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
};

// ─── Midnight ──────────────────────────────────────────────
const MIDNIGHT: ThemeColors = {
  primary: '#6D8DFF',
  primaryDark: '#546EF4',
  accent: '#FF8A5B',
  ghost: '#909DB0',
  ghostOverlay: 'rgba(144, 157, 176, 0.55)',
  danger: '#FF6159',
  warning: '#FFB703',
  success: '#2FCB73',
  background: '#0A1020',
  surface: '#111B31',
  surfaceLight: '#192745',
  text: '#F4F7FF',
  textSecondary: '#9AA6C0',
  border: '#253351',
  trackBlue: '#6D8DFF',
  trackGhost: 'rgba(144, 157, 176, 0.55)',
  bike: '#F59E0B',
  walk: '#2FCB73',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(17, 27, 49, 0.92)',
  tileUrl: 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
};

// ─── Forest ────────────────────────────────────────────────
const FOREST: ThemeColors = {
  primary: '#38D58A',
  primaryDark: '#1CB46B',
  accent: '#FFB703',
  ghost: '#A3BDAF',
  ghostOverlay: 'rgba(163, 189, 175, 0.55)',
  danger: '#FF6159',
  warning: '#FFB703',
  success: '#38D58A',
  background: '#0D241B',
  surface: '#153427',
  surfaceLight: '#204838',
  text: '#EFFCF5',
  textSecondary: '#A3CBB8',
  border: '#2A614B',
  trackBlue: '#38D58A',
  trackGhost: 'rgba(163, 189, 175, 0.55)',
  bike: '#F59E0B',
  walk: '#A3E635',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(21, 52, 39, 0.92)',
  tileUrl: 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
};

export const THEMES: Record<ThemeName, ThemeColors> = {
  dark: DARK,
  light: LIGHT,
  midnight: MIDNIGHT,
  forest: FOREST,
};

export const THEME_LABELS: Record<ThemeName, string> = {
  dark: 'Sombre',
  light: 'Clair',
  midnight: 'Nuit',
  forest: 'Forêt',
};

// Backward-compatible export — points to dark by default
// Screens should use useThemeStore().colors instead
export const COLORS = DARK;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FONT_SIZE = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
  hero: 48,
} as const;

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
