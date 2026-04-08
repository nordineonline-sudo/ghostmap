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
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  accent: '#10B981',
  ghost: '#9CA3AF',
  ghostOverlay: 'rgba(156, 163, 175, 0.6)',
  danger: '#EF4444',
  warning: '#F59E0B',
  success: '#22C55E',
  background: '#0F172A',
  surface: '#1E293B',
  surfaceLight: '#334155',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#475569',
  trackBlue: '#3B82F6',
  trackGhost: 'rgba(156, 163, 175, 0.6)',
  bike: '#F59E0B',
  walk: '#10B981',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(15, 23, 42, 0.85)',
  tileUrl: 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
};

// ─── Light ─────────────────────────────────────────────────
const LIGHT: ThemeColors = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  accent: '#059669',
  ghost: '#6B7280',
  ghostOverlay: 'rgba(107, 114, 128, 0.5)',
  danger: '#DC2626',
  warning: '#D97706',
  success: '#16A34A',
  background: '#F1F5F9',
  surface: '#FFFFFF',
  surfaceLight: '#E2E8F0',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#CBD5E1',
  trackBlue: '#2563EB',
  trackGhost: 'rgba(107, 114, 128, 0.5)',
  bike: '#D97706',
  walk: '#059669',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(241, 245, 249, 0.9)',
  tileUrl: 'https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
};

// ─── Midnight ──────────────────────────────────────────────
const MIDNIGHT: ThemeColors = {
  primary: '#8B5CF6',
  primaryDark: '#7C3AED',
  accent: '#F472B6',
  ghost: '#9CA3AF',
  ghostOverlay: 'rgba(156, 163, 175, 0.6)',
  danger: '#EF4444',
  warning: '#F59E0B',
  success: '#22C55E',
  background: '#030712',
  surface: '#111827',
  surfaceLight: '#1F2937',
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  border: '#374151',
  trackBlue: '#8B5CF6',
  trackGhost: 'rgba(156, 163, 175, 0.6)',
  bike: '#F59E0B',
  walk: '#F472B6',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(3, 7, 18, 0.9)',
  tileUrl: 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
};

// ─── Forest ────────────────────────────────────────────────
const FOREST: ThemeColors = {
  primary: '#22C55E',
  primaryDark: '#16A34A',
  accent: '#A3E635',
  ghost: '#9CA3AF',
  ghostOverlay: 'rgba(156, 163, 175, 0.6)',
  danger: '#EF4444',
  warning: '#F59E0B',
  success: '#22C55E',
  background: '#052E16',
  surface: '#14532D',
  surfaceLight: '#166534',
  text: '#F0FDF4',
  textSecondary: '#86EFAC',
  border: '#15803D',
  trackBlue: '#22C55E',
  trackGhost: 'rgba(156, 163, 175, 0.6)',
  bike: '#F59E0B',
  walk: '#A3E635',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(5, 46, 22, 0.9)',
  tileUrl: 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
};

export const THEMES: Record<ThemeName, ThemeColors> = {
  dark: DARK,
  light: LIGHT,
  midnight: MIDNIGHT,
  forest: FOREST,
};

export const THEME_LABELS: Record<ThemeName, string> = {
  dark: '🌙 Sombre',
  light: '☀️ Clair',
  midnight: '🔮 Midnight',
  forest: '🌲 Forêt',
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
