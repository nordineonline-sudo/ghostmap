import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { SPACING, FONT_SIZE, BORDER_RADIUS, ThemeName, THEME_LABELS, THEMES } from '../constants/theme';
import { useRouteStore } from '../stores/routeStore';
import { useThemeStore } from '../stores/themeStore';
import { SavedRoute } from '../types';

const GMR_VERSION = 1;

interface GmrFile {
  version: number;
  app: string;
  exportedAt: string;
  routes: SavedRoute[];
}

export default function SettingsScreen() {
  const { routes, loadRoutes, addRoute } = useRouteStore();
  const { themeName, colors: COLORS, setTheme } = useThemeStore();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleExportAll = async () => {
    if (routes.length === 0) {
      Alert.alert('Aucun parcours', 'Il n\'y a aucun parcours à exporter.');
      return;
    }

    setExporting(true);
    try {
      const gmr: GmrFile = {
        version: GMR_VERSION,
        app: 'GhostMap',
        exportedAt: new Date().toISOString(),
        routes,
      };

      const fileName = `ghostmap_export_${Date.now()}.gmr`;
      const filePath = `${FileSystem.cacheDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(gmr), {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/json',
          dialogTitle: 'Exporter les parcours GhostMap',
          UTI: 'public.json',
        });
      } else {
        Alert.alert('Exporté', `Fichier sauvegardé: ${fileName}`);
      }
    } catch (e) {
      Alert.alert('Erreur', 'Impossible d\'exporter les parcours.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportSingle = async (route: SavedRoute) => {
    setExporting(true);
    try {
      const gmr: GmrFile = {
        version: GMR_VERSION,
        app: 'GhostMap',
        exportedAt: new Date().toISOString(),
        routes: [route],
      };

      const safeName = route.name.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${safeName}.gmr`;
      const filePath = `${FileSystem.cacheDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(gmr), {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/json',
          dialogTitle: `Exporter "${route.name}"`,
          UTI: 'public.json',
        });
      }
    } catch (e) {
      Alert.alert('Erreur', 'Impossible d\'exporter le parcours.');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) {
        setImporting(false);
        return;
      }

      const asset = result.assets[0];
      if (!asset.name.endsWith('.gmr')) {
        Alert.alert('Format invalide', 'Veuillez sélectionner un fichier .gmr');
        setImporting(false);
        return;
      }

      const content = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      let gmr: GmrFile;
      try {
        gmr = JSON.parse(content);
      } catch {
        Alert.alert('Erreur', 'Le fichier .gmr est corrompu ou invalide.');
        setImporting(false);
        return;
      }

      if (!gmr.app || gmr.app !== 'GhostMap' || !Array.isArray(gmr.routes)) {
        Alert.alert('Erreur', 'Ce fichier n\'est pas un export GhostMap valide.');
        setImporting(false);
        return;
      }

      const existingIds = new Set(routes.map((r) => r.id));
      const newRoutes = gmr.routes.filter((r) => !existingIds.has(r.id));

      if (newRoutes.length === 0) {
        Alert.alert('Import', 'Tous les parcours existent déjà.');
        setImporting(false);
        return;
      }

      for (const route of newRoutes) {
        await addRoute(route);
      }

      await loadRoutes();
      Alert.alert(
        'Import réussi',
        `${newRoutes.length} parcours importé(s) sur ${gmr.routes.length}.`,
      );
    } catch (e) {
      Alert.alert('Erreur', 'Impossible d\'importer le fichier.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: COLORS.background }]} contentContainerStyle={styles.content}>
      {/* Header */}
      <Text style={[styles.title, { color: COLORS.text }]}>Paramètres</Text>

      {/* Theme section */}
      <Text style={[styles.sectionTitle, { color: COLORS.textSecondary }]}>Thème</Text>
      <View style={[styles.card, { backgroundColor: COLORS.surface }]}>
        {(Object.keys(THEME_LABELS) as ThemeName[]).map((key, idx) => (
          <React.Fragment key={key}>
            {idx > 0 && <View style={[styles.separator, { backgroundColor: COLORS.border }]} />}
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => setTheme(key)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.themePreview,
                  { backgroundColor: THEMES[key].background, borderColor: THEMES[key].border },
                ]}
              >
                <View style={[styles.themePreviewDot, { backgroundColor: THEMES[key].primary }]} />
              </View>
              <View style={styles.actionText}>
                <Text style={[styles.actionLabel, { color: COLORS.text }]}>{THEME_LABELS[key]}</Text>
              </View>
              {themeName === key && (
                <Text style={{ fontSize: 18, color: COLORS.primary }}>✓</Text>
              )}
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </View>

      {/* Export / Import section */}
      <Text style={[styles.sectionTitle, { color: COLORS.textSecondary }]}>Import / Export (.gmr)</Text>
      <View style={[styles.card, { backgroundColor: COLORS.surface }]}>
        <TouchableOpacity
          style={styles.actionRow}
          onPress={handleImport}
          disabled={importing}
          activeOpacity={0.7}
        >
          {importing ? (
            <ActivityIndicator color={COLORS.primary} size="small" />
          ) : (
            <Text style={styles.actionIcon}>📥</Text>
          )}
          <View style={styles.actionText}>
            <Text style={[styles.actionLabel, { color: COLORS.text }]}>Importer un fichier .gmr</Text>
            <Text style={[styles.actionDesc, { color: COLORS.textSecondary }]}>Charger des parcours depuis un fichier</Text>
          </View>
        </TouchableOpacity>

        <View style={[styles.separator, { backgroundColor: COLORS.border }]} />

        <TouchableOpacity
          style={styles.actionRow}
          onPress={handleExportAll}
          disabled={exporting}
          activeOpacity={0.7}
        >
          {exporting ? (
            <ActivityIndicator color={COLORS.primary} size="small" />
          ) : (
            <Text style={styles.actionIcon}>📤</Text>
          )}
          <View style={styles.actionText}>
            <Text style={[styles.actionLabel, { color: COLORS.text }]}>Exporter tout ({routes.length})</Text>
            <Text style={[styles.actionDesc, { color: COLORS.textSecondary }]}>Sauvegarder tous les parcours en .gmr</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Individual export */}
      {routes.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: COLORS.textSecondary }]}>Exporter individuellement</Text>
          <View style={[styles.card, { backgroundColor: COLORS.surface }]}>
            {routes.map((route, idx) => (
              <React.Fragment key={route.id}>
                {idx > 0 && <View style={[styles.separator, { backgroundColor: COLORS.border }]} />}
                <TouchableOpacity
                  style={styles.actionRow}
                  onPress={() => handleExportSingle(route)}
                  disabled={exporting}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionIcon}>
                    {route.type === 'bike' ? '🚴' : '🚶'}
                  </Text>
                  <View style={styles.actionText}>
                    <Text style={[styles.actionLabel, { color: COLORS.text }]}>{route.name}</Text>
                    <Text style={[styles.actionDesc, { color: COLORS.textSecondary }]}>
                      {(route.distance / 1000).toFixed(1)} km · {route.date.slice(0, 10)}
                    </Text>
                  </View>
                  <Text style={styles.exportIcon}>📤</Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </>
      )}

      {/* About */}
      <Text style={[styles.sectionTitle, { color: COLORS.textSecondary }]}>À propos</Text>
      <View style={[styles.card, { backgroundColor: COLORS.surface }]}>
        <View style={styles.aboutRow}>
          <Text style={[styles.aboutLabel, { color: COLORS.textSecondary }]}>Version</Text>
          <Text style={[styles.aboutValue, { color: COLORS.text }]}>0.9.1.0</Text>
        </View>
        <View style={[styles.separator, { backgroundColor: COLORS.border }]} />
        <View style={styles.aboutRow}>
          <Text style={[styles.aboutLabel, { color: COLORS.textSecondary }]}>Format export</Text>
          <Text style={[styles.aboutValue, { color: COLORS.text }]}>.gmr (GhostMap Record)</Text>
        </View>
        <View style={[styles.separator, { backgroundColor: COLORS.border }]} />
        <View style={styles.aboutRow}>
          <Text style={[styles.aboutLabel, { color: COLORS.textSecondary }]}>Développeur</Text>
          <Text style={[styles.aboutValue, { color: COLORS.text }]}>mehiradev corp</Text>
        </View>
        <View style={[styles.separator, { backgroundColor: COLORS.border }]} />
        <View style={styles.aboutRow}>
          <Text style={[styles.aboutLabel, { color: COLORS.textSecondary }]}>Moteur IA</Text>
          <Text style={[styles.aboutValue, { color: COLORS.text }]}>powered by Claude</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  card: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  actionIcon: {
    fontSize: 22,
    width: 32,
    textAlign: 'center',
  },
  actionText: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  actionLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  actionDesc: {
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  exportIcon: {
    fontSize: 16,
    marginLeft: SPACING.sm,
  },
  separator: {
    height: 1,
    marginLeft: SPACING.md + 32 + SPACING.sm,
  },
  themePreview: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themePreviewDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  aboutLabel: {
    fontSize: FONT_SIZE.md,
  },
  aboutValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
});
