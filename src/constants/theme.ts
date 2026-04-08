export const COLORS = {
  // ─── Brand ───────────────────────────
  primary: '#3B82F6', // blue-500
  primaryDark: '#2563EB', // blue-600
  accent: '#10B981', // emerald-500

  // ─── Ghost ───────────────────────────
  ghost: '#9CA3AF', // gray-400
  ghostOverlay: 'rgba(156, 163, 175, 0.6)',

  // ─── Status ──────────────────────────
  danger: '#EF4444',
  warning: '#F59E0B',
  success: '#22C55E',

  // ─── Neutral ─────────────────────────
  background: '#0F172A', // slate-900
  surface: '#1E293B', // slate-800
  surfaceLight: '#334155', // slate-700
  text: '#F8FAFC', // slate-50
  textSecondary: '#94A3B8', // slate-400
  border: '#475569', // slate-600

  // ─── Map ─────────────────────────────
  trackBlue: '#3B82F6',
  trackGhost: 'rgba(156, 163, 175, 0.6)',

  // ─── Route types ────────────────────
  bike: '#F59E0B',
  walk: '#10B981',

  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(15, 23, 42, 0.85)',
} as const;

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
