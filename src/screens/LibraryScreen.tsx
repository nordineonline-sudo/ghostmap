import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRouteStore } from '../stores/routeStore';
import { RootStackParamList, RouteType, SavedRoute } from '../types';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/theme';
import RouteCard from '../components/RouteCard';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function LibraryScreen() {
  const navigation = useNavigation<NavProp>();
  const { routes, loading, loadRoutes, deleteRoute } = useRouteStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<RouteType | 'all'>('all');

  useEffect(() => {
    loadRoutes();
  }, []);

  const filteredRoutes = routes.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || r.type === filter;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Supprimer', `Supprimer "${name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => deleteRoute(id),
      },
    ]);
  };

  const handleShare = async (route: SavedRoute) => {
    try {
      const gmr = {
        version: 1,
        app: 'GhostMap',
        exportedAt: new Date().toISOString(),
        routes: [route],
      };
      const safeName = route.name.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${safeName}.gmr`;
      const filePath = `${FileSystem.cacheDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(gmr), {
        encoding: 'utf8',
      });

      // Try native file sharing first (best for .gmr attachment)
      try {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(filePath, {
            mimeType: 'application/octet-stream',
            dialogTitle: `Partager "${route.name}"`,
          });
          return;
        }
      } catch (shareErr) {
        console.warn('expo-sharing failed, falling back to RN Share:', shareErr);
      }

      // Fallback: use React Native Share API (text-based)
      await Share.share({
        title: `GhostMap - ${route.name}`,
        message: `Voici mon parcours "${route.name}" sur GhostMap !\n\n${JSON.stringify(gmr)}`,
      });
    } catch (e: any) {
      console.error('Share error:', e);
      Alert.alert('Erreur de partage', e?.message || 'Impossible de partager le parcours.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📚 Mes Parcours</Text>
        <Text style={styles.count}>
          {filteredRoutes.length} parcours
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="🔍 Rechercher..."
          placeholderTextColor={COLORS.textSecondary}
        />
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {(['all', 'bike', 'walk'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {f === 'all' ? '🗂 Tous' : f === 'bike' ? '🚴 Vélo' : '🚶 Marche'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Routes list */}
      <FlatList
        data={filteredRoutes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadRoutes}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🗺️</Text>
            <Text style={styles.emptyText}>
              {search || filter !== 'all'
                ? 'Aucun parcours trouvé'
                : 'Aucun parcours enregistré\nLancez votre premier tracking !'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <RouteCard
            route={item}
            onPress={() => navigation.navigate('Replay', { routeId: item.id })}
            onReplay={() => navigation.navigate('Replay', { routeId: item.id })}
            onGhost={() => navigation.navigate('Ghost', { routeId: item.id })}
            onShare={() => handleShare(item)}
            onDelete={() => handleDelete(item.id, item.name)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.md,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
  },
  count: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
  },
  searchRow: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    padding: SPACING.md,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  filterBtn: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  filterTextActive: {
    color: COLORS.white,
  },
  list: {
    paddingBottom: SPACING.xxl,
  },
  empty: {
    alignItems: 'center',
    paddingTop: SPACING.xxl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    lineHeight: 24,
  },
});
