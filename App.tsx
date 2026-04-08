import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { getDb } from './src/utils/database';
import { useThemeStore } from './src/stores/themeStore';

export default function App() {
  const loadTheme = useThemeStore((s) => s.loadTheme);
  const themeName = useThemeStore((s) => s.themeName);

  // Initialize database and theme on startup
  useEffect(() => {
    getDb().catch(console.error);
    loadTheme();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={themeName === 'light' ? 'dark' : 'light'} />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
