import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@ghostmap_custom';

// ─── Color palette for picker ─────────────────────────────
export const TRACK_COLORS = [
  { label: '🔵 Bleu', value: '#3B82F6' },
  { label: '🔴 Rouge', value: '#EF4444' },
  { label: '🟢 Vert', value: '#22C55E' },
  { label: '🟡 Jaune', value: '#EAB308' },
  { label: '🟠 Orange', value: '#F97316' },
  { label: '🟣 Violet', value: '#8B5CF6' },
  { label: '🩷 Rose', value: '#EC4899' },
  { label: '⚪ Blanc', value: '#FFFFFF' },
];

export const GHOST_COLORS = [
  { label: '🟡 Jaune', value: '#EAB308' },
  { label: '🩶 Gris', value: 'rgba(156,163,175,0.6)' },
  { label: '🔴 Rouge', value: '#EF4444' },
  { label: '🟠 Orange', value: '#F97316' },
  { label: '🟣 Violet', value: '#8B5CF6' },
  { label: '🩷 Rose', value: '#EC4899' },
  { label: '⚪ Blanc', value: 'rgba(255,255,255,0.6)' },
];

export const USER_ICONS = [
  { label: '🔵 Point bleu', value: 'blue-dot', color: '#3B82F6' },
  { label: '🟢 Point vert', value: 'green-dot', color: '#22C55E' },
  { label: '🔴 Point rouge', value: 'red-dot', color: '#EF4444' },
  { label: '🟠 Point orange', value: 'orange-dot', color: '#F97316' },
  { label: '🚴 Vélo', value: '🚴', color: '' },
  { label: '🚶 Marcheur', value: '🚶', color: '' },
  { label: '📍 Pin', value: '📍', color: '' },
];

export const GHOST_ICONS = [
  { label: '🟠 Point orange', value: 'orange-dot', color: '#F97316' },
  { label: '👻 Fantôme', value: '👻', color: '' },
  { label: '🔴 Point rouge', value: 'red-dot', color: '#EF4444' },
  { label: '🟡 Point jaune', value: 'yellow-dot', color: '#EAB308' },
  { label: '🩶 Point gris', value: 'gray-dot', color: '#9CA3AF' },
  { label: '💀 Crâne', value: '💀', color: '' },
  { label: '🏴 Drapeau', value: '🏴', color: '' },
];

// ─── Store ────────────────────────────────────────────────
interface CustomState {
  trackColor: string;
  ghostTrackColor: string;
  userIcon: string;        // 'blue-dot' | emoji
  userIconColor: string;   // hex for dots
  ghostIcon: string;       // 'orange-dot' | emoji
  ghostIconColor: string;
  keepAwake: boolean;
  defaultZoom: number;
  setTrackColor: (c: string) => void;
  setGhostTrackColor: (c: string) => void;
  setUserIcon: (icon: string, color: string) => void;
  setGhostIcon: (icon: string, color: string) => void;
  setKeepAwake: (v: boolean) => void;
  setDefaultZoom: (z: number) => void;
  loadCustom: () => Promise<void>;
}

function persist(state: Partial<CustomState>) {
  const data = {
    trackColor: state.trackColor,
    ghostTrackColor: state.ghostTrackColor,
    userIcon: state.userIcon,
    userIconColor: state.userIconColor,
    ghostIcon: state.ghostIcon,
    ghostIconColor: state.ghostIconColor,
    keepAwake: state.keepAwake,
    defaultZoom: state.defaultZoom,
  };
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
}

export const useCustomStore = create<CustomState>((set, get) => ({
  trackColor: '#3B82F6',
  ghostTrackColor: '#EAB308',
  userIcon: 'blue-dot',
  userIconColor: '#3B82F6',
  ghostIcon: 'orange-dot',
  ghostIconColor: '#F97316',
  keepAwake: false,
  defaultZoom: 15,

  setTrackColor: (c) => {
    set({ trackColor: c });
    persist(get());
  },
  setGhostTrackColor: (c) => {
    set({ ghostTrackColor: c });
    persist(get());
  },
  setUserIcon: (icon, color) => {
    set({ userIcon: icon, userIconColor: color });
    persist(get());
  },
  setGhostIcon: (icon, color) => {
    set({ ghostIcon: icon, ghostIconColor: color });
    persist(get());
  },
  setKeepAwake: (v) => {
    set({ keepAwake: v });
    persist(get());
  },
  setDefaultZoom: (z) => {
    set({ defaultZoom: z });
    persist(get());
  },
  loadCustom: async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        const data = JSON.parse(json);
        set({
          trackColor: data.trackColor ?? '#3B82F6',
          ghostTrackColor: data.ghostTrackColor ?? '#EAB308',
          userIcon: data.userIcon ?? 'blue-dot',
          userIconColor: data.userIconColor ?? '#3B82F6',
          ghostIcon: data.ghostIcon ?? 'orange-dot',
          ghostIconColor: data.ghostIconColor ?? '#F97316',
          keepAwake: data.keepAwake ?? false,
          defaultZoom: data.defaultZoom ?? 15,
        });
      }
    } catch {}
  },
}));
