import React, { useEffect, useCallback } from 'react';
import { Linking, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as FileSystem from 'expo-file-system/legacy';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { getDb } from './src/utils/database';
import { insertRouteIfNotExists } from './src/utils/database';
import { loadRecoverySnapshot, clearRecoverySnapshot } from './src/utils/recoverySession';
import { averageSpeed, maxSpeed as calcMaxSpeed, elapsedTime, totalDistance, getCityFromCoords } from './src/utils/gps';
import { useThemeStore } from './src/stores/themeStore';
import { useCustomStore } from './src/stores/customStore';
import { useRouteStore } from './src/stores/routeStore';
import { SavedRoute } from './src/types';

export default function App() {
  const loadTheme = useThemeStore((s) => s.loadTheme);
  const themeName = useThemeStore((s) => s.themeName);
  const loadCustom = useCustomStore((s) => s.loadCustom);
  const loadRoutes = useRouteStore((s) => s.loadRoutes);

  // Initialize database and theme on startup
  useEffect(() => {
    const init = async () => {
      await getDb();
      loadTheme();
      loadCustom();

      // ── Crash / battery-out recovery ─────────────────────────────────────
      // If a recording snapshot from a previous interrupted session exists,
      // convert it into a saved route (idempotent via INSERT OR IGNORE).
      const snapshot = await loadRecoverySnapshot();
      if (snapshot && snapshot.points.length >= 2) {
        const pts = snapshot.points;
        const dur = elapsedTime(pts);
        const dist = totalDistance(pts);
        const avg = averageSpeed(pts);
        const max = calcMaxSpeed(pts);

        const firstPoint = pts[0];
        const city = await getCityFromCoords(firstPoint.latitude, firstPoint.longitude).catch(() => null);
        const date = new Date(snapshot.startTime);
        const dateStr = date.toLocaleDateString('fr-FR');
        const routeName = city
          ? `${city} ${dateStr} (récupéré)`
          : `Parcours ${dateStr} (récupéré)`;

        const route: SavedRoute = {
          id: snapshot.id,
          name: routeName,
          type: snapshot.type,
          date: new Date(snapshot.startTime).toISOString(),
          duration: dur,
          distance: dist,
          avgSpeed: avg,
          maxSpeed: max,
          points: pts,
        };

        await insertRouteIfNotExists(route);
      }
      await clearRecoverySnapshot();
      // ─────────────────────────────────────────────────────────────────────

      await loadRoutes();
    };
    init().catch(console.error);
  }, []);

  // Import a .gmr file from a URI
  const handleIncomingFile = useCallback(async (url: string) => {
    try {
      // Copy content:// to cache first for reliable reading
      let fileUri = url;
      if (url.startsWith('content://')) {
        const dest = `${FileSystem.cacheDirectory}import_${Date.now()}.gmr`;
        await FileSystem.copyAsync({ from: url, to: dest });
        fileUri = dest;
      }

      const content = await FileSystem.readAsStringAsync(fileUri, {
        encoding: 'utf8',
      });

      let gmr: { app?: string; routes?: SavedRoute[] };
      try {
        gmr = JSON.parse(content);
      } catch {
        Alert.alert('Erreur', 'Le fichier est corrompu ou invalide.');
        return;
      }

      if (gmr.app !== 'GhostMap' || !Array.isArray(gmr.routes) || gmr.routes.length === 0) {
        Alert.alert('Erreur', 'Ce fichier n\'est pas un export GhostMap valide.');
        return;
      }

      let imported = 0;
      for (const route of gmr.routes) {
        const inserted = await insertRouteIfNotExists(route);
        if (inserted) imported++;
      }

      await loadRoutes();

      if (imported === 0) {
        Alert.alert('Import', 'Ce(s) parcours existe(nt) déjà dans votre bibliothèque.');
      } else {
        Alert.alert('Import réussi 🎉', `${imported} parcours importé(s) !`);
      }
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de lire le fichier.');
    }
  }, [loadRoutes]);

  // Initialize database and theme on startup
  useEffect(() => {
    const init = async () => {
      await getDb();
      loadTheme();
      loadCustom();
      await recoverUnfinishedSession();
      await loadRoutes();
    };
    init().catch(console.error);
  }, []);

  // Handle incoming .gmr files (deep link / file open)
  useEffect(() => {
    // App launched by opening a file
    Linking.getInitialURL().then((url) => {
      if (url && !url.startsWith('ghostmap://')) {
        handleIncomingFile(url);
      }
    });

    // File opened while app is running
    const sub = Linking.addEventListener('url', (event) => {
      if (event.url && !event.url.startsWith('ghostmap://')) {
        handleIncomingFile(event.url);
      }
    });

    return () => sub.remove();
  }, [handleIncomingFile]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={themeName === 'light' ? 'dark' : 'light'} />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
