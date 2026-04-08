import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeName, ThemeColors, THEMES } from '../constants/theme';

const STORAGE_KEY = '@ghostmap_theme';

interface ThemeState {
  themeName: ThemeName;
  colors: ThemeColors;
  setTheme: (name: ThemeName) => void;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  themeName: 'dark',
  colors: THEMES.dark,

  setTheme: (name: ThemeName) => {
    set({ themeName: name, colors: THEMES[name] });
    AsyncStorage.setItem(STORAGE_KEY, name).catch(() => {});
  },

  loadTheme: async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved && saved in THEMES) {
        const name = saved as ThemeName;
        set({ themeName: name, colors: THEMES[name] });
      }
    } catch {}
  },
}));
